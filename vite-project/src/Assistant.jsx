import { useState,useEffect,useRef } from "react";
import axios from 'axios';
import GradientText from "../pre/GradientText/GradientText";
export default function Assistant(){
    const [query,setQuery]=useState("");
    const [replies,setReplies]=useState(["Hello! Chat With me to get Info about Subham"]);
    const [msges,setMesges]=useState(["Chat not Started"]);
    const[cansend,setcansend]=useState(true);
    const[chat,setChat]=useState(false);
     const[angle,setAngle]=useState(0);
    const intervala=useRef(null)
 useEffect(() => {
    intervala.current = setInterval(() => {
      setAngle((prev) => (prev + 1) % 360); // increase smoothly, loop at 360
    }, 20); // every 100ms

    return () => clearInterval(intervala.current); // cleanup
  }, []); 
    async function getData(){
    try{
       setMesges(prev=>[...prev,query])
       const send = await axios.put("http://127.0.0.1:8000/msg", {
          msg: query,
        
        });
        
    
        console.log(send.data.gemini);
        setReplies(prev => [...prev, send.data.gemini]);
        setcansend(c=>c=true);
       
       
    }
     catch(e){
       console.log(e)
     }
     
     
    }
 
    return (<div> 
      {chat? <div
  style={{
//  background: `linear-gradient(150deg,  #FFD700, #8A2BE2, #1E90FF)`,
    padding: "1rem",
     backdropFilter: "blur(1px)", 
    borderRadius: "12px",
    boxShadow: "0 0 12px rgba(0, 0, 0, 0.4)",
    maxWidth: "600px",
    minWidth: "550px",
    margin: "2rem auto",
    color: "#eee",
    
    backgroundColor:"rgba(0, 0, 0, 0.32)",
  }}
>
  <button
  style={{
    justifySelf: "right",
    fontSize: "2em",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    paddingLeft:".2em",
    paddingRight:".2em",
    borderRadius:"1em",
    transition:"background-color .2s ease-in"
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ff0000ff")}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  onClick={()=>setChat(c=>c=false)}
>
  X
</button>

    <GradientText
    colors={["#FFD700", "#8A2BE2", "#1E90FF"]
  }
    animationSpeed={6}
    showBorder={false}
    className="custom-class"
  >
    <div style={{fontSize:"200%",fontWeight:"900"}}>Use The Assitant</div>
  </GradientText>
  {/* Scrollable messages area */}
  <div
  style={{
    maxHeight: "500px",      // limit height
    overflowY: "auto",       // enable vertical scroll
    paddingRight: "0.5rem",  // avoid text clipping under scrollbar
  }}
>
  <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
    {[...replies].reverse().map((element, idx) => {
      // match the correct message with reversed index
      const msgIdx = replies.length - 1 - idx;
      return (
        <li
          key={idx}
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            background:
              "linear-gradient(135deg, rgba(80,0,120,0.9), rgba(40,0,60,0.9))",
            borderRadius: "10px",
            boxShadow: "0 0 6px rgba(200,0,255,0.4)",
            fontSize:"1.5em"
          }}
        >
          <p style={{ margin: 0, fontWeight: "600", color: "#c084fc" }}>
            User: {msges[msgIdx]}
          </p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontWeight: "600",
              color: "#fc84acff",
            }}
          >
            Dharampal: {element}
          </p>
        </li>
      );
    })}
  </ul>
</div>


  {/* Input + Button */}
  <div style={{ display: "flex", marginTop: "1rem" }}>
    <input
      type="text"
      id="chat"
      placeholder="Type your message..."
      style={{
        flex: 1,
        padding: "0.6rem",
        borderRadius: "8px",
        border: "1px solid rgba(200,0,255,0.3)",
        background: "rgba(30,0,50,0.9)",
        color: "white",
        outline: "none",
      }}
      onChange={(e) => {
        setQuery(e.target.value);
      }}
    />

    {cansend? <button
      onClick={() => {
        getData();
        document.getElementById("chat").value = "";
        setcansend(c=>c=false)
      }}
      style={{
        marginLeft: "0.5rem",
        padding: "0.6rem 1rem",
        borderRadius: "8px",
        border: "none",
        background:
          "linear-gradient(135deg, rgba(180,0,255,0.9), rgba(120,0,200,0.9))",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 0 8px rgba(200,0,255,0.5)",
      }}
    >
      Send
    </button>: <button
      style={{
        marginLeft: "0.5rem",
        padding: "0.6rem 1rem",
        borderRadius: "8px",
        border: "none",
        background:
          "linear-gradient(135deg, rgba(105, 99, 108, 0.9), rgba(120,0,200,0.9))",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 0 8px rgba(200,0,255,0.5)",
      }}
    >
      Wait
    </button>}
   
  </div>
</div>:<button style={{
        marginLeft: "0.5rem",
        padding: "0.6rem 1rem",
        borderRadius: "8px",
        border: "none",
        background:
          `linear-gradient(${angle}deg,  #1e8fffd6, #ffd900c9, #892be2c2`,
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 0 8px rgba(200,0,255,0.5)",
        fontSize:"2em",
        transition:"background 1s ease"
      }}
      onClick={()=>setChat(t=>t=true)}
      
      >🤖<br/> Chat</button>} 
   

    </div>)


}