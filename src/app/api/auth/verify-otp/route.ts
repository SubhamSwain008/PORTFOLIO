import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ ok: false, error: "Email and OTP required" }, { status: 400 });
    }

    // Setup Neon HTTP connection
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "");

    const users = await sql`SELECT * FROM "users" WHERE "email" = ${email}`;
    const user = users[0];

    if (!user) {
      return NextResponse.json({ ok: false, error: "User or OTP not found" }, { status: 404 });
    }

    // Check expiry
    if (!user.otp_expires || new Date(user.otp_expires).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: "OTP expired" }, { status: 401 });
    }

    // Check match
    if (user.otp !== otp) {
      return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 401 });
    }

    // Clear OTP after successful verification
    await sql`UPDATE "users" SET "otp" = NULL, "otp_expires" = NULL WHERE "email" = ${email}`;

    // Set session cookie — simple base64 encoded email
    const token = Buffer.from(email).toString("base64");
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ ok: true, email });
  } catch (err: unknown) {
    console.error("verify-otp error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
