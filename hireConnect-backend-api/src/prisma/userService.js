import { prisma } from "./prismaClient.js";
import bcrypt from "bcrypt";
import { generateOTP, sendOTPEmail, hashOTP } from "../utils/otp.js";

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

  if (!otp || !otpHash || !expiresAt || typeof otpHash !== "string") {
    console.error("[ERROR] OTP or expiry is invalid");
    throw new Error("OTP generation failed");
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      email_otp_hash: otpHash,
      email_otp_expire_at: expiresAt,
    },
  });

  await sendOTPEmail(email, otp, user.name);
  return otp;
};

// Set OTP and expiration for password reset
export const setResetOtp = async (email, otp, expireAt) => {
  const otpHash = hashOTP(otp);

  if (!otp || !otpHash || !expireAt || typeof otpHash !== "string") {
    console.error("[ERROR] OTP or expiry is invalid in password reset");
    throw new Error("Failed to hash OTP");
  }

  return prisma.user.update({
    where: { email },
    data: {
      reset_otp_hash: otpHash,
      reset_otp_expire_at: expireAt,
    },
  });
};

//  Reset password using OTP
export const resetPassword = async (email, otp, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (
    !user ||
    !user.reset_otp_hash ||
    !user.reset_otp_expire_at ||
    new Date() > user.reset_otp_expire_at ||
    hashOTP(otp) !== user.reset_otp_hash
  ) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      reset_otp_hash: null,
      reset_otp_expire_at: null,
    },
  });

  return updatedUser;
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

// Create or update Admin profile
export async function upsertAdminProfile(userId, data) {
  const existing = await prisma.admin.findUnique({
    where: { user_id: userId },
  });

  if (existing) {
    return await prisma.admin.update({
      where: { user_id: userId },
      data,
    });
  } else {
    return await prisma.admin.create({
      data: {
        user_id: userId,
        ...data,
      },
    });
  }
}

// Get Admin profile
export async function getAdminProfile(userId) {
  return await prisma.admin.findUnique({
    where: { user_id: userId },
  });
}

// Create Client
export const createClient = async (
  userId,
  companyName = "My Company",
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

// Get client profile
export const getClientProfileByUserId = async (userId) => {
  return prisma.client.findUnique({ where: { user_id: userId } });
};

// Update client profile
export const updateClientProfileByUserId = async (userId, data = {}) => {
  const allowedFields = [
    "company_name",
    "website",
    "industry",
    "location",
    "description",
  ];

  // Build updateData with only allowed and defined fields
  const updateData = {};

  for (const field of allowedFields) {
    if (typeof data[field] !== "undefined") {
      updateData[field] = data[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  return await prisma.client.update({
    where: { user_id: userId },
    data: updateData,
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
  agencyName = "Default Agency",
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

// Create or update Recruiter profile
export async function upsertRecruiterProfile(userId, data) {
  const existing = await prisma.recruiter.findUnique({
    where: { user_id: userId },
  });

  if (existing) {
    return await prisma.recruiter.update({
      where: { user_id: userId },
      data,
    });
  } else {
    return await prisma.recruiter.create({
      data: {
        user_id: userId,
        ...data,
      },
    });
  }
}

// Get Recruiter profile
export async function getRecruiterProfile(userId) {
  return await prisma.recruiter.findUnique({
    where: { user_id: userId },
  });
}

export const updateRecruiterProfileByUserId = async (userId, data = {}) => {
  const {
    agency_name = undefined,
    position = undefined,
    company_size = undefined,
    description = undefined,
    location = undefined,
  } = data || {};

  return await prisma.recruiter.update({
    where: { user_id: userId },
    data: {
      ...(agency_name && { agency_name }),
      ...(position && { position }),
      ...(company_size && { company_size }),
      ...(description && { description }),
      ...(location && { location }),
    },
  });
};
