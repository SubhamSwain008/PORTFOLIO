import { useEffect,useState } from "react";
import GradientText from "../pre/GradientText/GradientText.jsx";
export default function NavBar({setProfile,setAbout,setProjects,setVisbleWelcome,setWork}) {


  return (
  
    <nav
      style={{
        fontFamily:"fantasy",
        fontSize:"200%",
        
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "1%",
        backdropFilter: "blur(10px)", 
        color: "#F5FAE1",           
        fontWeight: "bold",
        boxShadow: `0px 1px 5px rgba(255, 255, 255, 0.6)`,

        backgroundColor:"rgba(0, 0, 0, 0.22)",
       
        position:"sticky",
        top:"0px",
        opacity:"1",
       
        zIndex:"1000",
        
      }}
    >
      <div style={{ cursor: "pointer" }}
      onClick={()=>{setProfile(p=>p=true)
                    setAbout(a=>a=false)
                    setProjects(p=>p=false)
                    setVisbleWelcome(p=>p=false)
                  setWork(p=>p=false)
      }}
      >
          <GradientText
  colors={["#FFD700", "#8A2BE2", "#1E90FF"]
}
  animationSpeed={3}
  showBorder={false}
  className="custom-class"
>
   Profile
</GradientText>
       </div>
      <div style={{ cursor: "pointer" }}
      
      onClick={()=>{setProfile(p=>p=false)
                    setAbout(a=>a=true)
                    setProjects(p=>p=false)
                    setVisbleWelcome(p=>p=false)
                    setWork(p=>p=false)
      }}

      >
      
       <GradientText
  colors={["#FFD700", "#8A2BE2", "#1E90FF"]
}
  animationSpeed={3.5}
  showBorder={false}
  className="custom-class"
>
  About
</GradientText>
      </div>
      <div style={{ cursor: "pointer" }}
      
      onClick={()=>{setProfile(p=>p=false)
                    setAbout(a=>a=false)
                    setProjects(p=>p=true)
                    setVisbleWelcome(p=>p=false)
                    setWork(p=>p=false)
      }}
      
      >
      
       <GradientText
  colors={["#FFD700", "#8A2BE2", "#1E90FF"]
}
  animationSpeed={4}
  showBorder={false}
  className="custom-class"
>
  Projects
</GradientText>
      </div>
    <div style={{ cursor: "pointer" }}
      
      onClick={()=>{setProfile(p=>p=false)
                    setAbout(a=>a=false)
                    setProjects(p=>p=false)
                    setVisbleWelcome(p=>p=false)
                   setWork(p=>p=true)
      }}
      
      >
      
       <GradientText
  colors={["#FFD700", "#8A2BE2", "#1E90FF"]
}
  animationSpeed={4}
  showBorder={false}
  className="custom-class"
>
  Work experience
</GradientText>
      </div>
    <div style={{ cursor: "pointer" }}
      
      onClick={()=>{setProfile(p=>p=false)
                    setAbout(a=>a=false)
                    setProjects(p=>p=true)
                    setVisbleWelcome(p=>p=false)
                    // setAssistant(p=>p=false)
      }}
      
      >
      
       <GradientText
  colors={["#FFD700", "#8A2BE2", "#1E90FF"]
}
  animationSpeed={4}
  showBorder={false}
  className="custom-class"
>
  Contacts
</GradientText>
      </div>
    </nav>
  );
}
