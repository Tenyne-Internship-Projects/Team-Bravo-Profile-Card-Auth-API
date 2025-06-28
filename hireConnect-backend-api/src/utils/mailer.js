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

export const sendOTPEmail = async (to, otp) => {
  console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
  // await transporter.sendMail({
  //   from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_ADMIN_EMAIL}>`,
  //   to,
  //   subject: 'Your OTP Code',
  //   html: `<p>Your OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>`,
  // });
  return;
};
