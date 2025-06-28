import express from "express";
import passport from "passport";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js"; // Adjust path if utils is elsewhere

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

export default oauthRouter;
