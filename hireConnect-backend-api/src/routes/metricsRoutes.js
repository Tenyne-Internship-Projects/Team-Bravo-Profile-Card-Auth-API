import express from "express";
import { getMetrics } from "../controllers/metricsController.js";
import { requireAuth } from "../middleware/authentication.js";

const router = express.Router();
router.get("/metrics", requireAuth, getMetrics);
export default router;