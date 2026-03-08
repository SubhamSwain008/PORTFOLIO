"use client";

import { useSyncExternalStore } from "react";

// ─── Saving Status Store (no re-render spam) ─────────────
interface SavingState {
  visible: boolean;
  text: string;
}

let savingState: SavingState = { visible: false, text: "" };
type Listener = () => void;
const savingListeners = new Set<Listener>();

function emitSavingChange() {
  for (const l of savingListeners) l();
}

export function setSavingStatus(text: string) {
  savingState = { visible: true, text };
  emitSavingChange();
  // Auto-hide after 1.5s
  setTimeout(() => {
    savingState = { visible: false, text: "" };
    emitSavingChange();
  }, 1500);
}

function subscribeSaving(listener: Listener) {
  savingListeners.add(listener);
  return () => savingListeners.delete(listener);
}

function getSavingSnapshot() {
  return savingState;
}

export default function SaveIndicator() {
  const state = useSyncExternalStore(
    subscribeSaving,
    getSavingSnapshot,
    getSavingSnapshot
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 20,
        zIndex: 9998,
        pointerEvents: "none",
        opacity: state.visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* Tiny spinning dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "#9a6aff",
          animation: state.visible ? "saveSpin 0.8s linear infinite" : "none",
        }}
      />
      <span
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "0.75rem",
          color: "rgba(200, 190, 220, 0.8)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {state.text || "Saving…"}
      </span>
      <style>{`@keyframes saveSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
