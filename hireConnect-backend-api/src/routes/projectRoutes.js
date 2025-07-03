import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authentication.js";
import { checkRole } from "../middleware/roleCheck.js";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller.js";

const projectRouter = express.Router();
const upload = multer({ dest: "uploads/" });

// PROJECT ROUTES

// Create a new project (with file attachments)
projectRouter.post(
  "/",
  requireAuth,
  checkRole(["ADMIN", "CLIENT", "RECRUITER"]),
  upload.array("attachments"),
  createProjectController
);

// Get all projects (with filters like keyword, budget, skills)
projectRouter.get("/", getProjectsController);

// Get a single project by ID
projectRouter.get("/:id", getProjectByIdController);

// Update a project (protected + role check)
projectRouter.put(
  "/:id",
  requireAuth,
  checkRole(["ADMIN", "CLIENT", "RECRUITER"]),
  updateProjectController
);

// Delete a project (protected + role check)
projectRouter.delete(
  "/:id",
  requireAuth,
  checkRole(["ADMIN", "CLIENT"]),
  deleteProjectController
);

export default projectRouter;
