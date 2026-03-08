"use client";

import { useStaminaStore } from "./useStaminaStore";
import { useSessionStore } from "./useSessionStore";

export default function StaminaBar() {
  const stamina = useStaminaStore((s) => s.stamina);
  const isSprinting = useStaminaStore((s) => s.isSprinting);
  const appPhase = useSessionStore((s) => s.appPhase);

  // Only show during active gameplay
  if (appPhase !== "game") return null;

  // Don't show if full and not sprinting
  const opacity = stamina >= 99.9 && !isSprinting ? 0 : 1;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 1000,
        transition: "opacity 0.5s ease",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          color: isSprinting ? "#fff" : "rgba(255,255,255,0.6)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(154, 106, 255, 0.5)",
          transition: "color 0.2s ease",
        }}
      >
        Stamina
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
            width: `${stamina}%`,
            background: isSprinting 
              ? "linear-gradient(90deg, #b08dff, #d4bdff)"
              : "linear-gradient(90deg, #6a3a9a, #9a6aff)",
            borderRadius: 2,
            boxShadow: "0 0 10px rgba(154, 106, 255, 0.8)",
            transition: "background 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
