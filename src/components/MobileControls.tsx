"use client";

import { useEffect, useState } from "react";
import { useGameStore, getGameState } from "./useGameStore";
import { useInventoryStore } from "./inventory/inventory";

// Helper to simulate keyboard events for the game's existing listeners
const simulateKey = (key: string, type: "keydown" | "keyup") => {
  const event = new KeyboardEvent(type, {
    key,
    code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
    bubbles: true,
  });
  window.dispatchEvent(event);
};

export default function MobileControls() {
  const [isTouch, setIsTouch] = useState(false);
  const gameMode = useGameStore((s) => s.gameMode);

  useEffect(() => {
    // Basic touch detection
    const checkTouch = () => {
      setIsTouch(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkTouch();
    // Re-check on resize in case devtools toggles device mode
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  // Only render on touch devices during active gameplay
  if (!isTouch || gameMode !== "explore") return null;

  const btnStyle: React.CSSProperties = {
    background: "rgba(50, 40, 80, 0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "2px solid rgba(150, 120, 220, 0.4)",
    borderRadius: "50%",
    color: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none", // Prevent scrolling when touching buttons
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  };

  const activeStyle: React.CSSProperties = {
    background: "rgba(100, 80, 160, 0.8)",
    borderColor: "rgba(200, 180, 255, 0.8)",
    transform: "scale(0.95)",
  };

  interface ControlButtonProps {
    actKey: string;
    label: React.ReactNode;
    style?: React.CSSProperties;
  }

  const ControlButton = ({ actKey, label, style }: ControlButtonProps) => {
    const [active, setActive] = useState(false);

    return (
      <div
        style={{ ...btnStyle, ...style, ...(active ? activeStyle : {}) }}
        onTouchStart={(e) => {
          e.preventDefault();
          setActive(true);
          simulateKey(actKey, "keydown");
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          setActive(false);
          simulateKey(actKey, "keyup");
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          setActive(false);
          simulateKey(actKey, "keyup");
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 500, // Below inventory (1000) but above canvas
      }}
    >
      {/* ─── D-PAD (Left Side) ─── */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 30,
          width: 150,
          height: 150,
          pointerEvents: "auto",
        }}
      >
        <ControlButton
          actKey="w"
          label="▲"
          style={{ position: "absolute", top: 0, left: 50, width: 50, height: 50 }}
        />
        <ControlButton
          actKey="s"
          label="▼"
          style={{ position: "absolute", bottom: 0, left: 50, width: 50, height: 50 }}
        />
        <ControlButton
          actKey="a"
          label="◀"
          style={{ position: "absolute", top: 50, left: 0, width: 50, height: 50 }}
        />
        <ControlButton
          actKey="d"
          label="▶"
          style={{ position: "absolute", top: 50, right: 0, width: 50, height: 50 }}
        />
      </div>

      {/* ─── ACTION BUTTONS (Right Side) ─── */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 30,
          width: 150,
          height: 150,
          pointerEvents: "auto",
        }}
      >
        {/* Action / Interact (X) */}
        <ControlButton
          actKey="x"
          label="X"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 60,
            height: 60,
            background: "rgba(220, 100, 50, 0.6)",
            borderColor: "rgba(255, 150, 100, 0.4)",
            fontSize: "20px",
          }}
        />

        {/* Sprint (Shift) */}
        <ControlButton
          actKey="Shift"
          label="⚡"
          style={{
            position: "absolute",
            top: 20,
            right: 0,
            width: 55,
            height: 55,
            fontSize: "22px",
          }}
        />
      </div>
    </div>
  );
}
