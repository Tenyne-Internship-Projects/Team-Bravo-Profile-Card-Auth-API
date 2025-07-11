import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authentication.js";
import { checkRole } from "../middleware/roleCheck.js";
import {
  getClientProfile,
  updateClientProfile,
  uploadClientLogo,
} from "../controllers/clientProfile.controller.js";

const clientProfileRouter = express.Router();
const upload = multer({ dest: "uploads/" });

clientProfileRouter.get(
  "/client-profile/me",
  requireAuth,
  checkRole(["CLIENT"]),
  getClientProfile
);
clientProfileRouter.put(
  "/client-profile",
  requireAuth,
  checkRole(["CLIENT"]),
  updateClientProfile
);
clientProfileRouter.post(
  "/client-profile/logo",
  requireAuth,
  checkRole(["CLIENT"]),
  upload.single("logo"),
  uploadClientLogo
);

export default clientProfileRouter;
