const normalizeApiBase = (value: string) => {
  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const isAbsoluteHttpUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));

const toApiBaseFromHostPort = (value: string) =>
  isAbsoluteHttpUrl(value) ? normalizeApiBase(value) : normalizeApiBase(`http://${value}`);

export const getBackendBaseCandidates = () => {
  const localCandidates: string[] = [];
  const remoteCandidates: string[] = [];
  const addUnique = (target: string[], value: string) => {
    if (!target.includes(value)) {
      target.push(value);
    }
  };

  const backendPort = process.env.BACKEND_PORT;

  if (backendPort) {
    addUnique(localCandidates, normalizeApiBase(`http://127.0.0.1:${backendPort}`));
    addUnique(localCandidates, normalizeApiBase(`http://localhost:${backendPort}`));
  }

  addUnique(localCandidates, "http://127.0.0.1:5001/api");
  addUnique(localCandidates, "http://127.0.0.1:5000/api");
  addUnique(localCandidates, "http://localhost:5001/api");
  addUnique(localCandidates, "http://localhost:5000/api");

  if (process.env.BACKEND_INTERNAL_URL) {
    addUnique(remoteCandidates, normalizeApiBase(process.env.BACKEND_INTERNAL_URL));
  }

  if (process.env.BACKEND_HOSTPORT) {
    addUnique(remoteCandidates, toApiBaseFromHostPort(process.env.BACKEND_HOSTPORT));
  }

  if (isAbsoluteHttpUrl(process.env.NEXT_PUBLIC_API_URL)) {
    addUnique(remoteCandidates, normalizeApiBase(process.env.NEXT_PUBLIC_API_URL as string));
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return [...remoteCandidates, ...localCandidates];
  }

  return [...localCandidates, ...remoteCandidates];
};

export const resolvePrimaryBackendBaseUrl = () => getBackendBaseCandidates()[0];

export const shouldTryNextBackendCandidate = (status?: number) =>
  status === 404 || status === 502 || status === 503 || status === 504;
