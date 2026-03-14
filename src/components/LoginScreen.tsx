"use client";

import { useState } from "react";
import { setSessionState, loadGameData, getSessionState } from "./useSessionStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        // Transition to game phase but keep loading screen up
        // by NOT setting gameDataLoaded yet
        setSessionState({
          appPhase: "game",
          mode: "login",
          userEmail: data.email,
          gameDataLoaded: false,
        });

        // Fetch all saved data from DB (inventory, position, world)
        await loadGameData();

        // Check if user's saved world requires a different route
        const session = getSessionState();
        const W_ROUTES: Record<string, string> = { night: "/", day: "/realm" };
        const targetRoute = W_ROUTES[session.currentWorld] || "/";
        if (window.location.pathname !== targetRoute) {
          window.location.href = targetRoute;
          return; // Redirect will reload with full data
        }

        // Now signal that data is ready — loading screen can dismiss
        setSessionState({ gameDataLoaded: true });
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(154, 106, 255, 0.08)",
    border: "1px solid rgba(154, 106, 255, 0.25)",
    borderRadius: 10,
    color: "#e0d0c0",
    fontFamily: "'Georgia', serif",
    fontSize: "1rem",
    padding: "12px 16px",
    outline: "none",
    width: "100%",
    letterSpacing: "0.05em",
    transition: "border-color 0.3s",
  };

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
      {/* Back button */}
      <button
        onClick={() =>
          setSessionState({ appPhase: "mode-select", mode: "portfolio" })
        }
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          background: "none",
          border: "1px solid rgba(154, 106, 255, 0.2)",
          borderRadius: 10,
          color: "#9a8a7a",
          fontFamily: "'Georgia', serif",
          fontSize: "0.85rem",
          padding: "8px 18px",
          cursor: "pointer",
          letterSpacing: "0.1em",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.5)";
          e.currentTarget.style.color = "#e0d0c0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.2)";
          e.currentTarget.style.color = "#9a8a7a";
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <h1
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "1.8rem",
          fontWeight: 300,
          color: "#e0d0c0",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          marginBottom: 8,
          textShadow: "0 0 20px rgba(154, 106, 255, 0.3)",
        }}
      >
        Login / Register
      </h1>
      <p
        style={{
          fontFamily: "'Georgia', serif",
          color: "#9a8a7a",
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
          marginBottom: 36,
        }}
      >
        Enter your email and password
      </p>

      {/* Form */}
      <div style={{ width: 340, maxWidth: "90vw", display: "flex", flexDirection: "column", gap: "16px" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={inputStyle}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.5)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.25)")
          }
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Password"
          style={inputStyle}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.5)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.25)")
          }
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px 0",
            background: loading
              ? "rgba(154, 106, 255, 0.2)"
              : "linear-gradient(135deg, #6a3a9a, #9a6aff)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontFamily: "'Georgia', serif",
            fontSize: "0.95rem",
            letterSpacing: "0.15em",
            cursor: loading ? "wait" : "pointer",
            transition: "all 0.3s",
            boxShadow: loading
              ? "none"
              : "0 4px 20px rgba(154, 106, 255, 0.3)",
          }}
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            fontFamily: "'Georgia', serif",
            color: "#ff6b6b",
            fontSize: "0.85rem",
            marginTop: 16,
            letterSpacing: "0.05em",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
