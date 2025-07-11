import { prisma } from "./prismaClient.js";
import bcrypt from "bcrypt";
import { generateOTP, sendOtpEmail, hashOTP } from "../utils/otp.js";

//  Create a new user
export const createUser = async ({ name, email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
};


//  Get user by email
export const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// Create OTP for email verification
export const createOTP = async (email) => {
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

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

// Set OTP and expiration for password reset
export const setResetOtp = async (email, otp, expireAt) => {
  const otpHash = hashOTP(otp);

  return prisma.user.update({
    where: { email },
    data: {
      reset_otp: otpHash,
      reset_otp_expire_at: new Date(Date.now() + 20 * 60 * 1000),
    },
  });
};

//  Reset password using OTP
export const resetPassword = async (email, otp, newPassword) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, reason: "USER_NOT_FOUND" };
  }

  const { reset_otp, reset_otp_expire_at } = user;

  if (!reset_otp || !reset_otp_expire_at) {
    return { success: false, reason: "NO_OTP_REQUESTED" };
  }

  const isOtpExpired = new Date(reset_otp_expire_at) < new Date();
  if (isOtpExpired) {
    return { success: false, reason: "OTP_EXPIRED" };
  }

  const isOtpValid = await bcrypt.compare(otp, reset_otp);
  if (!isOtpValid) {
    return { success: false, reason: "INVALID_OTP" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      reset_otp: null,
      reset_otp_expire_at: null,
    },
  });

  return { success: true };
};


//  Verify OTP and update account verification status
export const verifyUserByOtp = async (email, inputOtp) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.email_otp_hash ||
    !user.email_otp_expire_at ||
    new Date() > user.email_otp_expire_at ||
    hashOTP(inputOtp) !== user.email_otp_hash
  ) {
    return null;
  }

  return prisma.user.update({
    where: { email },
    data: {
      is_account_verified: true,
      email_otp_hash: null,
      email_otp_expire_at: null,
    },
  });
};

// ROLE CREATION SERVICES

// Create Admin
export const createAdmin = async (
  userId,
  position = "System Administrator",
  canManageUsers = true
) => {
  return prisma.admin.create({
    data: {
      user_id: userId,
      position,
      can_manage_users: canManageUsers,
    },
  });
};

// Create Client
export const createClient = async (
  userId,
  companyName,
  website = "",
  industry = ""
) => {
  return prisma.client.create({
    data: {
      user_id: userId,
      company_name: companyName,
      website,
      industry,
    },
  });
};

// Create Freelancer
export const createFreelancer = async (
  userId,
  hourlyRate = 0.0,
  experienceLevel = "BEGINNER",
  skills = [],
  bio = "",
  portfolioLinks = []
) => {
  return prisma.freelancer.create({
    data: {
      user_id: userId,
      hourly_rate: hourlyRate,
      experience_level: experienceLevel,
      skills,
      bio,
      portfolio_links: portfolioLinks,
    },
  });
};

// Create Recruiter
export const createRecruiter = async (
  userId,
  agencyName,
  position = "Talent Acquisition Specialist",
  companySize = "",
  verified = false
) => {
  return prisma.recruiter.create({
    data: {
      user_id: userId,
      agency_name: agencyName,
      position,
      company_size: companySize,
      verified,
    },
  });
};
