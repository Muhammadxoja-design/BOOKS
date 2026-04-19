import { spawn } from "node:child_process";

const isProduction = process.env.NODE_ENV === "production";
const isRender = Boolean(
  process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.RENDER_EXTERNAL_URL,
);
const isCombinedRenderRuntime = isRender && isProduction;
const frontendPort = String(process.env.PORT || 3000);
const backendPort = process.env.BACKEND_PORT || "5001";
const backendInternalUrl = `http://127.0.0.1:${backendPort}/api`;
const isWindows = process.platform === "win32";

if (isCombinedRenderRuntime && process.env.ALLOW_COMBINED_RENDER_SERVICE !== "true") {
  console.warn(
    [
      "This repository is running from the repo root on Render.",
      "Recommended setup is still to deploy the services separately:",
      "- backend service: rootDir=backend, startCommand='npm run start'",
      "- frontend service: rootDir=frontend, startCommand='npm run start'",
      "Continuing in combined-service mode because this runtime is already using the repo root.",
      "Set ALLOW_COMBINED_RENDER_SERVICE=true to silence this warning.",
    ].join("\n"),
  );
}

const processes = [];
let exiting = false;

const workspaceCommand = (workspace, script, extraEnv = {}) => {
  const command = isWindows ? "cmd.exe" : "npm";
  const args = isWindows
    ? ["/d", "/s", "/c", "npm", "run", script, "--workspace", workspace]
    : ["run", script, "--workspace", workspace];
  const child = spawn(
    command,
    args,
    {
      stdio: "inherit",
      env: {
        ...process.env,
        ...extraEnv,
      },
    },
  );

  child.on("exit", (code, signal) => {
    if (exiting) {
      return;
    }

    if (isCombinedRenderRuntime && workspace === "backend") {
      console.error(
        `Backend process exited${signal ? ` with signal ${signal}` : ` with code ${code ?? 0}`}. Frontend will stay up, but /backend/* requests may fail until the backend is healthy again.`,
      );
      return;
    }

    exiting = true;

    for (const proc of processes) {
      if (proc.pid && proc.pid !== child.pid) {
        proc.kill("SIGTERM");
      }
    }

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });

  processes.push(child);
};

const shutdown = (signal) => {
  if (exiting) {
    return;
  }

  exiting = true;

  for (const proc of processes) {
    if (proc.pid) {
      proc.kill(signal);
    }
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

workspaceCommand("backend", isProduction ? "start" : "dev", {
  PORT: backendPort,
  ...(isCombinedRenderRuntime
    ? {
        REQUIRE_DB_ON_START: process.env.REQUIRE_DB_ON_START || "false",
      }
    : {}),
});

workspaceCommand("frontend", isProduction ? "start" : "dev", {
  PORT: frontendPort,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/backend",
  BACKEND_INTERNAL_URL: backendInternalUrl,
  BACKEND_PORT: backendPort,
});
