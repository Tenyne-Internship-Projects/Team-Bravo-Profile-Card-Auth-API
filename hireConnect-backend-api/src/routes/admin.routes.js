import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { checkRole } from "../middleware/roleCheck.js";
import { promoteToAdmin } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

// Promote user to admin (ADMIN-only route)
adminRouter.post(
  "/admin/promote/:userId",
  requireAuth,
  checkRole(["ADMIN"]),
  promoteToAdmin
);

export default adminRouter;
