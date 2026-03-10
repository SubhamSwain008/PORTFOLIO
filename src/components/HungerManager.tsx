import { useEffect } from "react";
import { getHungerState, setHungerState } from "./useHungerStore";
import { getSessionState } from "./useSessionStore";

export default function HungerManager() {
  useEffect(() => {
    // 15 minutes = 900 seconds
    const intervalTime = 1000;
    const dropPerSecond = 100 / 900; // ~0.111 per second

    // Local state decay
    const decayInterval = setInterval(() => {
      const session = getSessionState();
      if (session.appPhase !== "game") return;

      const current = getHungerState().hunger;
      const next = Math.max(0, current - dropPerSecond);
      setHungerState({ hunger: next });
    }, intervalTime);

    // Save to DB every 60 seconds
    const dbInterval = setInterval(() => {
      const session = getSessionState();
      // Only hit db if correctly logged in
      if (session.mode !== "login") return;

      const current = getHungerState().hunger;
      fetch("/api/game/save-hunger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hunger: current }),
      }).catch((err) => {
        console.error("Failed to save hunger", err);
      });
    }, 60000);

    return () => {
      clearInterval(decayInterval);
      clearInterval(dbInterval);
    };
  }, []);

  return null;
}
