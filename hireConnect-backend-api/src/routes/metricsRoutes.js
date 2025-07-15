import express from "express";
import { getMetrics } from "../controllers/metricsController.js";
import { requireAuth } from "../middleware/authentication.js";

const metricsRoutes = express.Router();
metricsRoutes.get("/metrics", requireAuth, getMetrics);
export default metricsRoutes;