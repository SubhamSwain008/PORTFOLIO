import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ani from "../src/assets/ass.gif";
import axios from "axios";
import GradientText from "../pre/GradientText/GradientText";

export default function Assistant({ setAsson }) {
  const [query, setQuery] = useState("");
  const [replies, setReplies] = useState(["Hello! Chat With me to get Info about Subham"]);
  const [msges, setMesges] = useState(["Chat not Started"]);
  const [cansend, setcansend] = useState(true);
  const [chat, setChat] = useState(false);
  const [angle, setAngle] = useState(0);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const intervala = useRef(null);

  // rotation (kept from your original)
  useEffect(() => {
    intervala.current = setInterval(
      () => setAngle((prev) => (prev + 1) % 360),
      30
    );
    return () => clearInterval(intervala.current);
  }, []);

  // screen resize listener
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function getData() {
    const trimmed = query.trim();
    if (!trimmed) return;

    // push user message locally
    setMesges((prev) => [...prev, trimmed]);
    setReplies((prev) => [...prev, "..."]); // placeholder while waiting
    setCansend(false);

    try {
      const send = await axios.put(
        "https://portfolio-backend-l6tl.onrender.com/msg",
        { msg: trimmed }
      );

      // replace the placeholder (last element) with real assistant reply
      setReplies((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = send.data.gemini || "(no response)";
        return copy;
      });
    } catch (e) {
      console.error(e);
      setReplies((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = "Sorry, failed to fetch reply";
        return copy;
      });
    } finally {
      setCansend(true);
      setQuery("");
    }
  }

  // small helper because I used the original variable name in a few spots
  function setCansend(val) {
    setcansend(val);
  }

  const isMobile = screenWidth <= 614;

  // Styles (inline so nothing from parent can accidentally hide them)
  const containerStyle = {
    position: "fixed",
    right: isMobile ? undefined : "10%",
    left: isMobile ? "50%" : undefined,
    transform: isMobile ? "translateX(-50%)" : undefined,
    top: isMobile ? "30%" : "13%",
    width: isMobile ? "90%" : "30%",
    height: isMobile ? "60vh" : "80vh",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(30px)",
    background:
      "linear-gradient(135deg, rgba(91,33,182,0.95), rgba(0,0,0,0.85))",
    borderRadius: "1.5em",
    padding: "1.2em",
    zIndex: 2147483647,
    color: "#E0E0E0",
    pointerEvents: "auto", // ensure inputs are clickable
    boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
    overflow: "hidden",
  };

  const floatingButtonStyle = {
    position: "fixed",
    // bottom: isMobile ? "20px" : undefined,
    top: isMobile ? "80%": "40%",
    right: isMobile ? "20px" : "10%",
    width: isMobile ? "90px" : "150px",
    height: isMobile ? "90px" : "150px",
    borderRadius: "50%",
    padding: "0.2em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2147483647,
    cursor: "pointer",
    boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
    background: "transparent",
  };

  // small helper UI used inside the assistant portal
  const assistantJSX = (
    <div aria-live="polite">
      {chat ? (
        <div className="assistant-container" style={containerStyle}>
          {/* Close Button */}
          <button
            aria-label="Close assistant"
            style={{
              color: "#FACC15",
              fontSize: "1.5em",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              alignSelf: "flex-end",
            }}
            onClick={() => setChat(false)}
          >
            ✕
          </button>

          {/* Header */}
          <GradientText colors={["#FACC15", "#A78BFA", "#EC4899"]} animationSpeed={6}>
            <div style={{ fontSize: "1.6rem", textAlign: "center", fontWeight: "900" }}>
              <h1 style={{ margin: 0 }}>THE ASSISTANT</h1>
            </div>
          </GradientText>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", marginTop: "0.5em", marginBottom: "0.5em" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[...replies].reverse().map((element, idx) => {
                const msgIdx = replies.length - 1 - idx;
                return (
                  <li
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,215,0,0.12)",
                      borderRadius: "1em",
                      margin: "0.5em 0",
                      padding: "0.8em",
                      boxShadow: "0 0 12px rgba(139,92,246,0.12)",
                      color: "#E0E0E0",
                      fontSize: "1rem",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#EC4899" }}>USER:</strong> {msges[msgIdx]}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#A78BFA" }}>ASSISTANT:</strong> {element}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Input + Button */}
          <div style={{ marginTop: "0.5em", display: "flex", gap: "0.5em" }}>
            <input
              type="text"
              id="chat"
              value={query}
              placeholder="Type your message..."
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cansend) getData();
              }}
              style={{
                flex: 1,
                padding: "0.7em 1em",
                borderRadius: "0.8em",
                border: "1px solid rgba(236,72,153,0.6)",
                background: "rgba(0,0,0,0.35)",
                color: "#E0E0E0",
                outline: "none",
                width: "80%",
                minWidth: 0,
              }}
            />

            {cansend ? (
              <button
                style={{
                  background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
                  border: "none",
                  padding: "0.6em 1.2em",
                  borderRadius: "0.8em",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 0 12px rgba(236,72,153,0.6)",
                  transition: "all 0.18s ease",
                }}
                onClick={() => {
                  getData();
                }}
              >
                Send
              </button>
            ) : (
              <button
                disabled
                style={{
                  background: "gray",
                  border: "none",
                  padding: "0.6em 1.2em",
                  borderRadius: "0.8em",
                  color: "white",
                }}
              >
                Wait
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          aria-label="Open assistant"
          style={floatingButtonStyle}
          className="assistant-button"
          onClick={() => setChat(true)}
        >
          <img
            src={ani}
            alt="assistant"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
              transform: `rotate(${angle}deg)`,
              willChange: "transform",
              imageRendering: "auto",
            }}
          />
        </button>
      )}
    </div>
  );

  // Render into body so it's outside any stacking context created by your app overlay
  if (typeof document === "undefined") return null;
  return createPortal(assistantJSX, document.body);
}
