"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import InventoryHUD from "@/components/inventory/InventoryHUD";
import CookingHUD from "@/components/interior/hall/CookingHUD";
import CookingPrompt from "@/components/interior/hall/CookingPrompt";
import EatingHUD from "@/components/interior/hall/EatingHUD";
import EatingPrompt from "@/components/interior/hall/EatingPrompt";
import SavePrompt from "@/components/interior/hall/SavePrompt";
import SaveHUD from "@/components/interior/hall/SaveHUD";
import HungerBar from "@/components/HungerBar";
import HealthBar from "@/components/HealthBar";
import StaminaBar from "@/components/StaminaBar";
import HungerManager from "@/components/HungerManager";
import DeathOverlay from "@/components/DeathOverlay";
import SettingsOverlay from "@/components/SettingsOverlay";
import { loadGameData, setSessionState, getSessionState, initSession } from "@/components/useSessionStore";

const HallInteriorScene = dynamic(
    () => import("@/components/interior/hall/HallInteriorScene"),
    {
        ssr: false,
        loading: () => null,
    }
);

export default function HallPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [denied, setDenied] = useState(false);

    // ─── Access Guard ────────────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return;

        const allowed = sessionStorage.getItem("hallEntryAllowed");
        if (allowed === "true") {
            setAuthorized(true);
            // Consume the token — one-time use only (must walk through door again)
            sessionStorage.removeItem("hallEntryAllowed");
        } else {
            // Not authorized — show denial message then redirect
            setDenied(true);
            const timer = setTimeout(() => {
                router.replace("/");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [router]);

    // ─── Loading Screen Timer & Data Hydration ──────────────
    useEffect(() => {
        if (!authorized) return;

        let cancelled = false;
        let hydrationDone = false;

        async function initHall() {
            const session = getSessionState();
            if (session.userEmail) {
                await loadGameData();
                setSessionState({ appPhase: "game", gameDataLoaded: true });
            } else {
                await initSession();
            }
            hydrationDone = true;
        }
        initHall();

        setLoading(true);
        setFadeOut(false);

        // Minimum visual time (2.2s) AND wait for hydration up to 8s.
        // If hydration is still going past 8s, proceed anyway — the
        // NetworkMonitor HUD will tell the user why stats may be stale.
        const MIN_MS = 2200;
        const MAX_MS = 10000;
        const POLL = 150;
        const start = Date.now();
        const poll = setInterval(() => {
            if (cancelled) return;
            const elapsed = Date.now() - start;
            if (elapsed >= MIN_MS && (hydrationDone || elapsed >= MAX_MS)) {
                clearInterval(poll);
                setFadeOut(true);
                setTimeout(() => {
                    if (!cancelled) setLoading(false);
                }, 800);
            }
        }, POLL);

        return () => {
            cancelled = true;
            clearInterval(poll);
        };
    }, [authorized]);

    // ─── Access Denied Screen ───────────────────────────────
    if (denied) {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "linear-gradient(180deg, #0a0500 0%, #1a0a00 50%, #0a0500 100%)",
                }}
            >
                {/* Lock icon */}
                <div
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        border: "2px solid #4a2a0a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 24,
                        animation: "pulseGlow 1.5s ease-in-out infinite",
                    }}
                >
                    <span style={{ fontSize: 28, color: "#ff6622" }}>&#x1f512;</span>
                </div>

                <h2
                    style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "1.4rem",
                        fontWeight: 300,
                        color: "#c8a078",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: 12,
                        textShadow: "0 0 15px rgba(255, 102, 34, 0.3)",
                    }}
                >
                    The Hall is Sealed
                </h2>

                <p
                    style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "0.85rem",
                        color: "#8a7060",
                        letterSpacing: "0.1em",
                    }}
                >
                    Approach the door and press [ X ] to enter...
                </p>

                <p
                    style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "0.75rem",
                        color: "#5a4a3a",
                        letterSpacing: "0.08em",
                        marginTop: 20,
                        animation: "pulse 2s ease-in-out infinite",
                    }}
                >
                    Returning to the world...
                </p>

                <style>{`
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 10px rgba(255, 102, 34, 0.2); }
            50% { box-shadow: 0 0 25px rgba(255, 102, 34, 0.5); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
            </div>
        );
    }

    // ─── Not yet authorized (still checking) ────────────────
    if (!authorized) {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "#0a0500",
                }}
            />
        );
    }

    // ─── Authorized: Show loading screen + interior ─────────
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
                        background:
                            "linear-gradient(180deg, #0a0500 0%, #1a0a00 50%, #0a0500 100%)",
                        transition: "opacity 0.8s ease-out",
                        opacity: fadeOut ? 0 : 1,
                        pointerEvents: fadeOut ? "none" : "auto",
                    }}
                >
                    {/* Animated fire ring */}
                    <div
                        style={{
                            position: "relative",
                            width: 100,
                            height: 100,
                            marginBottom: 40,
                        }}
                    >
                        {/* Outer ring */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50%",
                                border: "2px solid transparent",
                                borderTopColor: "#ff6622",
                                borderRightColor: "#ff4400",
                                animation: "spin 1.5s linear infinite",
                                boxShadow:
                                    "0 0 30px rgba(255, 102, 34, 0.3), inset 0 0 20px rgba(255, 68, 0, 0.1)",
                            }}
                        />
                        {/* Inner ring */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 15,
                                borderRadius: "50%",
                                border: "1px solid transparent",
                                borderBottomColor: "#ffaa44",
                                borderLeftColor: "#ff8822",
                                animation: "spinReverse 2s linear infinite",
                                boxShadow: "0 0 15px rgba(255, 136, 34, 0.2)",
                            }}
                        />
                        {/* Center glow */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 30,
                                borderRadius: "50%",
                                background:
                                    "radial-gradient(circle, rgba(255,102,34,0.3) 0%, transparent 70%)",
                                animation: "breathe 2s ease-in-out infinite",
                            }}
                        />
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            fontFamily: "'Georgia', serif",
                            fontSize: "1.8rem",
                            fontWeight: 300,
                            color: "#e0c8a0",
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            marginBottom: 8,
                            textShadow: "0 0 20px rgba(255, 102, 34, 0.3)",
                        }}
                    >
                        The Hall of Night
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontFamily: "'Georgia', serif",
                            fontSize: "0.85rem",
                            color: "#9a7a5a",
                            letterSpacing: "0.15em",
                            animation: "pulse 2s ease-in-out infinite",
                            marginBottom: 12,
                        }}
                    >
                        Entering the warmth within...
                    </p>

                    {/* Progress bar */}
                    <div
                        style={{
                            marginTop: 30,
                            width: 180,
                            height: 2,
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 1,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                background:
                                    "linear-gradient(90deg, #4a2200, #ff6622, #4a2200)",
                                animation: "loadBar 2.2s ease-in-out forwards",
                                borderRadius: 1,
                            }}
                        />
                    </div>

                    <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes spinReverse {
              to { transform: rotate(-360deg); }
            }
            @keyframes breathe {
              0%, 100% { transform: scale(0.8); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 1; }
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

            {/* 3D Interior Scene */}
            <HallInteriorScene />

            {/* Overlay HUDs */}
            <InventoryHUD />
            <CookingPrompt />
            <CookingHUD />
            <EatingPrompt />
            <EatingHUD />
            <SavePrompt />
            <SaveHUD />

            {/* Survival System */}
            <HungerManager />
            <HungerBar />
            <HealthBar />
            <StaminaBar />
            <DeathOverlay />

            {/* Settings gear icon — same as outdoor world */}
            <SettingsOverlay />
        </>
    );
}
