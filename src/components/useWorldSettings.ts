"use client";

import { useSyncExternalStore } from "react";
import { AUDIO } from "./settings/settings";

// ─── Per-world settings (persisted to localStorage) ───

export interface WorldSettings {
  volume: number;      // 0–100
  brightness: number;  // 0–100 (50 = default)
}

export interface WorldSettingsState {
  night: WorldSettings;
  day: WorldSettings;
}

const STORAGE_KEY = "worldSettings";

const DEFAULTS: WorldSettingsState = {
  night: { volume: AUDIO.DEFAULT_VOLUME, brightness: AUDIO.DEFAULT_BRIGHTNESS },
  day: { volume: AUDIO.DEFAULT_VOLUME, brightness: AUDIO.DEFAULT_BRIGHTNESS },
};

function loadFromStorage(): WorldSettingsState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        night: { ...DEFAULTS.night, ...parsed.night },
        day: { ...DEFAULTS.day, ...parsed.day },
      };
    }
  } catch { /* ignore parse errors */ }
  return DEFAULTS;
}

function saveToStorage(s: WorldSettingsState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota exceeded, ignore */ }
}

let state: WorldSettingsState = loadFromStorage();

type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange() { for (const l of listeners) l(); }

export function getWorldSettings(): WorldSettingsState { return state; }

export function setWorldSettings(world: "night" | "day", partial: Partial<WorldSettings>) {
  state = {
    ...state,
    [world]: { ...state[world], ...partial },
  };
  saveToStorage(state);
  emitChange();

  // Side-effect: apply volume immediately to the relevant audio element
  applyVolume(world);
}

/** Apply the stored volume to the audio element for the given world */
export function applyVolume(world: "night" | "day") {
  if (typeof document === "undefined") return;
  const id = world === "night" ? "night-audio" : "day-audio";
  const audio = document.getElementById(id) as HTMLAudioElement | null;
  if (audio) {
    audio.volume = state[world].volume / 100;
  }
}

/** Returns the CSS brightness filter value for a world (1 = default) */
export function getBrightnessFilter(world: "night" | "day"): number {
  // brightness 50 = 1.0 (default), 0 = 0.3 (very dark), 100 = 1.8 (very bright)
  const b = state[world].brightness;
  return AUDIO.BRIGHTNESS_MIN + (b / 100) * AUDIO.BRIGHTNESS_RANGE; // range 0.3 – 1.8
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWorldSettings<T>(selector: (s: WorldSettingsState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getWorldSettings()),
    () => selector(getWorldSettings())
  );
}
