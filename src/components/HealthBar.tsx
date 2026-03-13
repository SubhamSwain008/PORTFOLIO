"use client";

import { useHealthStore } from "./useHealthStore";
import { useSessionStore } from "./useSessionStore";
import { HEALTH } from "./settings/settings";

export default function HealthBar() {
  const health = useHealthStore((s) => s.health);
  const appPhase = useSessionStore((s) => s.appPhase);

  // Only show during active gameplay
  if (appPhase !== "game") return null;

  // Color shifts from green to red as health decreases
  const healthPct = Math.max(0, Math.min(100, health));
  const isLow = healthPct <= 30;
  const isCritical = healthPct <= 15;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(calc(-50% + 280px))",
        width: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 1000,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          color: isCritical
            ? "#ff4444"
            : isLow
            ? "#ff8844"
            : "rgba(255,255,255,0.6)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textShadow: isCritical
            ? "0 0 10px rgba(255, 50, 50, 0.8)"
            : "0 0 10px rgba(50, 200, 80, 0.5)",
          transition: "color 0.3s ease, text-shadow 0.3s ease",
        }}
      >
        ❤️ Health
      </div>

      {/* Bar Background */}
      <div
        style={{
          width: "100%",
          height: 6,
          background: "rgba(10, 10, 15, 0.6)",
          backdropFilter: "blur(4px)",
          border: `1px solid ${
            isCritical
              ? "rgba(255, 50, 50, 0.4)"
              : "rgba(255, 255, 255, 0.15)"
          }`,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: isCritical
            ? "0 4px 12px rgba(255, 0, 0, 0.3)"
            : "0 4px 12px rgba(0, 0, 0, 0.5)",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${healthPct}%`,
            background: isCritical
              ? "linear-gradient(90deg, #cc0000, #ff2222)"
              : isLow
              ? "linear-gradient(90deg, #cc4400, #ff6622)"
              : "linear-gradient(90deg, #22aa44, #44dd66)",
            borderRadius: 2,
            boxShadow: isCritical
              ? "0 0 10px rgba(255, 0, 0, 0.8)"
              : "0 0 10px rgba(50, 200, 80, 0.6)",
            transition:
              "width 1s linear, background 0.3s ease, box-shadow 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
