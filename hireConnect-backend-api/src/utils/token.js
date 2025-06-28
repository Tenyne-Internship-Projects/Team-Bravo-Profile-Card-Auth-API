import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email,
    ...(user.role && { role: user.role }),
  }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Short-lived
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email,
    ...(user.role && { role: user.role }),
  }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};
