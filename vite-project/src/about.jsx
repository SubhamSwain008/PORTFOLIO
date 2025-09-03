export default function About() {
  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "2em",
        backdropFilter: "blur(1px)",
        borderRadius: "1em",
        padding: "2em",
        textAlign: "center",
        backgroundColor: "rgba(0, 0, 0, 0.32)",
        boxShadow: `0px 1px 5px rgba(255, 255, 255, 0.6)`,
        opacity: "1",
        justifyItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ color: "#FFECB3", fontSize: "2rem", marginBottom: "0.5em" }}>
        About Me
      </h1>

      <div style={{ textAlign: "left" }}>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#ffffffff",
            lineHeight: "1.6",
            marginBottom: "1em",
          }}
        >
          I’m Subham Swain, a 4th-year B.Tech CSE student at Parala Maharaja
          Engineering College in Berhampur, Odisha. My journey in technology
          began with curiosity and quickly evolved into a passion for creating
          solutions that combine innovation and practicality.
        </p>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#ffffffff",
            lineHeight: "1.6",
            marginBottom: "1em",
          }}
        >
          I thrive on challenges and love experimenting with new ideas. Working
          with AI, language models, and speech systems has taught me the power
          of persistence and creativity. Every project I take on is an
          opportunity to learn, grow, and push the boundaries of what technology
          can achieve.
        </p>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#ffffffff",
            lineHeight: "1.6",
          }}
        >
          Beyond coding, I’m driven by curiosity and a desire to make meaningful
          contributions. I enjoy exploring new tools, collaborating with other
          developers, and turning ideas into projects that can have a real
          impact. For me, technology is more than a career — it’s a way to
          express creativity, solve problems, and leave a mark.
        </p>
      </div>

      {/* Contact Section */}
      <div
        style={{
          marginTop: "2em",
          padding: "1.5em",
          borderRadius: "0.8em",
          backgroundColor: "rgba(255, 236, 179, 0.08)",
          boxShadow: `0px 1px 5px rgba(255, 255, 255, 0.4)`,
          textAlign: "left",
        }}
      >
        <h2
          style={{
            color: "#FFECB3",
            fontSize: "1.6rem",
            marginBottom: "1em",
            borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
            paddingBottom: "0.5em",
          }}
        >
          Contact Me
        </h2>

        <p style={{ fontSize: "1.1rem", color: "#fff", margin: "0.5em 0" }}>
          📞 <strong>Phone:</strong> 8117032137 / 8917566897
        </p>
        <p style={{ fontSize: "1.1rem", color: "#fff", margin: "0.5em 0" }}>
          ✉️ <strong>Email:</strong>{" "}
          <a
            href="mailto:subhamswain8456@gmail.com"
            style={{ color: "#FFECB3", textDecoration: "none" }}
          >
            subhamswain8456@gmail.com
          </a>
        </p>
        <p style={{ fontSize: "1.1rem", color: "#fff", margin: "0.5em 0" }}>
          💬 <strong>WhatsApp:</strong>{" "}
          <a
            href="https://wa.me/918917566897"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#FFECB3", textDecoration: "none" }}
          >
            8917566897
          </a>
        </p>
      </div>
    </div>
  );
}
