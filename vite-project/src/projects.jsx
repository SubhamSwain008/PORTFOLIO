import { useState, useEffect } from "react";
import flappy from "../src/assets/flappy.png";
import git from "../src/assets/git.png"; 
import e2o from "../src/assets/e2o.png"; 
import stt from "../src/assets/odiastt.png"; 

import llm from "../src/assets/llm.png"; 
export default function Projects() {
  const pro1 = {
    name: "Flappy Bird game in React",
    desc: `A flappy bird clone built in React. 
           Used JavaScript, hooks like useState, useEffect, useRef, 
           and setInterval to handle the game logic and animations. 
           This project refreshed my React skills after a break.`,
    github: `https://github.com/SubhamSwain008/Flappy_game.git`,
    image: flappy,
    video: "",
  };

  const pro2 = {
    name: "Fine Tuning Llama for English → Odia Translation",
    desc: `Fine-tuned the LLaMA 3.2 1B model for machine translation. 
           Achieved ~0.4 loss after 1 epoch. 
           Evaluation metrics were skipped due to time constraints, 
           but the results showed promising direction.`,
    github: `https://github.com/SubhamSwain008/LLAMA_FINTUING_ENG_TO_ODIA_TRANSLATE.git`,
    image: e2o,
    video: "",
  };

  const pro3 = {
    name: "Fine Tuning Automatic Speech Recognition for Odia STT",
    desc: `Automatic Speech Recognition (ASR) has advanced rapidly with multilingual models like Whisper, but Odia remains one of the Indian languages with little to no native support.

Whisper, despite being multilingual, doesn’t officially support Odia. Instead, due to similarities in script and pronunciation, it often misinterprets Odia as Bengali, leading to incorrect transcriptions and poor real-world usability.

To address this, I fine-tuned Whisper on Odia speech data, using Bengali as the base language. Since Whisper internally aligns Odia closer to Bengali, this approach allowed me to improve transcription quality significantly without training a model from scratch.

 The result: a Whisper model that now understands and transcribes Odia far more accurately. This improves accessibility and usability for millions of native speakers.

Odia is spoken by over 35 million people. Supporting it in ASR systems isn't just a technical milestone ,it's a step toward greater linguistic inclusion in AI.
`,
    github: `https://github.com/SubhamSwain008/Fine_tuning_ASR.git`,
    image: stt,
    video: "",
  };

   const pro4 = {
    name: "building a full end-to-end voice-assisted system by connecting multiple models together.",
    desc: `Here’s how I designed it:
👂 Speech-to-Text (Hindi ASR)
 Instead of relying on a generic service, I deployed a fine-tuned Whisper Small of the self model to transcribe Hindi audio into text in real-time.
🧠 Core Processing (LLM)
 The transcribed text is passed to LLaMA 3.2 (3B model) which handles natural language understanding and generates meaningful responses. This is the “brain” of the assistant, ensuring contextual, accurate replies.
🗣️ Text-to-Speech (Hindi)
 To make the assistant respond naturally in voice, I integrated Meta’s facebook/mms-tts-hin model. It converts the LLaMA responses back into Hindi speech, closing the human-like interaction loop.
⚡ Tech Stack Integration
Frontend: React for user interaction.
Middleware: Node.js to handle event flow.
Backend: FastAPI to serve the models efficiently.
Model Orchestration: All three (ASR → LLM → TTS) are connected synchronously to enable smooth real-time conversations.
This wasn’t just about making a chatbot speak ,it was about orchestrating multiple open-source models to build a working Hindi voice assistant from scratch.`,
    github: `https://github.com/SubhamSwain008/LLAMA_BASED_VOICE_ASSISTANT.git`,
    image: llm,
    video: "",
  };

  const projectarr = [pro1, pro2,pro3,pro4];

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
        maxWidth: "900px",
        margin: "2em auto",
        backdropFilter: "blur(1px)",
        borderRadius: "1em",
        padding: "2em",
        backgroundColor: "rgba(0, 0, 0, 0.32)",
        boxShadow: `0px 2px 10px rgba(255, 255, 255, 0.4)`,
        textAlign: "center",
      }}
    >
      {/* Project Title */}
      <h2
        style={{
          color: "#FFECB3",
          fontSize: "2em",
          marginBottom: "0.5em",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
        }}
      >
        {currentPro.name}
      </h2>

      {/* Project Description */}
      <p
        style={{
          color: "#fff",
          fontSize: "1.1em",
          lineHeight: "1.6em",
          textAlign: "justify",
          marginBottom: "1.5em",
        }}
      >
        {currentPro.desc}
      </p>

      {/* Project Image */}
      {currentPro.image && (
        <img
          src={currentPro.image}
          alt={currentPro.name}
          style={{
            width: "100%",
            maxHeight: "100%",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "1.5em",
            boxShadow: `0px 2px 8px rgba(255, 255, 255, 0.5)`,
            backgroundColor: "wheat",
          }}
        />
      )}

      {/* GitHub Link */}
      <div style={{ marginBottom: "1.5em" }}>
        <a
          href={currentPro.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            textDecoration: "none",
            
          }}
        >
          <img
            src={git}
            alt="GitHub Repo"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              boxShadow: `0px 2px 8px rgba(255, 255, 255, 0.5)`,
              backgroundColor: "wheat",
              padding: "5px",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <h2 style={{color: "wheat",marginTop:"20%"}}>visit repo</h2>
        </a>
      </div>

      {/* Next Button */}
      <button
        onClick={() => setCounter((c) => c + 1)}
        style={{
          backgroundColor: "black",
          color: "wheat",
          padding: "12px 20px",
          borderRadius: "30px",
          fontSize: "1em",
          fontWeight: "bold",
          cursor: "pointer",
          border: "2px solid wheat",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "wheat";
          e.currentTarget.style.color = "black";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "wheat";
        }}
      >
        Next Project →
      </button>
    </div>
  );
}
