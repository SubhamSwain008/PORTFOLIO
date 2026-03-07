import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert user with OTP securely via Neon's HTTP driver (works on Edge and blocked networks)
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "");
    
    await sql`
      INSERT INTO "users" ("email", "otp", "otp_expires", "created_at")
      VALUES (${email}, ${otp}, ${expiresAt}, NOW())
      ON CONFLICT ("email")
      DO UPDATE SET
        "otp" = EXCLUDED."otp",
        "otp_expires" = EXCLUDED."otp_expires";
    `;
    console.log("Sending OTP via Resend...");

    const { data, error } = await resend.emails.send({
      from: "The GAME <onboarding@resend.dev>",
      to: [email],
      subject: "Your Login Code",
      html: `
        <div style="font-family: Georgia, serif; background: #0a0a1a; color: #e0d0c0; padding: 40px; text-align: center;">
          <h1 style="color: #9a6aff; letter-spacing: 0.2em; font-weight: 300;">The GAME</h1>
          <p style="font-size: 1.1rem; margin: 20px 0;">Your verification code:</p>
          <div style="font-size: 2.5rem; letter-spacing: 0.5em; color: #9a6aff; background: rgba(154,106,255,0.1); display: inline-block; padding: 16px 32px; border-radius: 12px; border: 1px solid rgba(154,106,255,0.3);">
            ${otp}
          </div>
          <p style="color: #9a8a7a; margin-top: 24px; font-size: 0.85rem;">This code expires in 5 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("OTP email sent. Response:", JSON.stringify(data));

    return NextResponse.json({ ok: true, message: "OTP sent" });
  } catch (err: unknown) {
    console.error("send-otp error:", err);
    let errorMsg = "Unknown error";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
