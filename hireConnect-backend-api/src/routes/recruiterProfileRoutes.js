import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { requireAuth } from "../middleware/authentication.js";
import { checkRole } from "../middleware/roleCheck.js";
import {
  fetchRecruiterProfile,
  saveRecruiterProfile,
  updateRecruiterProfile,
  uploadRecruiterAssets,
} from "../controllers/recruiterProfile.controller.js";

const recruiterProfileRouter = express.Router();

// GET: Fetch recruiter profile
recruiterProfileRouter.get(
  "/recruiter-profile",
  requireAuth,
  checkRole(["RECRUITER"]),
  fetchRecruiterProfile
);

// PUT: Create or fully replace recruiter profile
recruiterProfileRouter.put(
  "/recruiter-profile",
  requireAuth,
  checkRole(["RECRUITER"]),
  saveRecruiterProfile
);

// PATCH: Partially update recruiter profile (e.g. description, location)
recruiterProfileRouter.patch(
  "/recruiter-profile",
  requireAuth,
  checkRole(["RECRUITER"]),
  updateRecruiterProfile
);

// Route to upload recruiter logo and avatar
recruiterProfileRouter.post(
  "/recruiter-profile/upload",
  requireAuth,
  checkRole(["RECRUITER"]),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  uploadRecruiterAssets
);

export default recruiterProfileRouter;
