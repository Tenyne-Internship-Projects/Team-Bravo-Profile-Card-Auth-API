import express from "express";
import passport from "passport";
import { prisma } from "../prisma/prismaClient.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { cookieOptions } from "../utils/cookies.js";

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
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .redirect(`${process.env.CLIENT_URL}/oauth-success?token=${accessToken}`);
}

oauthRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GITHUB CALLBACK ONLY
oauthRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    try {
      const email =
        req.user.emails?.[0]?.value ||
        req.user.email ||
        `noemail+${req.user.id}@github.com`;
      const name = req.user.displayName || req.user.username || "GitHub User";

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: "oauth_login",
            role: "FREELANCER", // adjust as needed
            is_account_verified: true,
          },
        });
      }

      sendOAuthTokens(res, user, "GitHub");
    } catch (err) {
      console.error("OAuth GitHub callback error:", err);
      res.redirect(`${process.env.CLIENT_URL}/oauth-failed`);
    }
  }
);

export default oauthRouter;
