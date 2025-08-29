import { useState, useEffect } from "react";
import flappy from "../src/assets/flappy.png";
import git from "../src/assets/git.png";

export default function Projects() {
  const pro1 = {
    name: "Flappy Bird game in React",
    desc: `Just a flappy bird game made using React that heavily relied on 
           JavaScript and hooks like useState, useEffect, useRef, setInterval, etc. 
           This project refreshed my React skills after a break.`,
    github: `https://github.com/SubhamSwain008/Flappy_game.git`,
    image: flappy,
    video: "",
  };

  const pro2 = {
    name: "Fine tuning Llama For English to Odia Translation",
    desc: `Fine tuning llama 3.2 1B model for English→Odia translation. 
           Final loss after 1 epoch was ~0.4. Unable to find proper scores due to time constraints.`,
    github: `https://github.com/SubhamSwain008/LLAMA_FINTUING_ENG_TO_ODIA_TRANSLATE.git`,
    image: "",
    video: "",
  };

  const projectarr = [pro1, pro2];

  const [currentPro, setCurrentpro] = useState(projectarr[0]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (counter < projectarr.length) {
      setCurrentpro(projectarr[counter]);
    } else {
      setCounter(0);
      setCurrentpro(projectarr[0]);
    }
  }, [counter]);

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
        boxShadow: `0px 1px 5px rgba(255, 255, 255, 0.6)`,
        opacity:"1",
        justifyItems:"center",
        justifyContent:"center",
        
      }}
    >
      <h1 style={{ color: "#FFECB3", fontSize: "1.8em", margin: "0.5em 0" }}>
        {currentPro.name}
      </h1>
      <h1 style={{ color: "#fff", fontSize: "1.2em", margin: "0.5em 0" ,textAlign:"left"}}>
        {currentPro.desc}
      </h1>

      <a
        style={{ color: "#fff", fontSize: "1.2em", margin: "0.5em 0" ,boxShadow: `0px 1px 5px rgba(255, 255, 255, 0.6)`,}}
        href={currentPro.github}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={git} style={{ justifySelf: "center", width: "8%",boxShadow: `0px 1px 6px rgba(255, 255, 255, 0.6)`,borderRadius:"50%",backgroundColor:"wheat" }} />
      </a>
      <br />

      <button
        style={{
          backgroundColor: "black",
          color: "wheat",
          padding: "12px",
          borderRadius: "30%",
        }}
        onClick={() => setCounter((c) => c + 1)}
      >
        Next
      </button>
    </div>
  );
}
