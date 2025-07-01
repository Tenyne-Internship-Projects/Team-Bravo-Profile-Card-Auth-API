import express from 'express';
import multer from 'multer';
import  requireAuth  from '../middleware/authentication.js';
import { checkRole } from '../middleware/'; // in progree
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/project.controler.js';
import { applyToProject } from '../controllers/application.controler.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// PROJECT ROUTES
router.post(
  '/',
  authenticate,
  checkRole(['ADMIN', 'CLIENT', 'RECRUITER', 'FREELANCER']),
  upload.array('attachments'),
  createProject
);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', requireAuth, updateProject);
router.delete('/:id', requireAuth, deleteProject);

// APPLICATION ROUTE
router.post('/:projectId/apply', authenticate, checkRole(['FREELANCER']), applyToProject);

export default router;