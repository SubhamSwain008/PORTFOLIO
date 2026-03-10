import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
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

    // Get user
    const users = await sql`SELECT "id" FROM "users" WHERE "email" = ${email}`;
    const user = users[0];
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Get or create game state
    let rows = await sql`SELECT * FROM "user_game_state" WHERE "userId" = ${userId}`;

    if (rows.length === 0) {
      // Create default game state
      await sql`
        INSERT INTO "user_game_state" ("userId", "inventory", "hunger", "health", "positionX", "positionY", "positionZ", "currentWorld", "updatedAt")
        VALUES (${userId}, '[]'::jsonb, 100, 100, 0, 1.3, 8, 'night', NOW())
      `;
      rows = await sql`SELECT * FROM "user_game_state" WHERE "userId" = ${userId}`;
    }

    const state = rows[0];

    return NextResponse.json({
      ok: true,
      inventory: state.inventory || [],
      hunger: state.hunger ?? 100,
      health: state.health ?? 100,
      position: {
        x: state.positionX,
        y: state.positionY,
        z: state.positionZ,
      },
      currentWorld: state.currentWorld || "night",
    });
  } catch (err: unknown) {
    console.error("game/load error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
