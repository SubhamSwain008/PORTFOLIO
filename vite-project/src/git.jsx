import { useEffect, useState } from "react";

function GitHubContributions({ username, token }) {
  const [calendar, setCalendar] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const query = `
        {
          user(login: "${username}") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    color
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Your GitHub PAT
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      setCalendar(
        result.data.user.contributionsCollection.contributionCalendar
      );
    }

    fetchData();
  }, [username, token]);

  if (!calendar) return <p>Loading...</p>;

  return (
    <div style={{ fontFamily: "monospace", textAlign: "center", maxWidth:"80vw",overflow:"auto"}}>
      <style>
  {`
    /* For Webkit browsers */
    ::-webkit-scrollbar {
      height: 11em;
      width: 1em;
    }
    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 1em;
    }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #8A2BE2, #1E90FF);
      border-radius: 1em;
      border: 2px solid rgba(0, 0, 0, 0.3);
    }
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #FFD700, #3300ffff);
    }

    /* Firefox */
    * {
      scrollbar-width: thin;
      scrollbar-color:  rgba(22, 59, 170, 0.3) rgba(0,0,0,0) ;
    }
  `}
</style>

      <h2 style={{ color: "#ffffff" }}>
        {calendar.totalContributions} Contributions
      </h2>
      <div style={{ display: "flex", gap: "2px" }}>
        {calendar.weeks.map((week, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {week.contributionDays.map((day, j) => (
                
              <div

                key={j}
                title={`${day.date} → ${day.contributionCount}`}
               style={{
    width: ".7em",
    height: ".7em",
    borderRadius: ".1em",
    backdropFilter: "blur(1px)", 
    backgroundColor: day.contributionCount === 0 
      ? "#8615f019"  // very light transparent green
      : `rgba(0, 255, 0, ${Math.min(0.9, day.contributionCount / 6)})`
      // contributionCount scales transparency
  }}
                
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GitHubContributions;
