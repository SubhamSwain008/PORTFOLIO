"use client";

import { setSessionState } from "./useSessionStore";

export default function ModeSelect() {
  const modes = [
    {
      key: "portfolio" as const,
      title: "Portfolio",
      desc: "Explore the world freely",
      icon: "🏰",
    },
    {
      key: "demo" as const,
      title: "Demo",
      desc: "Quick exploration mode",
      icon: "🎮",
    },
    {
      key: "login" as const,
      title: "Login",
      desc: "Create account & save progress",
      icon: "🔑",
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, #0a0a1a 0%, #12141c 50%, #1a1a2e 100%)",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "2.2rem",
          fontWeight: 300,
          color: "#e0d0c0",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginBottom: 8,
          textShadow: "0 0 30px rgba(154, 106, 255, 0.4)",
        }}
      >
        the game
      </h1>
      <p
        style={{
          fontFamily: "'Georgia', serif",
          color: "#9a8a7a",
          fontSize: "0.9rem",
          letterSpacing: "0.15em",
          marginBottom: 48,
        }}
      >
        Choose how you&apos;d like to enter
      </p>

      {/* Mode cards */}
      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              if (m.key === "login") {
                setSessionState({ appPhase: "login", mode: "login" });
              } else {
                setSessionState({ appPhase: "game", mode: m.key });
              }
            }}
            style={{
              background: "rgba(154, 106, 255, 0.06)",
              border: "1px solid rgba(154, 106, 255, 0.2)",
              borderRadius: 16,
              padding: "32px 28px",
              width: 200,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(154, 106, 255, 0.15)";
              el.style.borderColor = "rgba(154, 106, 255, 0.5)";
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "0 12px 40px rgba(154, 106, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(154, 106, 255, 0.06)";
              el.style.borderColor = "rgba(154, 106, 255, 0.2)";
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            <span style={{ fontSize: "2.2rem" }}>{m.icon}</span>
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.15rem",
                color: "#e0d0c0",
                letterSpacing: "0.12em",
                fontWeight: 400,
              }}
            >
              {m.title}
            </span>
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "0.75rem",
                color: "#9a8a7a",
                letterSpacing: "0.05em",
                lineHeight: 1.4,
              }}
            >
              {m.desc}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes modeGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(154, 106, 255, 0.05); }
          50% { box-shadow: 0 0 30px rgba(154, 106, 255, 0.12); }
        }
      `}</style>
    </div>
  );
}
