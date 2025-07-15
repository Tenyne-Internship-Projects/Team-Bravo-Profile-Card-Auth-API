import getFreelancerMetrics from "../prisma/metricsService.js";

export const getMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const metrics = await getFreelancerMetrics(userId);
    res.status(200).json(metrics);
  } catch (error) {
    console.error("[METRICS_CONTROLLER_ERROR]", error.message);
    res.status(500).json({ message: "Failed to load metrics" });
  }
};