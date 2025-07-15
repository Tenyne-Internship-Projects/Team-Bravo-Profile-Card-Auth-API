import express from "express";
import passport from "passport";
import { prisma } from "../prisma/prismaClient.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
const oauthRouter = express.Router();

//  Google OAuth Routes
oauthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

oauthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const payload = {
      id: user.id || user._id || user.sub || "guest",
      email: user.emails?.[0]?.value || user.email || "unknown",
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Google login successful",
        accessToken,
      });
  }
);

//  GitHub OAuth Routes
oauthRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

oauthRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const payload = {
      id: user.id || user.nodeId || user._id || "guest",
      email: user.emails?.[0]?.value || user.email || "unknown",
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "GitHub login successful",
        accessToken,
      });
  }
);

// Check if user is authenticated (for auto-login / OAuth popup verification)
oauthRouter.get("/is-auth", async (req, res) => {
  try {
    if (req.isAuthenticated?.() && req.user) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (!user.is_account_verified) {
        return res.status(403).json({
          success: false,
          message: "Email not verified",
        });
      }

      return res.json({
        success: true,
        message: "User is authenticated",
        user,
      });
    }

    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  } catch (error) {
    console.error("OAuth /is-auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default oauthRouter;
