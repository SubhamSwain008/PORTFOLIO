import re from "../src/assets/re.png"
import Fast from "../src/assets/fast.png"
import html from "../src/assets/html.png"
import tail from "../src/assets/tail.png"
import css from "../src/assets/cs.png"
import hug from "../src/assets/hug.png"
import js from "../src/assets/js.png"
import py from "../src/assets/py.png"
import me from "../src/assets/me.jpeg"
import { useEffect,useState, } from "react"
import LogoLoop from "../pre/LogoLoop/LogoLoop.jsx"

const UserProfile = () => {
  const user = {
    name: "Subham Swain",
    email: "subhamswain8456@gmail.com",
    bio: "4th year B.Tech CSE @ Parala Maharaja Engineering College, Berhampur, Odisha",
    skills:"Full Stack Dev && AI Enthusiatist",
    // avatar:me,
    techStack: {
      frontend: ["React", "HTML", "CSS", "JavaScript", "TailwindCSS"],
      backend: ["FastAPI", "Node.js"],
      ai: [
        "Fine-tuning LLMs on diverse tasks",
        "Adapting ASRs for new languages",
        "Improving TTS systems",
      ],
    },
  };

  const [postion,setPosition]=useState(0);
const imageLogos = [
  { src: re, alt: "", href: "" },
  { src: Fast, alt: "", href: "" },
  { src: html, alt: "", href: "" },
   { src:tail, alt: "", href: "" },
  { src:css, alt: "", href: "" },
  { src: hug, alt: "", href: "" },
  { src: js, alt: "", href: "" },
  { src: py, alt: "", href: "" },
];

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "2em ",
        backdropFilter: "blur(1px)", 
        borderRadius: "1em",
        padding: "2em",
        textAlign: "center",
       backgroundColor:"rgba(0, 0, 0, 0.32)",
       
        boxShadow: `0px 1px 6px rgba(255, 255, 255, 0.6)`,
        opacity:"1",
        justifyItems:"center",
        justifyContent:"center",
        
      }}
    >
       <img 
    
    alt="Subham's profile"
    style={{
      borderRadius: "1em",
      width: "250px",
      height: "100%",
      objectFit: "cover",
      zIndex:"100",
     
    }}

    src={me}
  />
   {/* Name */}
      <h1 style={{ color: "#FFECB3", fontSize: "2em", margin: "0.5em 0" }}>
        {user.name}
      </h1>
        <div style={{  position: 'relative', overflow: 'hidden',maxWidth:"105%",height:"10%",translateX:"-50%",}}>
      <LogoLoop
        logos={imageLogos}
        speed={50}
        direction="left"
        logoHeight={58}
        gap={40}
        pauseOnHover
        scaleOnHover
       
        
        ariaLabel="Technology partners"
      />
    </div>
     

     
      <p style={{ fontSize: "1.2em", color: "#fafafaff", marginBottom: "1.5em" }}>
        {user.bio}
      </p>

      {/* Skills */}
      <h2 style={{ fontSize: "2em", color: "#FFECB3", marginBottom: "0.5em" }}>
        Skills
      </h2>
      <p style={{ fontSize: "1.2em", color: "#ffffffff", marginBottom: "1em" }}>
        {user.skills}
      </p>

      {/* Tech Stack */}
      <h2 style={{ fontSize: "2em", color: "#FFECB3", marginBottom: "0.5em" }}
     
      >
        Tech Stack <br/>
      </h2>
         
      <div style={{ textAlign: "left", fontSize: "1.2em", color: "#ffffffff" }}>
        <p>
          <strong>Frontend:</strong> {user.techStack.frontend.join(", ")}
        </p>
        <p>
          <strong>Backend:</strong> {user.techStack.backend.join(", ")}
        </p>
        <p>
          <strong>AI:</strong><ul style={{ marginLeft: "3em" }}>
            {user.techStack.ai.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </p>
            
  {/* <img src={re} alt="React" style={{ width: "13%", objectFit: "contain" }} />

  <img src={html} alt="React" style={{ width: "13%", objectFit: "contain" }} />

  <img src={tail} alt="React"style={{ width: "13%", objectFit: "contain" }}/>
    <img src={css} alt="React" style={{ width: "13%", objectFit: "contain" }}/>
 <img src={hug} alt="React" style={{ width: "13%", objectFit: "contain" }}/>
  <img src={js} alt="React" style={{ width: "13%", objectFit: "contain" }}/>
   <img src={py} alt="React" style={{ width: "13%", objectFit: "contain" }} /> */}
  

      </div>
   
    </div>
  );
};

export default UserProfile;
