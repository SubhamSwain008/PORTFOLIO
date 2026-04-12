"use client";

import { useState } from "react";
import { setSessionState, loadGameData, getSessionState } from "./useSessionStore";
import { netFetch, NetFetchError } from "@/lib/netFetch";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(0);

  const proceedToGame = (world: string) => {
    const W_ROUTES: Record<string, string> = { night: "/", day: "/realm", hall: "/hall" };
    const targetRoute = W_ROUTES[world] || "/";
    if (window.location.pathname !== targetRoute) {
      if (targetRoute === "/hall") {
        sessionStorage.setItem("hallEntryAllowed", "true");
      }
      window.location.href = targetRoute;
      return; // Redirect will reload with full data
    }
    setSessionState({ gameDataLoaded: true });
  };

  const friendlyNetErr = (e: unknown) => {
    if (e instanceof NetFetchError) {
      if (e.kind === "timeout") return "Server is slow to respond. Check your connection.";
      if (e.kind === "network") return "Network error — please try again.";
    }
    return "Network error";
  };

  const handleNewGame = async () => {
    if (confirmWipe === 0) {
      setConfirmWipe(1);
    } else if (confirmWipe === 1) {
      setConfirmWipe(2);
    } else if (confirmWipe === 2) {
      setLoading(true);
      try {
        const res = await netFetch("/api/game/wipe", {
          method: "POST",
          timeoutMs: 20000,
          retries: 1,
        });
        if (res.ok) {
          await loadGameData();
          proceedToGame("hall");
        } else {
          setError("Failed to start new game.");
          setLoading(false);
        }
      } catch (e) {
        setError(friendlyNetErr(e));
        setLoading(false);
      }
    }
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await netFetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        timeoutMs: 20000,
        retries: 1,
      });
      const data = await res.json();
      if (data.ok) {
        setOtpSent(true);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (e) {
      setError(friendlyNetErr(e));
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await netFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        timeoutMs: 20000,
        retries: 1,
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

        const session = getSessionState();
        if (!session.firstTimePlayed) {
          setShowStartMenu(true);
          setLoading(false);
          return;
        }

        proceedToGame(session.currentWorld);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (e) {
      setError(friendlyNetErr(e));
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
    textAlign: otpSent ? "center" : "left",
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
        onClick={() => {
          if (otpSent && !showStartMenu) {
            setOtpSent(false);
            setOtp("");
            setError("");
          } else {
            setSessionState({ appPhase: "mode-select", mode: "demo" });
          }
        }}
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
          textAlign: "center",
        }}
      >
        {showStartMenu 
          ? "Welcome back, traveler." 
          : otpSent 
            ? `An authorization code was sent to\n${email}`
            : "Enter your email to receive a login code"}
      </p>

      {/* Form or Menu */}
      <div style={{ width: 340, maxWidth: "90vw", display: "flex", flexDirection: "column", gap: "16px" }}>
        {!showStartMenu ? (
          !otpSent ? (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
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
              <button
                onClick={handleSendOtp}
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
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                placeholder="000000"
                maxLength={6}
                style={{ ...inputStyle, letterSpacing: "0.5em", fontSize: "1.2rem" }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.25)")
                }
                autoFocus
              />
              <button
                onClick={handleVerifyOtp}
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
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </>
          )
        ) : (
        <>
          <button
            onClick={() => proceedToGame(getSessionState().currentWorld)}
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
            {loading ? "Loading..." : "Continue Journey"}
          </button>
          
          <button
            onClick={handleNewGame}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 0",
              background: "transparent",
              border: confirmWipe > 0 ? "1px solid #ff4a4a" : "1px solid rgba(154, 106, 255, 0.5)",
              borderRadius: 10,
              color: confirmWipe > 0 ? "#ff4a4a" : "#e0d0c0",
              fontFamily: "'Georgia', serif",
              fontSize: "0.95rem",
              letterSpacing: "0.15em",
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.3s",
              marginTop: "10px",
            }}
          >
            {confirmWipe === 0 && "Start New Journey"}
            {confirmWipe === 1 && "Are you sure? All data will be wiped!"}
            {confirmWipe === 2 && "This is irreversible. Confirm Wipe?"}
          </button>
          
          {confirmWipe > 0 && (
            <button
              onClick={() => setConfirmWipe(0)}
              style={{
                background: "none",
                border: "none",
                color: "#9a8a7a",
                cursor: "pointer",
                fontFamily: "'Georgia', serif",
                fontSize: "0.8rem",
                textDecoration: "underline",
                marginTop: "4px",
              }}
            >
              Cancel Wipe
            </button>
          )}
        </>
        )}
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
            textAlign: "center",
            maxWidth: "80vw",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
