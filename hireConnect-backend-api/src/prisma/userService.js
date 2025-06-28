import { prisma } from "./prismaClient.js";
import bcrypt from "bcrypt";
import { generateOTP, sendOtpEmail, hashOTP } from "../utils/otp.js";

// 1. Create a new user
export const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
};

// 2. Get user by email
export const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// 3. Create OTP for email verification
export const createOTP = async (email) => {
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.user.update({
    where: { email },
    data: {
      email_otp_hash: otpHash,
      email_otp_expire_at: expiresAt,
    },
  });

  await sendOtpEmail(email, otp);
  return otp;
};

// 4. Set OTP and expiration for reset
export const setResetOtp = async (email, otp, expireAt) => {
  return prisma.user.update({
    where: { email },
    data: {
      reset_otp: otp,
      reset_otp_expire_at: new Date(expireAt * 1000),
    },
  });
};

// 5. Reset password using OTP
export const resetPassword = async (email, otp, hashedPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      reset_otp: otp,
      reset_otp_expire_at: {
        gt: new Date(),
      },
    },
  });

  if (!user) return null;

  return prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      reset_otp: null,
      reset_otp_expire_at: null,
    },
  });
};

// 6. Verify OTP and update account verification status
export const verifyUserByOtp = async (email, inputOtp) => {
  const user = await prisma.user.findUnique({ where: { email } });

  console.log("User:", user);
  console.log("Provided OTP:", inputOtp);
  console.log("Stored OTP:", user?.email_otp);
  console.log("Expires At:", user?.email_otp_expire_at);
  console.log("Now:", new Date());

  if (!user || !user.email_otp_hash || !user.email_otp_expire_at) {
    return null;
  }

  const inputHash = hashOTP(inputOtp);

  const isValid =
    inputHash === user.email_otp_hash && new Date() < user.email_otp_expire_at;

  if (!isValid) return null;

  return prisma.user.update({
    where: { email },
    data: {
      is_account_verified: true,
      email_otp_hash: null,
      email_otp_expire_at: null,
    },
  });
};
