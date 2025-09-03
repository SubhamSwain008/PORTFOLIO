import { useState, useEffect, useRef } from "react";
import axios from "axios";
import GradientText from "../pre/GradientText/GradientText";

export default function Assistant() {
  const [query, setQuery] = useState("");
  const [replies, setReplies] = useState(["Hello! Chat With me to get Info about Subham"]);
  const [msges, setMesges] = useState(["Chat not Started"]);
  const [cansend, setcansend] = useState(true);
  const [chat, setChat] = useState(false);
  const [angle, setAngle] = useState(0);
  const intervala = useRef(null);

  useEffect(() => {
    intervala.current = setInterval(() => {
      setAngle((prev) => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(intervala.current);
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

  return (
    <div>
      {chat ? (
        <div
          style={{
            padding: "1em",
            backdropFilter: "blur(0.5em)",
            borderRadius: "1.5em",
            boxShadow: "0 0.5em 2em rgba(0,0,0,0.6)",
            maxWidth: "75%",
            minWidth: "55%",
            margin: "1em ",
            color: "#eee",
            background: "rgba(20, 10, 30, 0.6)",
            border: "0.1em solid rgba(200,0,255,0.2)",
            transition: "all .3s ease-in-out",
          }}
        >
          {/* Close Button */}
          <button
            style={{
              float: "right",
              fontSize: "1.4em",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "50%",
              width: "2em",
              height: "2em",
              color: "#fff",
              transition: "background-color .3s ease, transform .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,0,80,0.7)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={() => setChat(false)}
          >
            ✕
          </button>

          {/* Header */}
          <GradientText colors={["#FFD700", "#8A2BE2", "#1E90FF"]} animationSpeed={6}>
            <div
              style={{
                fontSize: "2.2em",
                fontWeight: "900",
                textAlign: "center",
                marginBottom: "1em",
              }}
            >
              Use The Assistant
            </div>
          </GradientText>

          {/* Messages */}
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "0.5em",
              marginBottom: "1em",
              scrollbarWidth: "thin",
              scrollbarColor: "#8A2BE2 #1e1e1e",
            }}
          >
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {[...replies].reverse().map((element, idx) => {
                const msgIdx = replies.length - 1 - idx;
                return (
                  <li
                    key={idx}
                    style={{
                      marginBottom: "1em",
                      padding: "1em",
                      background:
                        "linear-gradient(135deg, rgba(90,0,140,0.85), rgba(50,0,90,0.85))",
                      borderRadius: "1em",
                      boxShadow: "0 0.4em 1em rgba(200,0,255,0.3)",
                      fontSize: "1.1em",
                      lineHeight: "1.5",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: "600", color: "#c084fc" }}>
                      <span style={{ opacity: 0.8 }}>User:</span> {msges[msgIdx]}
                    </p>
                    <p style={{ margin: "0.6em 0 0 0", fontWeight: "600", color: "#fc84ac" }}>
                      <span style={{ opacity: 0.8 }}>Dharampal:</span> {element}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Input + Button */}
     {/* Input + Button */}
<div
  style={{
    display: "flex",
    width: "100%",            // take full width of parent
    boxSizing: "border-box",  // include padding/border in width
    gap: "0.8em",
    marginTop: "1em",
  }}
>
  <input
    type="text"
    id="chat"
    placeholder="Type your message..."
    style={{
      flex: 1,
      minWidth: 0,               // <-- prevents overflow
      padding: "0.8em",
      borderRadius: "0.8em",
      border: "0.1em solid rgba(200,0,255,0.4)",
      background: "rgba(30,0,50,0.8)",
      color: "white",
      fontSize: "1em",
      outline: "none",
      boxSizing: "border-box",
    }}
    onChange={(e) => setQuery(e.target.value)}
  />
  {cansend ? (
    <button
      onClick={() => {
        getData();
        document.getElementById("chat").value = "";
        setcansend(false);
      }}
      style={{
        flex: "0 0 auto", // fixed size button
        padding: "0.8em 1.5em",
        borderRadius: "0.8em",
        border: "none",
        background:
          "linear-gradient(135deg, rgba(180,0,255,0.9), rgba(120,0,200,0.9))",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 0.4em 1em rgba(200,0,255,0.5)",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      Send
    </button>
  ) : (
    <button
      style={{
        flex: "0 0 auto",
        padding: "0.8em 1.5em",
        borderRadius: "0.8em",
        border: "none",
        background:
          "linear-gradient(135deg, rgba(105,99,108,0.9), rgba(120,0,200,0.9))",
        color: "white",
        fontWeight: "bold",
        cursor: "not-allowed",
      }}
    >
      Wait
    </button>
  )}
</div>


        </div>
      ) : (
        <button
          style={{
            margin: "3em auto",
            display: "block",
            padding: "1em 2em",
            borderRadius: "1.2em",
            border: "none",
            background: `linear-gradient(${angle}deg, #1e8fff, #ffd900, #892be2)`,
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 0.6em 1.2em rgba(0,0,0,0.4)",
            fontSize: "2em",
            transition: "background 1s ease, transform 0.2s ease",
          }}
          onClick={() => setChat(true)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🤖 <br /> Chat
        </button>
      )}
    </div>
  );
}
