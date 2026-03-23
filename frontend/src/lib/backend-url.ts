const normalizeApiBase = (value: string) => {
  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const isAbsoluteHttpUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));

export const getBackendBaseCandidates = () => {
  const candidates = new Set<string>();

  if (process.env.BACKEND_INTERNAL_URL) {
    candidates.add(normalizeApiBase(process.env.BACKEND_INTERNAL_URL));
  }

  if (process.env.BACKEND_HOSTPORT) {
    candidates.add(normalizeApiBase(`http://${process.env.BACKEND_HOSTPORT}`));
  }

  if (isAbsoluteHttpUrl(process.env.NEXT_PUBLIC_API_URL)) {
    candidates.add(normalizeApiBase(process.env.NEXT_PUBLIC_API_URL as string));
  }

  const backendPort = process.env.BACKEND_PORT;

  if (backendPort) {
    candidates.add(normalizeApiBase(`http://127.0.0.1:${backendPort}`));
  }

  candidates.add("http://127.0.0.1:5001/api");
  candidates.add("http://127.0.0.1:5000/api");
  candidates.add("http://localhost:5001/api");
  candidates.add("http://localhost:5000/api");

  return [...candidates];
};

export const resolvePrimaryBackendBaseUrl = () => getBackendBaseCandidates()[0];

export const shouldTryNextBackendCandidate = (status?: number) =>
  status === 404 || status === 502 || status === 503 || status === 504;
