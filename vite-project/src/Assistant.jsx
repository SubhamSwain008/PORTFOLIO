import { useState, useEffect, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axios from "axios";
import GradientText from "../pre/GradientText/GradientText";

export default function Assistant({ setAsson }) {
  const [query, setQuery] = useState("");
  const [replies, setReplies] = useState([
    "Hello! Chat With me to get Info about Subham",
  ]);
  const [msges, setMesges] = useState(["Chat not Started"]);
  const [cansend, setcansend] = useState(true);
  const [chat, setChat] = useState(false);
  const [angle, setAngle] = useState(0);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const intervala = useRef(null);

  // rotation
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
    try {
      setMesges((prev) => [...prev, query]);
      const send = await axios.put("http://127.0.0.1:8000/msg", { msg: query });
      setReplies((prev) => [...prev, send.data.gemini]);
      setcansend(true);
    } catch (e) {
      console.log(e);
    }
  }

  // Sidebar chat container (desktop default)
  const containerStyle = {
    position: "fixed",
    right: "10%",
    top: "13%",
    width: "20%",
    height: "500px",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(30px)",
    background:
      "linear-gradient(135deg, rgba(91,33,182,0.95), rgba(0, 0, 0, 0.85))",
    borderRadius: "1.5em",
    padding: "1.2em",
    zIndex: 100,
  };

  // Floating button (desktop default)
  const buttonStyle = {
    position: "fixed",
    top: "40%",
    right: "10%",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    padding: "0.2em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  return (
    <div >
      {chat ? (
        <div className="assistant-container" style={containerStyle}>
          <style>
            {`
            /* Tablet view */
            @media (max-width: 916px){
              .assistant-container {
                width: 70% !important;
                height: 400px !important;
                right: 5% !important;
                top: 15% !important;
              }
            }

            /* Mobile view */
            @media (max-width: 614px){
              .assistant-container {
                width: 90% !important;
                height: 350px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                 top: 30% !important;
              }
            }
            `}
          </style>

          {/* Close Button */}
          <button
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
          <GradientText
            colors={["#FACC15", "#A78BFA", "#EC4899"]}
            animationSpeed={6}
          >
            <div
              style={{
                fontSize: "2rem",
                textAlign: "center",
                fontWeight: "900",
              }}
            >
              <h1>THE ASSISTANT</h1>
            </div>
          </GradientText>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginTop: "0.5em",
              marginBottom: "0.5em",
            }}
          >
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[...replies].reverse().map((element, idx) => {
                const msgIdx = replies.length - 1 - idx;
                return (
                  <li
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,215,0,0.3)",
                      borderRadius: "1em",
                      margin: "0.5em 0",
                      padding: "0.8em",
                      boxShadow: "0 0 12px rgba(139,92,246,0.5)",
                    
                    }}
                  >
                    <p style={{ color: "#E0E0E0", fontSize: "1.2rem" }}>
                      <span
                        style={{ color: "#EC4899", fontWeight: "bold" }}
                      >
                        USER:
                      </span>{" "}
                      {msges[msgIdx]}
                    </p>
                    <p style={{ color: "#FACC15", fontSize: "1.2rem" }}>
                      <span
                        style={{ color: "#A78BFA", fontWeight: "bold" }}
                      >
                        ASSISTANT:
                      </span>{" "}
                      {element}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Input + Button */}
          <div style={{ marginTop: "0.5em", display: "flex" }}>
            <input
              type="text"
              id="chat"
              placeholder="Type your message..."
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "0.7em 1em",
                borderRadius: "0.8em",
                border: "1px solid rgba(236,72,153,0.6)",
                background: "rgba(0,0,0,0.3)",
                color: "#E0E0E0",
                outline: "none",
                marginRight: "0.5em",
                width: "80%",
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
                  transition: "all 0.3s ease",
                }}
                onClick={() => {
                  getData();
                  document.getElementById("chat").value = "";
                  setcansend(false);
                }}
              >
                Send
              </button>
            ) : (
              <button
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
          style={buttonStyle}
          className="assistant-button"
          onClick={() => setChat(true)}
        >
          <style>
            {`
            /* Tablet view */
            @media (max-width: 916px){
              .assistant-button {
                width: 100px !important;
                height: 100px !important;
                right: 5% !important;
                top: 20% !important;
              }
            }

            /* Mobile view */
            @media (max-width: 614px){
              .assistant-button {
                width: 100px !important;
                height: 100px !important;
               
                right: 10px !important;
                top: 40% !important;
                
              }
            }
            `}
          </style>
          <DotLottieReact
            src="../src/assets/bot.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </button>
      )}
    </div>
  );
}
