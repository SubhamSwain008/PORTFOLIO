"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  useSessionStore,
  initSession,
  getSessionState,
} from "@/components/useSessionStore";
import ModeSelect from "@/components/ModeSelect";
import LoginScreen from "@/components/LoginScreen";
import SettingsOverlay from "@/components/SettingsOverlay";

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const appPhase = useSessionStore((s) => s.appPhase);
  const musicEnabled = useSessionStore((s) => s.musicEnabled);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Init session on mount
  useEffect(() => {
    initSession();
  }, []);

  // Game loading screen timer (only when entering game phase)
  useEffect(() => {
    if (appPhase !== "game") return;
    setLoading(true);
    setFadeOut(false);
    const minTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 800);
    }, 2500);
    return () => clearTimeout(minTimer);
  }, [appPhase]);

  // ─── Mode Select ───
  if (appPhase === "loading") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #0a0a1a 0%, #12141c 50%, #1a1a2e 100%)",
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

  if (appPhase === "mode-select") return <ModeSelect />;
  if (appPhase === "login") return <LoginScreen />;

  // ─── Game Phase ───
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
              "linear-gradient(180deg, #0a0a1a 0%, #12141c 50%, #1a1a2e 100%)",
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
              boxShadow:
                "0 0 40px rgba(106, 58, 154, 0.4), inset 0 0 30px rgba(154, 106, 255, 0.15)",
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
            Entering the Night
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
                background:
                  "linear-gradient(90deg, #6a3a9a, #9a6aff, #6a3a9a)",
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
      <Scene />

      {/* Settings overlay — top-right */}
      <SettingsOverlay />

      {/* Hidden Night Audio */}
      <audio
        id="night-audio"
        src="https://storage.googleapis.com/udio-artifacts-c33fe3ba-3ffe-471f-92c8-5dfef90b3ea3/samples/7a1bf4535db641808d8fea5d005186fe/1/The%2520Untitled.mp3"
        loop
        autoPlay={musicEnabled}
        style={{ display: "none" }}
      />
      <InteractionUnlocker />
    </>
  );
}

// Helper to unlock audio on first interaction (browsers block autoplay until interaction)
function InteractionUnlocker() {
  useEffect(() => {
    const unlock = () => {
      if (!getSessionState().musicEnabled) return;
      const audio = document.getElementById(
        "night-audio"
      ) as HTMLAudioElement | null;
      if (audio) {
        audio.play().catch(() => { });
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
