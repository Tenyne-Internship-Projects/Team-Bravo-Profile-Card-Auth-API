import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { checkRole } from "../middleware/roleCheck.js";
import { applyToProject } from "../controllers/application.controller.js";

const applicationRouter = express.Router();

//  Correct and RESTful
applicationRouter.post(
  "/projects/:projectId/apply",
  requireAuth,
  checkRole(["FREELANCER"]),
  applyToProject
);

export default applicationRouter;
