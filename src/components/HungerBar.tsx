"use client";

import { useHungerStore } from "./useHungerStore";
import { useSessionStore } from "./useSessionStore";

export default function HungerBar() {
  const hunger = useHungerStore((s) => s.hunger);
  const appPhase = useSessionStore((s) => s.appPhase);

  // Only show during active gameplay
  if (appPhase !== "game") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
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
          color: "rgba(255,255,255,0.6)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(255, 100, 50, 0.5)",
          transition: "color 0.2s ease",
        }}
      >
        Hunger
      </div>

      {/* Bar Background */}
      <div
        style={{
          width: "100%",
          height: 6,
          background: "rgba(10, 10, 15, 0.6)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, hunger))}%`,
            background: "linear-gradient(90deg, #aa4400, #ff6622)",
            borderRadius: 2,
            boxShadow: "0 0 10px rgba(255, 100, 50, 0.8)",
            transition: "width 1s linear, background 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
