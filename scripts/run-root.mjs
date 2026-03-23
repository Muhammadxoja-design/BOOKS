import { spawn } from "node:child_process";

const isProduction = process.env.NODE_ENV === "production";
const frontendPort = String(process.env.PORT || 3000);
const backendPort = process.env.BACKEND_PORT || "5001";
const backendInternalUrl = `http://127.0.0.1:${backendPort}/api`;

const processes = [];
let exiting = false;

const workspaceCommand = (workspace, script, extraEnv = {}) => {
  const child = spawn(
    "npm",
    ["run", script, "--workspace", workspace],
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
});

workspaceCommand("frontend", isProduction ? "start" : "dev", {
  PORT: frontendPort,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/backend",
  BACKEND_INTERNAL_URL: backendInternalUrl,
  BACKEND_PORT: backendPort,
});
