import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

if (process.env.NODE_ENV !== "production") {
  transporter.verify((err, success) => {
    if (err) {
      console.error("[MAILER] Transporter setup error:", err);
    } else {
      console.log("[MAILER] Transporter is ready to send emails");
    }
  });
}
