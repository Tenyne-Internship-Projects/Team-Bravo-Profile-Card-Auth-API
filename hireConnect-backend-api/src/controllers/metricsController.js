import {
  getFreelancerMetricsService,
  getClientMetricsService,
  getAdminMetricsService,
} from "../prisma/metricsService.js";

export const getMetrics = async (req, res) => {
  const user = req.user;

  try {
    if (!user) return res.status(403).json({ message: "Unauthorized" });

    if (user.role === "FREELANCER") {
      const data = await getFreelancerMetricsService(user.id);
      return res.status(200).json(data);
    }

    if (user.role === "CLIENT") {
      const data = await getClientMetricsService(user.id, prisma);
      return res.status(200).json(data);
    }

    if (user.role === "ADMIN") {
      const data = await getAdminMetricsService(prisma);
      return res.status(200).json(data);
    }

    return res.status(403).json({ message: "Role not supported for metrics" });
  } catch (error) {
    console.error("[METRICS_ERROR]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
