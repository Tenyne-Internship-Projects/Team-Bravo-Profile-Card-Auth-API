import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { requireRole } from "../middleware/authorization.js";
import { validate } from "../middleware/validate.js";
import { verifyToken } from "../middleware/verifyToken.js";

import {
  createProfile,
  getProfile,
  getAllProfiles,
  updateProfile,
  deleteProfile,
  updateAvailability,
  deleteDocument,
  uploadDocuments,
  getUserDataController,
} from "../controllers/profile.controller.js";

import {
  parseDocumentFiles,
  uploadAvatar,
  updateAvatar,
} from "../controllers/upload.js";

import {
  createProfileValidator,
  updateProfileValidator,
  searchProfilesValidator,
  uploadFilesValidator,
} from "../utils/validator.js";

const profileRouter = express.Router();

//  Profile CRUD Routes
profileRouter.post(
  "/",
  requireAuth,
  validate(createProfileValidator),
  createProfile
);
profileRouter.get("/", requireAuth, getProfile);
profileRouter.get(
  "/all",
  requireAuth,
  validate(searchProfilesValidator, "query"),
  requireRole("admin", "recruiter"),
  getAllProfiles
);
profileRouter.put(
  "/",
  requireAuth,
  validate(updateProfileValidator),
  updateProfile
);

profileRouter.get("/data", requireAuth, getUserDataController);

profileRouter.delete("/documents/:filename", requireAuth, deleteDocument);

profileRouter.delete("/", requireAuth, deleteProfile);

//  Availability Management
profileRouter.put("/availability", requireAuth, updateAvailability);

// Avatar Upload Route
profileRouter.post("/upload-avatar", requireAuth, uploadAvatar, updateAvatar);

// Document Upload Route
profileRouter.post(
  "/upload-documents",
  requireAuth,
  validate(uploadFilesValidator),
  parseDocumentFiles,
  uploadDocuments
);

export default profileRouter;
