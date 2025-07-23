import { OAuth2Client } from "google-auth-library";
import { cookieOptions } from "../utils/cookies.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleAuth = async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ error: "Missing ID token" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const provider = "google";
    const providerId = payload.sub;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider,
          providerId,
        },
      });
    }

    const accessToken = generateToken(user); // sign JWT
    const refreshToken = generateToken(user, "30d"); // optional

    res
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie("token", accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: `Google login successful`,
        accessToken,
      });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ error: "Invalid ID token" });
  }
};

export default handleGoogleAuth;
