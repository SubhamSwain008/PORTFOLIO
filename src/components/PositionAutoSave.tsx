import { useEffect } from "react";
import * as THREE from "three";
import { getSessionState } from "./useSessionStore";
import { setSavingStatus } from "./SaveIndicator";
import { AUTOSAVE } from "./settings/settings";

interface PositionAutoSaveProps {
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  world: string;
}

// ─── Position Auto-Save (every 15s, login mode only) ─────
export default function PositionAutoSave({ playerPosRef, world }: PositionAutoSaveProps) {
  useEffect(() => {
    const interval = setInterval(() => {
      const session = getSessionState();
      if (session.mode !== "login") return;

      const pos = playerPosRef.current;
      setSavingStatus("Saving…");
      fetch("/api/game/save-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: pos.x, y: pos.y, z: pos.z, world }),
      }).catch(() => {}); // silent fail
    }, AUTOSAVE.INTERVAL_MS);

    return () => clearInterval(interval);
  }, [playerPosRef]);

  return null;
}
