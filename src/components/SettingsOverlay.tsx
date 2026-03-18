"use client";

import { useState, useEffect, useRef } from "react";
import {
  useSessionStore,
  setSessionState,
  getSessionState,
} from "./useSessionStore";
import {
  useWorldSettings,
  setWorldSettings,
  applyVolume,
} from "./useWorldSettings";
import { resetGameState } from "./useGameStore";

export default function SettingsOverlay() {
  const appPhase = useSessionStore((s) => s.appPhase);
  const userEmail = useSessionStore((s) => s.userEmail);
  const musicEnabled = useSessionStore((s) => s.musicEnabled);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Per-world settings
  const nightVolume = useWorldSettings((s) => s.night.volume);
  const nightBrightness = useWorldSettings((s) => s.night.brightness);
  const dayVolume = useWorldSettings((s) => s.day.volume);
  const dayBrightness = useWorldSettings((s) => s.day.brightness);

  // Detect which world we're on
  const [currentWorld, setCurrentWorld] = useState<"night" | "day">("night");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentWorld(window.location.pathname.includes("/realm") ? "day" : "night");
    }
  }, []);

  // Apply volume on mount and when settings change
  useEffect(() => {
    applyVolume("night");
    applyVolume("day");
  }, [nightVolume, dayVolume]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (appPhase !== "game") {
    const onRealmPage = typeof document !== "undefined" && document.getElementById("day-audio");
    if (!onRealmPage) return null;
  }

  const handleMusicToggle = () => {
    const next = !getSessionState().musicEnabled;
    setSessionState({ musicEnabled: next });
    
    if (typeof window !== "undefined") {
      localStorage.setItem("musicEnabled", String(next));
    }

    const nightAudio = document.getElementById("night-audio") as HTMLAudioElement | null;
    const dayAudio = document.getElementById("day-audio") as HTMLAudioElement | null;
    for (const audio of [nightAudio, dayAudio]) {
      if (audio) {
        if (next) {
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard refresh to clear all 3D assets and state properly
    window.location.href = "/";
  };

  const handleSwitchMode = () => {
    // Hard refresh to clear all 3D assets and state properly
    window.location.href = "/";
  };

  const menuItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 16px",
    background: "none",
    border: "none",
    color: "#e0d0c0",
    fontFamily: "'Georgia', serif",
    fontSize: "0.82rem",
    letterSpacing: "0.06em",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s",
    borderRadius: 6,
  };

  const sliderLabelStyle: React.CSSProperties = {
    fontFamily: "'Georgia', serif",
    fontSize: "0.72rem",
    color: "#9a8a7a",
    letterSpacing: "0.06em",
    marginBottom: 2,
  };

  const sliderContainerStyle: React.CSSProperties = {
    padding: "6px 16px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "'Georgia', serif",
    fontSize: "0.68rem",
    color: "#7a6a5a",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "8px 16px 2px",
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    icon: string
  ) => (
    <div style={sliderContainerStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={sliderLabelStyle}>
          {icon} {label}
        </span>
        <span style={{ ...sliderLabelStyle, color: "#b09a8a", fontSize: "0.7rem" }}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          height: 4,
          appearance: "none",
          WebkitAppearance: "none",
          background: `linear-gradient(to right, rgba(154,106,255,0.6) ${value}%, rgba(255,255,255,0.1) ${value}%)`,
          borderRadius: 2,
          outline: "none",
          cursor: "pointer",
        }}
      />
    </div>
  );

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* User email badge */}
      {userEmail && (
        <div
          style={{
            background: "rgba(154, 106, 255, 0.1)",
            border: "1px solid rgba(154, 106, 255, 0.2)",
            borderRadius: 20,
            padding: "6px 16px",
            fontFamily: "'Georgia', serif",
            fontSize: "0.75rem",
            color: "#9a8a7a",
            letterSpacing: "0.05em",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {userEmail}
        </div>
      )}

      {/* Settings gear */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: open
            ? "rgba(154, 106, 255, 0.2)"
            : "rgba(154, 106, 255, 0.08)",
          border: "1px solid rgba(154, 106, 255, 0.25)",
          color: "#e0d0c0",
          fontSize: "1.15rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(154, 106, 255, 0.25)";
          e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = open
            ? "rgba(154, 106, 255, 0.2)"
            : "rgba(154, 106, 255, 0.08)";
          e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.25)";
        }}
      >
        ⚙
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 52,
            right: 0,
            background: "rgba(18, 20, 28, 0.95)",
            border: "1px solid rgba(154, 106, 255, 0.2)",
            borderRadius: 12,
            padding: 6,
            minWidth: 260,
            maxHeight: "80vh",
            overflowY: "auto",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            animation: "settingsFadeIn 0.2s ease-out",
          }}
        >
          {/* Music toggle */}
          <button
            onClick={handleMusicToggle}
            style={menuItemStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "rgba(154, 106, 255, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            <span>{musicEnabled ? "🔊" : "🔇"}</span>
            <span>Music {musicEnabled ? "On" : "Off"}</span>
          </button>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(154, 106, 255, 0.1)",
              margin: "4px 8px",
            }}
          />

          {/* ─── Night World Settings ─── */}
          <div style={sectionTitleStyle}>
            🌙 Night World
          </div>
          {renderSlider(
            "Volume",
            nightVolume,
            (v) => setWorldSettings("night", { volume: v }),
            "🔉"
          )}
          {renderSlider(
            "Brightness",
            nightBrightness,
            (v) => setWorldSettings("night", { brightness: v }),
            "🔆"
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(154, 106, 255, 0.1)",
              margin: "4px 8px",
            }}
          />

          {/* ─── Day World Settings ─── */}
          <div style={sectionTitleStyle}>
            ☀️ Day World
          </div>
          {renderSlider(
            "Volume",
            dayVolume,
            (v) => setWorldSettings("day", { volume: v }),
            "🔉"
          )}
          {renderSlider(
            "Brightness",
            dayBrightness,
            (v) => setWorldSettings("day", { brightness: v }),
            "🔆"
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(154, 106, 255, 0.1)",
              margin: "4px 8px",
            }}
          />

          {/* Switch mode */}
          <button
            onClick={handleSwitchMode}
            style={menuItemStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "rgba(154, 106, 255, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            <span>🏰</span>
            <span>Switch Mode</span>
          </button>

          {/* Logout (only when logged in) */}
          {userEmail && (
            <>
              <div
                style={{
                  height: 1,
                  background: "rgba(154, 106, 255, 0.1)",
                  margin: "4px 8px",
                }}
              />
              <button
                onClick={handleLogout}
                style={{
                  ...menuItemStyle,
                  color: "#ff6b6b",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255, 107, 107, 0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes settingsFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #9a6aff;
          border: 2px solid rgba(255,255,255,0.3);
          cursor: pointer;
          box-shadow: 0 0 6px rgba(154,106,255,0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #9a6aff;
          border: 2px solid rgba(255,255,255,0.3);
          cursor: pointer;
          box-shadow: 0 0 6px rgba(154,106,255,0.5);
        }
      `}</style>
    </div>
  );
}
