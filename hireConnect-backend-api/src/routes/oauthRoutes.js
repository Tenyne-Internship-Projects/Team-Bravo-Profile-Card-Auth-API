import express from "express";
import passport from "passport";
import { prisma } from "../prisma/prismaClient.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

const oauthRouter = express.Router();

// Reusable token response helper
function sendOAuthTokens(res, user, provider = "OAuth") {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message: `${provider} login successful`,
      accessToken,
    });
}

// GOOGLE
oauthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

oauthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const email = req.user.emails?.[0]?.value || req.user.email || "unknown";
      const name = req.user.displayName || "Google User";

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: "oauth_login",
            role: "FREELANCER",
            is_account_verified: true,
          },
        });
      }

      sendOAuthTokens(res, user, "Google");
    } catch (err) {
      console.error("OAuth Google callback error:", err);
      res.status(500).json({ success: false, message: "OAuth login failed" });
    }
  }
);

// GITHUB
oauthRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

oauthRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const email = req.user.emails?.[0]?.value || req.user.email || "unknown";
      const name = req.user.displayName || req.user.username || "GitHub User";

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: "oauth_login",
            role: "FREELANCER",
            is_account_verified: true,
          },
        });
      }

      sendOAuthTokens(res, user, "GitHub");
    } catch (err) {
      console.error("OAuth GitHub callback error:", err);
      res.status(500).json({
        success: false,
        message: "OAuth GitHub login failed",
      });
    }
  }
);

// AUTH CHECK
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
