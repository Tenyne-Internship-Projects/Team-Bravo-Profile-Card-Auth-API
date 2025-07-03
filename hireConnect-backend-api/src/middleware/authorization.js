export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    const normalizedUserRole = userRole?.toLowerCase();

    if (
      !normalizedUserRole ||
      !normalizedAllowed.includes(normalizedUserRole)
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `Access denied. User role "${userRole}" not in allowed roles: [${allowedRoles.join(
            ", "
          )}]`
        );
      }

      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
