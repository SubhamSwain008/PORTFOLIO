import { useEffect } from "react";
import * as THREE from "three";
import { getSessionState } from "./useSessionStore";
import { setSavingStatus } from "./SaveIndicator";
import { AUTOSAVE } from "./settings/settings";
import { netPostBackground } from "@/lib/netFetch";

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
      // Retryable background save — never blocks UI
      netPostBackground(
        "/api/game/save-position",
        { x: pos.x, y: pos.y, z: pos.z, world },
        { timeoutMs: 10000, retries: 1 }
      );
    }, AUTOSAVE.INTERVAL_MS);

    return () => clearInterval(interval);
  }, [playerPosRef, world]);

  return null;
}
