import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const headerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const cookieToken = req.cookies?.accessToken;

  const token = headerToken || cookieToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user to request
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
