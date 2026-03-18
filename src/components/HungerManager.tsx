import { useEffect } from "react";
import { getHungerState, setHungerState } from "./useHungerStore";
import { getHealthState, setHealthState } from "./useHealthStore";
import { getStaminaState, setStaminaState } from "./useStaminaStore";
import { getSessionState } from "./useSessionStore";
import { getGameState, setGameState } from "./useGameStore";
import { setInventoryState } from "./inventory/inventory";
import {
  HUNGER,
  HUNGER_DRAIN_PER_SECOND,
  HEALTH,
} from "./settings/settings";

export default function HungerManager() {
  useEffect(() => {
    const intervalTime = 1000;

    // ─── Local state decay (every second) ───
    const decayInterval = setInterval(() => {
      const session = getSessionState();
      if (session.appPhase !== "game") return;

      const game = getGameState();
      if (game.isDead || game.isPaused) return;

      // ─── Hunger decay ───
      const currentHunger = getHungerState().hunger;
      const nextHunger = Math.max(0, currentHunger - HUNGER_DRAIN_PER_SECOND);
      setHungerState({ hunger: nextHunger });

      // ─── Stamina lock when hunger ≤ threshold ───
      if (nextHunger <= HUNGER.STAMINA_LOCK_THRESHOLD) {
        setStaminaState({ stamina: 0, isSprinting: false });
      }

      // ─── Health decay when hunger is 0 ───
      const currentHealth = getHealthState().health;
      if (nextHunger <= 0 && currentHealth > 0) {
        const nextHealth = Math.max(0, currentHealth - HEALTH.DRAIN_PER_SECOND);
        setHealthState({ health: nextHealth });

        // ─── Death check ───
        if (nextHealth <= 0) {
          // Defer state mutations to avoid crashing R3F render cycle
          setTimeout(() => {
            setGameState({ isDead: true, deathCause: "starvation" });
            // Only wipe player inventory items, keep worldItems intact
            setInventoryState({ items: [] });
            fetch("/api/game/save-death", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }).catch(() => {});
          }, 0);
        }
      }
    }, intervalTime);

    // ─── Save hunger + health to DB every 60 seconds ───
    const dbInterval = setInterval(() => {
      const session = getSessionState();
      if (session.mode !== "login") return;

      const game = getGameState();
      if (game.isDead) return;

      const currentHunger = getHungerState().hunger;
      const currentHealth = getHealthState().health;
      fetch("/api/game/save-hunger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hunger: currentHunger, health: currentHealth }),
      }).catch((err) => {
        console.error("Failed to save vitals", err);
      });
    }, HUNGER.DB_SAVE_INTERVAL);

    return () => {
      clearInterval(decayInterval);
      clearInterval(dbInterval);
    };
  }, []);

  return null;
}
