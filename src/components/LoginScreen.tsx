"use client";

import { useState } from "react";
import { setSessionState } from "./useSessionStore";

export default function LoginScreen() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setStep("otp");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (data.ok) {
        setSessionState({
          appPhase: "game",
          mode: "login",
          userEmail: data.email,
        });
      } else {
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
    if (e.key === "Enter") {
      handleVerifyOTP();
    }
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
        {step === "email" ? "Enter Your Email" : "Verification Code"}
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
        {step === "email"
          ? "We'll send you a one-time code"
          : `Code sent to ${email}`}
      </p>

      {/* Form */}
      <div style={{ width: 340, maxWidth: "90vw" }}>
        {step === "email" ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
              placeholder="your@email.com"
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(154, 106, 255, 0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(154, 106, 255, 0.25)")
              }
              autoFocus
            />
            <button
              onClick={handleSendOTP}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 16,
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
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        ) : (
          <>
            {/* OTP inputs */}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  maxLength={1}
                  autoFocus={i === 0}
                  style={{
                    ...inputStyle,
                    width: 48,
                    height: 56,
                    textAlign: "center",
                    fontSize: "1.4rem",
                    padding: 0,
                    letterSpacing: 0,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(154, 106, 255, 0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(154, 106, 255, 0.25)")
                  }
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOTP}
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
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              onClick={() => {
                setStep("email");
                setOtp(["", "", "", "", "", ""]);
                setError("");
              }}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "10px 0",
                background: "none",
                border: "1px solid rgba(154, 106, 255, 0.15)",
                borderRadius: 10,
                color: "#9a8a7a",
                fontFamily: "'Georgia', serif",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              Resend Code
            </button>
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
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
