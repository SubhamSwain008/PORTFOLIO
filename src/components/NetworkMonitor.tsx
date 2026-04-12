"use client";

import { useEffect, useState } from "react";
import {
  useNetworkStore,
  startNetworkMonitor,
  qualityLabel,
  qualityColor,
} from "./useNetworkStore";

// Top-left HUD showing live network quality.
// Color-coded dot + ping (ms) + status label.
// Click to expand for detail; auto-expands when offline/unplayable.

export default function NetworkMonitor() {
  const quality = useNetworkStore((s) => s.quality);
  const emaLatency = useNetworkStore((s) => s.emaLatencyMs);
  const online = useNetworkStore((s) => s.online);
  const failures = useNetworkStore((s) => s.consecutiveFailures);
  const checking = useNetworkStore((s) => s.checking);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stop = startNetworkMonitor(12000);
    return stop;
  }, []);

  // Auto-expand when in a degraded state, auto-collapse when recovered
  useEffect(() => {
    if (quality === "offline" || quality === "unplayable" || quality === "poor") {
      setExpanded(true);
    }
  }, [quality]);

  const color = qualityColor(quality);
  const label = qualityLabel(quality);
  const pingText =
    emaLatency == null
      ? (checking ? "…" : "—")
      : `${Math.round(emaLatency)} ms`;

  let subtext = "";
  if (!online) subtext = "No connection — changes won't save";
  else if (quality === "unplayable") subtext = failures > 0 ? "Server unreachable — retrying" : "Severe lag";
  else if (quality === "poor") subtext = "High latency — expect stutters";
  else if (quality === "playable") subtext = "Playable, some delay";
  else if (quality === "good") subtext = "Smooth connection";
  else if (quality === "best") subtext = "Excellent";

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        position: "fixed",
        top: 14,
        left: 14,
        zIndex: 9500,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: expanded ? "8px 12px" : "6px 10px",
        background: "rgba(10, 10, 20, 0.72)",
        border: `1px solid ${color}55`,
        borderRadius: 8,
        fontFamily: "monospace, 'Menlo'",
        fontSize: "0.75rem",
        color: "#e8d8c0",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.4)`,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.25s ease",
        minWidth: expanded ? 180 : "auto",
      }}
      title="Click to toggle network details"
    >
      {/* Pulsing status dot */}
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
          animation:
            quality === "offline" || quality === "unplayable"
              ? "netPulseFast 0.9s ease-in-out infinite"
              : "netPulse 2.2s ease-in-out infinite",
        }}
      />
      <span style={{ color, fontWeight: 600, letterSpacing: "0.06em" }}>
        {pingText}
      </span>
      <span style={{ opacity: 0.6 }}>|</span>
      <span style={{ color, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.7rem" }}>
        {label}
      </span>

      {expanded && subtext && (
        <span
          style={{
            marginLeft: 8,
            paddingLeft: 8,
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            color: "#bcb3a5",
            fontSize: "0.68rem",
            letterSpacing: "0.04em",
          }}
        >
          {subtext}
        </span>
      )}

      <style>{`
        @keyframes netPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.85); }
        }
        @keyframes netPulseFast {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3;  transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
