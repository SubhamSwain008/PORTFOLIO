"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import SettingsOverlay from "@/components/SettingsOverlay";
import SaveIndicator from "@/components/SaveIndicator";
import { useSessionStore, setSessionState, getSessionState, initSession } from "@/components/useSessionStore";
import { setInventoryState } from "@/components/inventory/inventory";
import { setHungerState } from "@/components/useHungerStore";
import { setHealthState } from "@/components/useHealthStore";
import { applyVolume, getWorldSettings } from "@/components/useWorldSettings";
import HungerBar from "@/components/HungerBar";
import HealthBar from "@/components/HealthBar";
import HungerManager from "@/components/HungerManager";
import DeathOverlay from "@/components/DeathOverlay";
import { useGameStore } from "@/components/useGameStore";
import { useEnemyStore, getEnemyState } from "@/components/useEnemyStore";
import { crossfade } from "@/components/audioUtils";
import { netFetch } from "@/lib/netFetch";

const DayScene = dynamic(() => import("@/components/day/DayScene"), {
    ssr: false,
    loading: () => null,
});

export default function RealmPage() {
    const appPhase = useSessionStore((s) => s.appPhase);
    const musicEnabled = useSessionStore((s) => s.musicEnabled);
    const isPlayerChased = useEnemyStore((s) => s.isPlayerChased);
    const isDead = useGameStore((s) => s.isDead);
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const crossfadeCleanupRef = useRef<() => void>(null);

    // Apply saved volume on mount
    useEffect(() => {
        applyVolume("day");
    }, []);

    // Initialize session (loads user + inventory from DB)
    useEffect(() => {
        async function loadGameData() {
            const session = getSessionState();
            if (session.userEmail) {
                // Already have a session — resilient inventory/stat refresh
                try {
                    const gameRes = await netFetch("/api/game/load", {
                        timeoutMs: 15000,
                        retries: 2,
                        backoffMs: 500,
                    });
                    if (gameRes.ok) {
                        const gameData = await gameRes.json();
                        if (gameData.ok && gameData.inventory && Array.isArray(gameData.inventory) && gameData.inventory.length > 0) {
                            setInventoryState({ items: gameData.inventory });
                        }
                        if (gameData.ok && gameData.hunger !== undefined) {
                            setHungerState({ hunger: gameData.hunger });
                        }
                        if (gameData.ok && gameData.health !== undefined) {
                            setHealthState({ health: gameData.health });
                        }
                    }
                } catch {
                    // Transient — stats keep their local values; auto-save catches up.
                }
                setSessionState({ appPhase: "game", gameDataLoaded: true });
            } else {
                await initSession();
            }
        }
        loadGameData();
    }, []);

    // Also handle redirect to login page if unauthenticated
    useEffect(() => {
        if (appPhase === "mode-select" || appPhase === "login") {
            // If not logged in, bounce to root `/` for login screen
            if (!getSessionState().userEmail) {
                window.location.href = "/";
            }
        }
    }, [appPhase]);

    useEffect(() => {
        // Wait for appPhase === "game" (data hydrated) OR a hard cap of 10s
        // so slow networks don't trap the user on the loading screen.
        const MIN_MS = 2500;
        const MAX_MS = 10000;
        const start = Date.now();
        let cancelled = false;
        const poll = setInterval(() => {
            if (cancelled) return;
            const elapsed = Date.now() - start;
            const ready = appPhase === "game";
            if (elapsed >= MIN_MS && (ready || elapsed >= MAX_MS)) {
                clearInterval(poll);
                setFadeOut(true);
                setTimeout(() => {
                    if (!cancelled) setLoading(false);
                }, 800);
            }
        }, 150);
        return () => {
            cancelled = true;
            clearInterval(poll);
        };
    }, [appPhase]);

    // ─── Audio Toggle Logic ───
    useEffect(() => {
        if (appPhase !== "game") return;

        const dayAudio = document.getElementById("day-audio") as HTMLAudioElement | null;
        const chaseAudioDay = document.getElementById("chase-audio-day") as HTMLAudioElement | null;

        if (!dayAudio || !chaseAudioDay) return;

        const targetVol = getWorldSettings().day.volume / 100;

        if (!musicEnabled || isDead) {
            if (crossfadeCleanupRef.current) crossfadeCleanupRef.current();
            dayAudio.pause();
            chaseAudioDay.pause();
            return;
        }

        if (crossfadeCleanupRef.current) crossfadeCleanupRef.current();

        if (isPlayerChased) {
            crossfadeCleanupRef.current = crossfade(dayAudio, chaseAudioDay, 2000, targetVol);
        } else {
            crossfadeCleanupRef.current = crossfade(chaseAudioDay, dayAudio, 2000, targetVol);
        }
    }, [musicEnabled, isPlayerChased, isDead, appPhase]);

    if (appPhase !== "game") {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #87CEEB 100%)",
                }}
            >
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "#9a6aff",
                        animation: "spin 1s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            {/* Loading Screen Overlay */}
            {loading && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #87CEEB 100%)",
                        transition: "opacity 0.8s ease-out",
                        opacity: fadeOut ? 0 : 1,
                        pointerEvents: fadeOut ? "none" : "auto",
                    }}
                >
                    {/* Animated portal ring */}
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            border: "3px solid transparent",
                            borderTopColor: "#9a6aff",
                            borderRightColor: "#6a3a9a",
                            animation: "spin 1.2s linear infinite",
                            marginBottom: 40,
                            boxShadow: "0 0 40px rgba(106, 58, 154, 0.4), inset 0 0 30px rgba(154, 106, 255, 0.15)",
                        }}
                    />

                    {/* Title */}
                    <h1
                        style={{
                            fontFamily: "'Georgia', serif",
                            fontSize: "2rem",
                            fontWeight: 300,
                            color: "#e0d0c0",
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            marginBottom: 12,
                            textShadow: "0 0 20px rgba(154, 106, 255, 0.3)",
                        }}
                    >
                        Entering the Realm
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontFamily: "'Georgia', serif",
                            fontSize: "0.9rem",
                            color: "#9a8a7a",
                            letterSpacing: "0.15em",
                            animation: "pulse 2s ease-in-out infinite",
                        }}
                    >
                        Traversing through the portal...
                    </p>

                    {/* Progress bar */}
                    <div
                        style={{
                            marginTop: 40,
                            width: 200,
                            height: 2,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 1,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                background: "linear-gradient(90deg, #6a3a9a, #9a6aff, #6a3a9a)",
                                animation: "loadBar 2.5s ease-in-out forwards",
                                borderRadius: 1,
                            }}
                        />
                    </div>

                    <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
            @keyframes loadBar {
              0% { width: 0%; }
              60% { width: 70%; }
              100% { width: 100%; }
            }
          `}</style>
                </div>
            )}

            {/* 3D Scene — renders behind loading overlay */}
            <DayScene />

            {/* Settings overlay — top-right (username + gear) */}
            <SettingsOverlay />

            {/* Save indicator — bottom-right */}
            <SaveIndicator />

            {/* Survival System */}
            <HungerManager />
            <HungerBar />
            <HealthBar />
            <DeathOverlay />

            {/* Hidden Day Audio — separate track from night world */}
            <audio
                id="day-audio"
                src="https://storage.googleapis.com/udio-artifacts-c33fe3ba-3ffe-471f-92c8-5dfef90b3ea3/samples/526b313d6583430dbdc9c70235942355/1/The%2520Untitled.mp3"
                loop
                style={{ display: "none" }}
            />
            {/* Hidden Chase Audio */}
            <audio
                id="chase-audio-day"
                src="/assets/chase.mp3"
                loop
                style={{ display: "none" }}
            />
            <DayInteractionUnlocker />
        </>
    );
}

// Helper to unlock audio on first interaction (browsers block autoplay until interaction)
function DayInteractionUnlocker() {
    useEffect(() => {
        const unlock = () => {
            if (!getSessionState().musicEnabled) return;
            const audioId = getEnemyState().isPlayerChased ? "chase-audio-day" : "day-audio";
            const audio = document.getElementById(audioId) as HTMLAudioElement | null;
            if (audio) {
                audio.play().catch(() => {});
            }
        };
        window.addEventListener("click", unlock);
        window.addEventListener("keydown", unlock);
        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, []);
    return null;
}

