import { Router } from "express";
import { prisma } from "../prisma/prismaClient.js";
import { hashOTP } from "../utils/otp.js";

const router = Router();

/**
 * Test route: manually sets an OTP hash and expiry for a user
 * GET /api/test/test-set-otp
 */
router.get("/test-set-otp", async (req, res) => {
  try {
    const testEmail = "eseogheneikoyo23@gmail.com";
    const otp = "123456";
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 mins from now

    const updatedUser = await prisma.user.update({
      where: { email: testEmail },
      data: {
        email_otp_hash: otpHash,
        email_otp_expire_at: expiresAt,
      },
    });

    return res.json({
      success: true,
      message: "OTP hash and expiry set successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        email_otp_hash: updatedUser.email_otp_hash,
        email_otp_expire_at: updatedUser.email_otp_expire_at,
      },
      otp, // for debugging only
    });
  } catch (error) {
    console.error("[ERROR] /test-set-otp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
