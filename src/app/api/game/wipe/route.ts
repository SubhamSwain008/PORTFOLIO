import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const email = Buffer.from(token, "base64").toString("utf-8");
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    const { neon } = require("@neondatabase/serverless");
    const sql = neon(process.env.neon_db_direct || process.env.neon_db || "");

    const users = await sql`SELECT "id" FROM "users" WHERE "email" = ${email}`;
    const user = users[0];
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Wipe game state and replace with default values
    await sql`
      UPDATE "user_game_state" 
      SET 
        "inventory" = '[]'::jsonb,
        "hunger" = 100,
        "health" = 100,
        "positionX" = 0,
        "positionY" = 1.3,
        "positionZ" = 8,
        "currentWorld" = 'hall',
        "firstTimePlayed" = true,
        "currentChapter" = 1,
        "storyConversations" = '[]'::jsonb,
        "chapterCompleted" = '[]'::jsonb,
        "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("game/wipe error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
