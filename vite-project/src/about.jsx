
export default function About(){

  

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
  <h1 style={{ color: "#FFECB3", fontSize: "2rem", marginBottom: "0.5em" }}>
    About Me
  </h1>
<div style={{textAlign:"left"}}>
  <p style={{ fontSize: "1.2rem", color: "#ffffffff", lineHeight: "1.6", marginBottom: "1em" }}>
    I’m Subham Swain, a 4th-year B.Tech CSE student at Parala Maharaja Engineering College in Berhampur, Odisha. My journey in technology began with curiosity and quickly evolved into a passion for creating solutions that combine innovation and practicality.  
  </p>

  <p style={{ fontSize: "1.2rem", color: "#ffffffff", lineHeight: "1.6", marginBottom: "1em" }}>
    I thrive on challenges and love experimenting with new ideas. Working with AI, language models, and speech systems has taught me the power of persistence and creativity. Every project I take on is an opportunity to learn, grow, and push the boundaries of what technology can achieve.  
  </p>

  <p style={{ fontSize: "1.2rem", color: "#ffffffff", lineHeight: "1.6" }}>
    Beyond coding, I’m driven by curiosity and a desire to make meaningful contributions. I enjoy exploring new tools, collaborating with other developers, and turning ideas into projects that can have a real impact. For me, technology is more than a career — it’s a way to express creativity, solve problems, and leave a mark.  
  </p>
</div>


    </div>)
}