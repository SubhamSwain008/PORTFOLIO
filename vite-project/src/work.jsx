export default function Work(){

    

    return(<div
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
        
<div style={{ padding: "1rem", maxWidth: "600px" }}>
  <h1
    style={{
      background: "linear-gradient(135deg, #FFECB3, #FFD54F)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "1rem",
      textAlign: "left",
    }}
  >
    Work Experience
  </h1>

  <ul style={{ listStyleType:"inherit", paddingLeft: "1.5rem", color: "#E0E0E0" ,textAlign: "left",}}>
    <li style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: "2rem", fontWeight: "600" }}>
        Research Intern at IIT Patna
      </div>
      <div style={{ fontSize: "0.95rem", marginTop: "0.3rem" }}>
        Worked with ASRs, LLMs, and TTS, conducted various expriments and still on going
      </div>
      <div style={{ color: "#FFD700", fontSize: "0.9rem", marginTop: "0.3rem" }}>
        (01-06-2025 To ongoing)
      </div>
    </li>

    <li>
      <div style={{ fontSize: "2rem", fontWeight: "600" }}>Self Learning</div>
      <div style={{ fontSize: "0.95rem", marginTop: "0.3rem" }}>
        Started with learning Html ,css , js . learnt React , various backends Django, Fastapi , Nodejs. 
        explored ml and dl , learnt python and things are on going
      </div>
      <div style={{ color: "#FFD700", fontSize: "0.9rem", marginTop: "0.3rem" }}>
        (01-11-2022 To ongoing)
      </div>
    </li>
  </ul>
</div>

    </div>)
}