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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
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
