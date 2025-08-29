import X from "../src/assets/x.png"
import linkedin from "../src/assets/linked.png"
import git from  "../src/assets/git.png"
import inst from "../src/assets/insta.png"
import { useEffect, useRef, useState } from "react"
export default function Social(){
    const[angle,setAngle]=useState(0);
    const intervala=useRef(null)
 useEffect(() => {
    intervala.current = setInterval(() => {
      setAngle((prev) => (prev + 1) % 360); // increase smoothly, loop at 360
    }, 10); // every 100ms

    return () => clearInterval(intervala.current); // cleanup
  }, []); 



    return(
        <div 
        
         style={{
        maxWidth: "100%",
        margin: "2em ",
        backdropFilter: "blur(1px)", 
        borderRadius: "1em",
        padding: "2em",
        textAlign: "center",
      
    //    backgroundColor:"rgba(0, 0, 0, 0.32)",
        // boxShadow: `0px 1px 6px rgba(255, 255, 255, 0.6)`,
        opacity:"1",
        justifyItems:"center",
        justifyContent:"center",
        
      }}>

  <div
  style={{
    // display: "grid",
    // gridTemplateColumns: "repeat(2, 1fr)", // 2 per row
    // gap: "25rem",
    // maxWidth: "300px",
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
      marginBottom:"100%"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 200, 255, 0.3)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <img src={X} alt="x.com" style={{ width: "5em"}} />
  </a>

  <a
    href="https://www.linkedin.com/in/subham-swain-8886a61b2/"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      background: `linear-gradient(${angle+50}deg,  #FFD700, #8A2BE2, #1E90FF)`,
     borderRadius: "1em",
      padding: "10%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "transform 0.2s ease, box-shadow 0.3s ease",
      marginBottom:"100%"
    }}
  >
    <img src={linkedin} alt="linkedin.com" style={{ width: "5em"}} />
  </a>

  <a
    href="https://github.com/SubhamSwain008"
    target="_blank"
    rel="noopener noreferrer"
    style={{
     background: `linear-gradient(${angle+100}deg,  #FFD700, #8A2BE2, #1E90FF)`,
    borderRadius: "1em",
      padding: "10%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "transform 0.2s ease, box-shadow 0.3s ease",
      marginBottom:"100%"
    }}
  >
    <img src={git} alt="github.com" style={{ width: "5em"}} />
  </a>

  <a
    href="https://www.instagram.com/subham_swain_x001/"
    target="_blank"
    rel="noopener noreferrer"
    style={{
     background: `linear-gradient(${angle+120}deg,  #FFD700, #8A2BE2, #1E90FF)`,
     borderRadius: "1em",
      padding: "10%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "transform 0.2s ease, box-shadow 0.3s ease",
      marginBottom:"100%"
    }}
  >
    <img src={inst} alt="instagram.com" style={{ width: "5em"}} />
  </a>
</div>

    
    
    </div>)
}