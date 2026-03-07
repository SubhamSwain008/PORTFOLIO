"use client";

import { useState, useEffect, useRef } from "react";
import {
  useSessionStore,
  setSessionState,
  getSessionState,
} from "./useSessionStore";

export default function SettingsOverlay() {
  const appPhase = useSessionStore((s) => s.appPhase);
  const userEmail = useSessionStore((s) => s.userEmail);
  const musicEnabled = useSessionStore((s) => s.musicEnabled);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (appPhase !== "game") return null;

  const handleMusicToggle = () => {
    const next = !getSessionState().musicEnabled;
    setSessionState({ musicEnabled: next });
    const audio = document.getElementById(
      "night-audio"
    ) as HTMLAudioElement | null;
    if (audio) {
      if (next) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSessionState({
      appPhase: "mode-select",
      mode: "portfolio",
      userEmail: null,
    });
    setOpen(false);
  };

  const handleSwitchMode = () => {
    setSessionState({
      appPhase: "mode-select",
      mode: "portfolio",
    });
    setOpen(false);
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
            minWidth: 200,
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
      `}</style>
    </div>
  );
}
