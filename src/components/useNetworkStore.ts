"use client";

import { useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────
// Classification from worst → best:
//   offline     — no connection at all
//   unplayable  — ping >1500ms or consecutive failures ≥ 3
//   poor        — ping 700–1500ms, stutters likely
//   playable    — ping 300–700ms, generally ok
//   good        — ping 120–300ms
//   best        — ping <120ms
export type NetQuality =
  | "offline"
  | "unplayable"
  | "poor"
  | "playable"
  | "good"
  | "best"
  | "unknown";

export interface NetworkState {
  online: boolean;
  latencyMs: number | null;     // last measured round-trip
  emaLatencyMs: number | null;  // smoothed (EMA) latency
  quality: NetQuality;
  consecutiveFailures: number;
  lastCheckedAt: number | null;
  checking: boolean;
}

let state: NetworkState = {
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  latencyMs: null,
  emaLatencyMs: null,
  quality: "unknown",
  consecutiveFailures: 0,
  lastCheckedAt: null,
  checking: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

export function getNetworkState(): NetworkState {
  return state;
}

function setNetworkState(partial: Partial<NetworkState>) {
  state = { ...state, ...partial };
  emit();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useNetworkStore<T>(selector: (s: NetworkState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}

// ─── Classify ─────────────────────────────────────────────
function classify(latencyMs: number | null, online: boolean, consecutiveFailures: number): NetQuality {
  if (!online) return "offline";
  if (consecutiveFailures >= 3) return "unplayable";
  if (latencyMs == null) return "unknown";
  if (latencyMs < 120) return "best";
  if (latencyMs < 300) return "good";
  if (latencyMs < 700) return "playable";
  if (latencyMs < 1500) return "poor";
  return "unplayable";
}

// Exponential Moving Average — smooths spiky samples
function ema(prev: number | null, sample: number, alpha = 0.35): number {
  if (prev == null) return sample;
  return prev * (1 - alpha) + sample * alpha;
}

// ─── Active ping loop ─────────────────────────────────────
let pingTimer: ReturnType<typeof setInterval> | null = null;

async function pingOnce(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!navigator.onLine) {
    setNetworkState({
      online: false,
      quality: "offline",
    });
    return;
  }
  setNetworkState({ checking: true });
  const start = performance.now();
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("/api/ping", {
      method: "GET",
      cache: "no-store",
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    const latency = performance.now() - start;
    if (res.ok) {
      const newEma = ema(state.emaLatencyMs, latency);
      const consecutiveFailures = 0;
      setNetworkState({
        online: true,
        latencyMs: latency,
        emaLatencyMs: newEma,
        consecutiveFailures,
        quality: classify(newEma, true, consecutiveFailures),
        lastCheckedAt: Date.now(),
        checking: false,
      });
      return;
    }
    // Non-ok response is treated like a failure
    throw new Error("ping non-ok");
  } catch {
    const latency = performance.now() - start;
    const consecutiveFailures = state.consecutiveFailures + 1;
    setNetworkState({
      online: navigator.onLine,
      latencyMs: latency,
      consecutiveFailures,
      quality: classify(state.emaLatencyMs, navigator.onLine, consecutiveFailures),
      lastCheckedAt: Date.now(),
      checking: false,
    });
  }
}

// ─── Passive sample ingestion (from netFetch) ─────────────
interface NetSample {
  latencyMs: number;
  ok: boolean;
  url: string;
  kind?: string;
  status?: number;
}

function onNetSample(e: Event) {
  const d = (e as CustomEvent<NetSample>).detail;
  if (!d) return;
  // Ignore ping endpoint to avoid double-counting (active loop handles it)
  if (d.url.includes("/api/ping")) return;

  if (d.ok) {
    const newEma = ema(state.emaLatencyMs, d.latencyMs);
    setNetworkState({
      emaLatencyMs: newEma,
      latencyMs: d.latencyMs,
      consecutiveFailures: 0,
      online: true,
      quality: classify(newEma, true, 0),
      lastCheckedAt: Date.now(),
    });
  } else {
    const consecutiveFailures = state.consecutiveFailures + 1;
    setNetworkState({
      consecutiveFailures,
      quality: classify(state.emaLatencyMs, navigator.onLine, consecutiveFailures),
      lastCheckedAt: Date.now(),
    });
  }
}

// ─── Lifecycle ────────────────────────────────────────────
export function startNetworkMonitor(intervalMs = 12000) {
  if (typeof window === "undefined") return () => {};
  if (pingTimer) return () => {}; // already started

  const onOnline = () => setNetworkState({ online: true });
  const onOffline = () =>
    setNetworkState({
      online: false,
      quality: "offline",
    });

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  window.addEventListener("net:sample", onNetSample as EventListener);

  // Kick off an immediate ping, then on an interval
  pingOnce();
  pingTimer = setInterval(pingOnce, intervalMs);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    window.removeEventListener("net:sample", onNetSample as EventListener);
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = null;
  };
}

// Quality → human label + color
export function qualityLabel(q: NetQuality): string {
  switch (q) {
    case "best": return "Best";
    case "good": return "Good";
    case "playable": return "Playable";
    case "poor": return "Adjustable";
    case "unplayable": return "Unplayable";
    case "offline": return "Offline";
    default: return "Checking…";
  }
}

export function qualityColor(q: NetQuality): string {
  switch (q) {
    case "best": return "#4ade80";       // green
    case "good": return "#84cc16";       // lime
    case "playable": return "#eab308";   // yellow
    case "poor": return "#f97316";       // orange
    case "unplayable": return "#ef4444"; // red
    case "offline": return "#6b7280";    // gray
    default: return "#94a3b8";           // slate
  }
}
