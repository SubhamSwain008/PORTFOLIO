import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./navbar";
import UserProfile from "./profile";
import TextType from "../pre/TextType/TextType.jsx";
import About from "./about.jsx";
import Projects from "./projects.jsx";
import Work from "./work.jsx";
import video from "../src/assets/background.mp4";
import Assistant from "./Assistant.jsx";
import Social from "./social.jsx";
import GitHubContributions from "./git.jsx";

function App() {
  const [profile, setProfile] = useState(false);
  const [about, setAbout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [project, setProjects] = useState(false);
  const [visible_welcome, setVisbleWelcome] = useState(true);
  const [work, setWork] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      const tok = await axios.get("http://127.0.0.1:8000/");
      setToken(tok.data.Hello);
    })();
  }, []);

  return (
    <>
      {/* Background Video (always full screen) */}
      <div
        style={{
          position: "fixed",
          top: "0px",
          left: "0px",
          right: "0px",
          bottom: "0px",
          zIndex: "-100",
          opacity: "1",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Overlay that grows with content */}
      <div
        style={{
          backdropFilter: "blur(15px)",
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.22)",
        }}
      >
        <NavBar
          setProfile={setProfile}
          setAbout={setAbout}
          setProjects={setProjects}
          setVisbleWelcome={setVisbleWelcome}
          setWork={setWork}
        />

        {/* Assistant widget */}
        <div
          style={{
            display: "flex",
            marginTop: "10%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: "16%",
            right: "3%",
            zIndex: 100,
            width: "30%",
            height: "10%",
            borderRadius: "4em",
            padding: "0%",
          }}
        >
          <Assistant />
        </div>

        {/* Social links */}
        <div
          style={{
            marginTop: "5%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: "1%",
            left: "0%",
            zIndex: 100,
            width: "15%",
            height: "10%",
            borderRadius: "4em",
          }}
        >
          <Social />
        </div>

        {/* Welcome message */}
        <div style={{ textAlign: "left", marginTop: "4%", marginRight: "33%", marginLeft: "8%" ,}}>
          {visible_welcome && (
            <div
              style={{
                maxWidth: "100%",
                margin: "2em",
                borderRadius: "1em",
                padding: "2em",
                textAlign: "left",
                opacity: "1",
                justifyItems: "left",
                justifyContent: "left",
                minHeight:"40em"
                
              }}
            >
              <h1
                style={{
                  fontSize: "4em",
                  fontWeight: "500",
                  background: "linear-gradient(135deg, #FFD700, #8A2BE2, #1E90FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                <TextType
                  text={[
                    `Welcome to my portfolio`,
                    "A space that brings together my journey,skills, and projects in one place.",
                    " With an integrated assistant always available to guide you, answer your questions, and help you explore every detail about me with ease",
                    "Thank you!",
                  ]}
                  typingSpeed={80}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                />
              </h1>
            </div>
          )}
        </div>

        {/* Main content sections */}
        <div style={{ textAlign: "center" }}>
          <div style={{ marginTop: "5%", marginRight: "33%", marginLeft: "15%" }}>
            {profile ? <UserProfile /> : ""}
          </div>
          <div style={{ marginTop: "5%", marginRight: "33%", marginLeft: "15%" }}>
            {about && <About />}
          </div>
          <div style={{ marginTop: "5%", marginRight: "33%", marginLeft: "15%" }}>
            {project && <Projects />}
          </div>
          <div style={{ marginTop: "5%", marginRight: "33%", marginLeft: "15%" }}>
            {work && <Work />}
          </div>

          <div style={{ marginTop: "1%", fontSize: "3em", justifySelf: "center" }}>
            <GitHubContributions username="SubhamSwain008" token={token} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
