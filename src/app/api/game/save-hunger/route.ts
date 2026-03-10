import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const email = Buffer.from(token, "base64").toString("utf-8");
  if (!email || !email.includes("@")) return null;

  const { neon } = require("@neondatabase/serverless");
  const sql = neon(process.env.neon_db_direct || process.env.neon_db || "");
  const users = await sql`SELECT "id" FROM "users" WHERE "email" = ${email}`;
  return users[0]?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const { hunger } = await req.json();
    if (typeof hunger !== "number") {
      return NextResponse.json({ ok: false, error: "hunger required" }, { status: 400 });
    }

    const { neon } = require("@neondatabase/serverless");
    const sql = neon(process.env.neon_db_direct || process.env.neon_db || "");

    await sql`
      INSERT INTO "user_game_state" ("userId", "hunger", "positionX", "positionY", "positionZ", "currentWorld", "updatedAt")
      VALUES (${userId}, ${hunger}, 0, 1.3, 8, 'night', NOW())
      ON CONFLICT ("userId") DO UPDATE SET
        "hunger" = ${hunger},
        "updatedAt" = NOW()
    `;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("save-hunger error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
