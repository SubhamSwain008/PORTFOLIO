// ─────────────────────────────────────────────────────────────────
//  Resilient fetch wrapper: timeout + retry + latency tracking
// ─────────────────────────────────────────────────────────────────
//
//  All game/auth API calls should go through `netFetch` instead of raw
//  `fetch`, so we can:
//    • Apply a timeout (default 15s) so requests never hang forever
//    • Retry transient failures with exponential backoff
//    • Distinguish "fetch failed / timed out" from "server said 401" —
//      a real 401 means logged out, a timeout means retry.
//    • Surface latency + failure data into the network HUD.
//
//  NOTE: This module is safe to import on the server (only the browser
//  path uses window events).

export interface NetFetchOptions extends RequestInit {
  /** Milliseconds before aborting. Default: 15000. */
  timeoutMs?: number;
  /** Number of retry attempts after the first failure. Default: 2. */
  retries?: number;
  /** Initial backoff delay in ms (doubles each retry). Default: 500. */
  backoffMs?: number;
  /** If false, do NOT retry GET/HEAD on 5xx errors. Default: true. */
  retryOnServerError?: boolean;
}

export class NetFetchError extends Error {
  kind: "timeout" | "network" | "abort" | "server" | "unknown";
  status?: number;
  constructor(kind: NetFetchError["kind"], message: string, status?: number) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}

// ─── Latency + failure telemetry dispatcher ──────────────────────
// The NetworkMonitor HUD subscribes to these events. Doing it via
// window events keeps this module zero-dep and usable anywhere.

interface NetSample {
  latencyMs: number;
  ok: boolean;
  url: string;
  kind?: NetFetchError["kind"];
  status?: number;
}

function emitSample(sample: NetSample) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent<NetSample>("net:sample", { detail: sample }));
  } catch {
    /* ignore */
  }
}

// ─── Single attempt with AbortController timeout ─────────────────

async function fetchOnce(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const userSignal = init.signal;
  if (userSignal) {
    if (userSignal.aborted) ctrl.abort();
    else userSignal.addEventListener("abort", () => ctrl.abort(), { once: true });
  }
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return (input as Request).url ?? "";
}

// ─── Public API ──────────────────────────────────────────────────

export async function netFetch(
  input: RequestInfo | URL,
  options: NetFetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 15000,
    retries = 2,
    backoffMs = 500,
    retryOnServerError = true,
    ...init
  } = options;

  const method = (init.method || "GET").toUpperCase();
  const url = urlOf(input);
  const isIdempotent = method === "GET" || method === "HEAD";

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const start = performance.now?.() ?? Date.now();
    try {
      const res = await fetchOnce(input, init, timeoutMs);
      const latency = (performance.now?.() ?? Date.now()) - start;

      // 5xx → retry for idempotent requests; 4xx → return as-is
      if (res.status >= 500 && res.status < 600 && retryOnServerError && isIdempotent && attempt < retries) {
        emitSample({ latencyMs: latency, ok: false, url, kind: "server", status: res.status });
        await wait(backoffMs * Math.pow(2, attempt));
        continue;
      }

      emitSample({ latencyMs: latency, ok: res.ok, url, status: res.status });
      return res;
    } catch (err) {
      lastErr = err;
      const latency = (performance.now?.() ?? Date.now()) - start;
      const aborted = (err as { name?: string })?.name === "AbortError";
      const kind: NetFetchError["kind"] = aborted ? "timeout" : "network";
      emitSample({ latencyMs: latency, ok: false, url, kind });

      // Don't retry non-idempotent requests on network errors unless
      // the caller explicitly opted in via higher `retries` — actually
      // DO retry; the server should be idempotent on our writes (upserts).
      if (attempt < retries) {
        await wait(backoffMs * Math.pow(2, attempt));
        continue;
      }
      throw new NetFetchError(kind, aborted ? `Request timed out after ${timeoutMs}ms` : "Network error");
    }
  }

  throw new NetFetchError("unknown", lastErr instanceof Error ? lastErr.message : "Unknown error");
}

// ─── Convenience JSON helpers ────────────────────────────────────

export async function netFetchJson<T = unknown>(
  input: RequestInfo | URL,
  options: NetFetchOptions = {}
): Promise<T> {
  const res = await netFetch(input, options);
  if (!res.ok) {
    throw new NetFetchError("server", `HTTP ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

// Fire-and-forget POST (for auto-saves where we don't block UI on it).
// Never throws; swallows all errors but still emits samples.
export function netPostBackground(
  input: RequestInfo | URL,
  body: unknown,
  options: NetFetchOptions = {}
): void {
  netFetch(input, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // Writes are idempotent upserts, safe to retry
    retries: 2,
    timeoutMs: 12000,
    ...options,
  }).catch(() => {
    /* swallow — telemetry already emitted */
  });
}
