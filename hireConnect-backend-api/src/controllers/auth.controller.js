import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  getUserByEmail,
  createOTP,
  setResetOtp,
  resetPassword,
  verifyUserByOtp,
  createAdmin,
  createClient,
  createFreelancer,
  createRecruiter,
} from "../prisma/userService.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { sendOTPEmail } from "../utils/otp.js";
import { registerValidator } from "../utils/validator.js";

export const register = async (req, res) => {
  const { error } = registerValidator.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { name, email, password, role, secret } = req.body;

  // Role validation
  const allowedRoles = ["FREELANCER", "CLIENT", "RECRUITER", "ADMIN"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid role selected. Only FREELANCER, CLIENT, RECRUITER, or ADMIN are allowed.",
    });
  }

  // ADMIN registration security
  if (role === "ADMIN" && secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized to register as ADMIN",
    });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const user = await createUser({ name, email, password, role });

    // Create role-specific profile
    if (role === "ADMIN") {
      await createAdmin(user.id, "System Administrator", true);
    }
    if (role === "CLIENT") {
      await createClient(user.id);
    }
    if (role === "FREELANCER") {
      await createFreelancer(user.id);
    }
    if (role === "RECRUITER") {
      await createRecruiter(user.id);
    }

    const otp = await createOTP(email);
    await sendOTPEmail(email, otp, user.name);

    if (process.env.NODE_ENV !== "production") {
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(201).json({
      success: true,
      message: "User registered. OTP sent to email.",
      user,
    });
  } catch (err) {
    console.error("Registration error:", err);
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const verified = await verifyUserByOtp(email, otp);
    if (!verified) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const payload = {
      id: verified.id,
      email: verified.email,
      ...(verified.role && { role: verified.role }),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      accessToken,
    });
  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    if (!user.is_account_verified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.is_account_verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Refresh token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken({ id: decoded.id });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ success: true, message: "Access token refreshed" });
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });

  try {
    const user = await getUserByEmail(email);
    if (!user)
      return res.status(400).json({ success: false, message: "No user found" });

    const otp = generateOTP();
    const expireAt = new Date(Date.now() + 20 * 60 * 1000);

    await setResetOtp(email, otp, expireAt);
    await sendOTPEmail(email, otp, user.name);

    res.json({ success: true, message: "Reset OTP sent to email" });
  } catch (error) {
    console.error("sendResetOtp error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const user = await resetPassword(email, otp, newPassword);

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });

  try {
    const user = await getUserByEmail(email);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.is_account_verified)
      return res
        .status(400)
        .json({ success: false, message: "Account is already verified" });

    const otp = await createOTP(email);
    await sendOTPEmail(email, otp, user.name);

    if (process.env.NODE_ENV !== "production") {
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.error("Error resending OTP:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const isAuth = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Just a minimal check — useful for frontend auth guards
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
