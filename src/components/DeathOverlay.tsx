"use client";

import { useGameStore, setGameState } from "./useGameStore";
import { useSessionStore } from "./useSessionStore";
import { setHealthState } from "./useHealthStore";
import { setHungerState } from "./useHungerStore";
import { setInventoryState } from "./inventory/inventory";
import { useState } from "react";
import { netFetch, NetFetchError } from "@/lib/netFetch";

export default function DeathOverlay() {
    const isDead = useGameStore(s => s.isDead);
    const deathCause = useGameStore(s => s.deathCause);
    const appPhase = useSessionStore(s => s.appPhase);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReloadSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await netFetch("/api/game/saves", { timeoutMs: 15000, retries: 2 });
            const data = await res.json();

            if (data.ok && data.saves.length > 0) {
                const latestSave = data.saves[0];

                const loadRes = await netFetch("/api/game/load-save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ saveId: latestSave.id }),
                    timeoutMs: 20000,
                    retries: 2,
                });
                const loadData = await loadRes.json();
                
                if (loadData.ok) {
                    const save = loadData.save;
                    setHealthState({ health: save.health });
                    setHungerState({ hunger: save.hunger });
                    
                    let parsedInv = [];
                    if (typeof save.inventory === "string") {
                        try { parsedInv = JSON.parse(save.inventory); } catch(e) {}
                    } else if (Array.isArray(save.inventory)) {
                        parsedInv = save.inventory;
                    }
                    setInventoryState({ items: parsedInv });

                    // Clear death state to resume game
                    setGameState({ isDead: false });

                    // Authorize and force spawn in hall interior
                    sessionStorage.setItem("hallEntryAllowed", "true");
                    window.location.href = "/hall";
                } else {
                    setError("Failed to load last save.");
                }
            } else {
                setError("No saves found.");
            }
        } catch (err) {
            if (err instanceof NetFetchError && err.kind === "timeout") {
                setError("Server is slow to respond. Please try again.");
            } else {
                setError("Network error loading save.");
            }
        }
        setLoading(false);
    };

    if (!isDead || appPhase !== "game") return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(ellipse at center, rgba(40, 0, 0, 0.95) 0%, rgba(10, 0, 0, 0.98) 70%, #000 100%)",
                animation: "deathFadeIn 1.5s ease-out",
            }}
        >
            {/* Blood drip effect at top */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    background: "linear-gradient(180deg, rgba(120, 0, 0, 0.6) 0%, transparent 100%)",
                }}
            />

            {/* Death icon */}
            <div
                style={{
                    fontSize: 72,
                    marginBottom: 24,
                    filter: "drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))",
                    animation: "deathPulse 2s ease-in-out infinite",
                }}
            >
                💀
            </div>

            {/* Title */}
            <h1
                style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "3.5rem",
                    fontWeight: 300,
                    color: "#cc0000",
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    textShadow: "0 0 40px rgba(200, 0, 0, 0.6), 0 0 80px rgba(150, 0, 0, 0.3)",
                    marginBottom: 12,
                    animation: "deathTextGlow 3s ease-in-out infinite",
                }}
            >
                YOU DIED
            </h1>

            {/* Subtitle */}
            <p
                style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1rem",
                    color: "#8a4444",
                    letterSpacing: "0.15em",
                    marginBottom: 8,
                }}
            >
                {deathCause === "enemy"
                    ? "An enemy has slain you..."
                    : "Starvation has claimed your life..."}
            </p>

            <p
                style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "0.85rem",
                    color: "#664444",
                    letterSpacing: "0.1em",
                    marginBottom: 40,
                }}
            >
                All inventory items have been lost.
            </p>

            {/* Reload prompt */}
            <div
                style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1rem",
                    color: "#aaccff",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "10px 30px",
                    border: "1px solid rgba(50, 150, 255, 0.4)",
                    borderRadius: 4,
                    cursor: loading ? "not-allowed" : "pointer",
                    background: "rgba(10, 30, 60, 0.6)",
                    boxShadow: "0 0 10px rgba(50, 150, 255, 0.2)",
                    marginBottom: 20,
                    opacity: loading ? 0.6 : 1,
                    transition: "all 0.2s ease",
                }}
                onClick={!loading ? handleReloadSave : undefined}
            >
                {loading ? "Loading..." : "Reload from Last Save"}
            </div>

            {error && (
                <div style={{ color: "#ff6666", marginBottom: 20, fontFamily: "monospace" }}>
                    {error}
                </div>
            )}

            {/* Restart prompt */}
            <div
                style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.1rem",
                    color: "#aa6666",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    animation: "deathBlink 2s ease-in-out infinite",
                    padding: "12px 40px",
                    border: "1px solid rgba(200, 0, 0, 0.3)",
                    borderRadius: 4,
                    cursor: "pointer",
                }}
                onClick={() => window.location.reload()}
            >
                [ X ] Restart
            </div>

            <style>{`
                @keyframes deathFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes deathPulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                @keyframes deathTextGlow {
                    0%, 100% { text-shadow: 0 0 40px rgba(200, 0, 0, 0.6), 0 0 80px rgba(150, 0, 0, 0.3); }
                    50% { text-shadow: 0 0 60px rgba(255, 0, 0, 0.8), 0 0 120px rgba(200, 0, 0, 0.5); }
                }
                @keyframes deathBlink {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
