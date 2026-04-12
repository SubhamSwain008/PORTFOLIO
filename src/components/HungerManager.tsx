import { useEffect } from "react";
import { getHungerState, setHungerState } from "./useHungerStore";
import { getHealthState, setHealthState } from "./useHealthStore";
import { getStaminaState, setStaminaState } from "./useStaminaStore";
import { getSessionState } from "./useSessionStore";
import { getGameState, setGameState } from "./useGameStore";
import { setInventoryState } from "./inventory/inventory";
import { netFetch, netPostBackground } from "@/lib/netFetch";
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
          setTimeout(() => {
            setGameState({ isDead: true, deathCause: "starvation" });
            setInventoryState({ items: [] });
            // Death save: critical — retry aggressively in the background.
            netPostBackground("/api/game/save-death", {}, { retries: 4, timeoutMs: 15000 });
          }, 0);
        }
      }
    }, intervalTime);

    // ─── Save hunger + health to DB every 60 seconds ───
    // If a save fails we DO NOT drop the attempt; `pendingSave` keeps
    // the latest values queued, and the next tick retries.
    let pendingSave: { hunger: number; health: number } | null = null;
    let inFlight = false;

    const doSave = async () => {
      if (inFlight) return;
      const session = getSessionState();
      if (session.mode !== "login") return;
      const game = getGameState();
      if (game.isDead) return;

      const payload = pendingSave ?? {
        hunger: getHungerState().hunger,
        health: getHealthState().health,
      };
      pendingSave = payload;
      inFlight = true;
      try {
        const res = await netFetch("/api/game/save-hunger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          timeoutMs: 12000,
          retries: 2,
          backoffMs: 500,
        });
        if (res.ok) {
          pendingSave = null;
        }
        // Non-ok (e.g. 503): keep pendingSave so next tick retries.
      } catch {
        // Network/timeout: keep pendingSave so next tick retries.
      } finally {
        inFlight = false;
      }
    };

    const dbInterval = setInterval(doSave, HUNGER.DB_SAVE_INTERVAL);

    // Opportunistic retry when the browser regains connectivity
    const onOnline = () => { doSave(); };
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(decayInterval);
      clearInterval(dbInterval);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
