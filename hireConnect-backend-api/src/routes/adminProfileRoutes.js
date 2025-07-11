// adminProfileRoutes.js
import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authentication.js";
import { checkRole } from "../middleware/roleCheck.js";
import {
  fetchAdminProfile,
  updateAdminProfile,
  uploadAdminAvatar,
} from "../controllers/adminProfile.controller.js";

const adminProfileRouter = express.Router();
const upload = multer({ dest: "uploads/" });

adminProfileRouter.get(
  "/admin-profile",
  requireAuth,
  checkRole(["ADMIN"]),
  fetchAdminProfile
);
adminProfileRouter.put(
  "/admin-profile",
  requireAuth,
  checkRole(["ADMIN"]),
  updateAdminProfile
);

adminProfileRouter.post(
  "/admin-profile/upload",
  requireAuth,
  checkRole(["ADMIN"]),
  upload.single("avatar"),
  uploadAdminAvatar
);

export default adminProfileRouter;
