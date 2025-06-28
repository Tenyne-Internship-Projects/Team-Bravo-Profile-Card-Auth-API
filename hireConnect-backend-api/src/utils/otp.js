import crypto from "crypto";
import { transporter } from "./mailer.js";

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function sendOtpEmail(to, otp) {
  const html = `
    <h3>OTP Verification</h3>
    <p>Your OTP code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
  }
  await transporter.sendMail({
    from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_ADMIN_EMAIL}>`,
    to,
    subject: "Your OTP Code",
    html,
  });
}
