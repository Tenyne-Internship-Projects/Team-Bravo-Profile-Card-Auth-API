import bcrypt from "bcrypt";
import { transporter } from "./mailer.js";

// Generate 6-digit numeric OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Securely hash OTP using bcrypt
import crypto from "crypto";

export function hashOTP(otp) {
  if (!otp || typeof otp !== "string") {
    throw new Error("Invalid OTP passed to hashOTP");
  }

  try {
    return crypto.createHash("sha256").update(otp).digest("hex");
  } catch (err) {
    console.error("[hashOTP ERROR]", err);
    throw new Error("Failed to hash OTP");
  }
}

// Send OTP via email
export async function sendOTPEmail (to, otp, name = "there") {
  const logoUrl = "https://hireconnect-app.vercel.app/assets/kconnect.png";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <div style="text-align: center;">
        <img src="${logoUrl}" alt="HireConnect Logo" style="max-width: 150px; margin-bottom: 20px;" />
      </div>
      <h2 style="color: #4d0892;">HireConnect OTP Verification</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your OTP code is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #4d0892;">${otp}</p>
      <p>This code will expire in 20 minutes.</p>
      <br/>
      <p style="color: #999; font-size: 12px;">If you didn’t request this, please ignore this email.</p>
      <hr />
      <p style="text-align: center; font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} HireConnect. All rights reserved.</p>
    </div>
  `;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_ADMIN_EMAIL}>`,
      to,
      subject: "Your OTP Code - HireConnect",
      html,
    });
    console.log(`[EMAIL SENT] to ${to}: messageId=${info.messageId}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] to ${to}:`, err);
  }
}

