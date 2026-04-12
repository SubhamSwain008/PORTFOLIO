import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  // No token / malformed token → unambiguously unauthenticated
  if (!token) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  let email: string;
  try {
    email = Buffer.from(token, "base64").toString("utf-8");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }

  // DB lookup — any failure here must NOT log the user out.
  // Return 503 so the client knows to retry instead of clearing session state.
  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "");
    const users = await sql`SELECT "id" FROM "users" WHERE "email" = ${email}`;
    const user = users[0];
    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }
    return NextResponse.json({ ok: true, email, userId: user.id });
  } catch (err) {
    console.error("/api/auth/me DB error:", err);
    return NextResponse.json(
      { ok: false, error: "Service unavailable", transient: true },
      { status: 503 }
    );
  }
}
