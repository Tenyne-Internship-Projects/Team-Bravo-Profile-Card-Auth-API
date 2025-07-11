import express from "express";
import {
  register,
  login,
  logout,
  sendResetOtp,
  resetPasswordController,
  verifyEmail,
  resendOtp,
  refreshToken,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/authentication.js";
import { loginRateLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { registerValidator } from "../utils/validator.js";
import { prisma } from "../prisma/prismaClient.js";

const authRouter = express.Router();

authRouter.post("/register", validate(registerValidator), register);
authRouter.post("/resend-otp", resendOtp);
authRouter.post("/verify-otp", verifyEmail);
authRouter.post("/login", loginRateLimiter, login);
authRouter.post("/logout", logout);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/forgot-password", sendResetOtp);
authRouter.post("/reset-password", resetPasswordController);

// Updated debug route using Prisma
authRouter.get("/debug-reset-otp/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        reset_otp: true,
        reset_otp_expire_at: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Debug OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default authRouter;
