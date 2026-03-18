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

    // Get user
    const users = await sql`SELECT "id" FROM "users" WHERE "email" = ${email}`;
    const user = users[0];
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Mark tutorial as completed
    await sql`
      UPDATE "user_game_state"
      SET "firstTimePlayed" = false, "updatedAt" = NOW()
      WHERE "userId" = ${user.id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("game/save-tutorial error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
