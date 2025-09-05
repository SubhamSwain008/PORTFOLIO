import X from "../src/assets/x.png";
import linkedin from "../src/assets/linked.png";
import git from "../src/assets/git.png";
import inst from "../src/assets/insta.png";
import { useEffect, useRef, useState } from "react";

export default function Social() {
  const [angle, setAngle] = useState(0);
  const intervala = useRef(null);

  useEffect(() => {
    intervala.current = setInterval(() => {
      setAngle((prev) => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(intervala.current);
  }, []);

  return (
    <div
      style={{
        maxWidth: "100%",
        minWidth:"85%",
        margin: "1em ",
        borderRadius: "1em",
        padding: "2em",
        textAlign: "center",
        opacity: "1",
        justifyItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="socials-wrap"
        style={{
          margin: "2rem auto",
          textAlign: "center",
        }}
      >
        <a
          href="https://x.com/subhams64965703"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: `linear-gradient(${angle}deg,  #FFD700, #8A2BE2, #1E90FF)`,
            borderRadius: "1em",
            padding: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.3s ease",
            marginBottom: "100%", // desktop default spacing (unchanged)
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(255, 200, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <img src={X} alt="x.com" style={{ width: "5em" }} />
        </a>

        <a
          href="https://www.linkedin.com/in/subham-swain-8886a61b2/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: `linear-gradient(${angle + 50}deg,  #FFD700, #8A2BE2, #1E90FF)`,
            borderRadius: "1em",
            padding: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.3s ease",
            marginBottom: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(255, 200, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <img src={linkedin} alt="linkedin.com" style={{ width: "5em" }} />
        </a>

        <a
          href="https://github.com/SubhamSwain008"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: `linear-gradient(${angle + 100}deg,  #FFD700, #8A2BE2, #1E90FF)`,
            borderRadius: "1em",
            padding: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.3s ease",
            marginBottom: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(255, 200, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <img src={git} alt="github.com" style={{ width: "5em" }} />
        </a>

        <a
          href="https://www.instagram.com/subham_swain_x001/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: `linear-gradient(${angle + 120}deg,  #FFD700, #8A2BE2, #1E90FF)`,
            borderRadius: "1em",
            padding: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "transform 0.2s ease, box-shadow 0.3s ease",
            marginBottom: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(255, 200, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <img src={inst} alt="instagram.com" style={{ width: "5em" }} />
        </a>
      </div>

      {/* Mobile-only overrides: smaller & horizontal in one line */}
      <style>{`
        @media (max-width: 915px) {
          .socials-wrap {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 0.75em !important;
            margin: 0.5em auto !important;
            flex-wrap: nowrap !important; /* one line */
          }
          .socials-wrap a {
            margin-bottom: 0 !important;        /* kill the 100% vertical gap */
            padding: 0.5em !important;          /* smaller blocks */
            border-radius: 0.75em !important;
          }
          .socials-wrap img {
            width: 2.6em !important;            /* smaller icons */
          }
        }
      `}</style>
    </div>
  );
}
