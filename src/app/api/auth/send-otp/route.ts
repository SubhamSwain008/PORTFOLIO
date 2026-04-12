import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const SENDER_EMAIL = process.env.senderEmail || "Acme <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP in database
    await prisma.otpVerification.upsert({
      where: { email },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email, otp, expiresAt },
    });

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Your Login Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #6a3a9a;">Login Authorization</h2>
          <p>Please use the following single-use code to authenticate. It will expire in 10 minutes.</p>
          <div style="background-color: #f4f4f4; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #888;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "OTP sent successfully" });
  } catch (err: unknown) {
    console.error("send-otp error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
