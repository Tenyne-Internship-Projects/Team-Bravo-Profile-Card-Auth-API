import express from 'express';
import multer from 'multer';
import  requireAuth  from '../middleware/authentication.js';
import { checkRole } from '../middleware/roleCheck.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/project.controler.js';


const projectRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// PROJECT ROUTES
projectRouter.post('/', requireAuth,
  checkRole(['ADMIN', 'CLIENT', 'RECRUITER', 'FREELANCER']),
  upload.array('attachments'), createProject
);
// search generally by keyword and budget or skill
projectRouter.get('/', getProjects); 
projectRouter.get('/:id', getProjectById);
projectRouter.put('/:id', requireAuth, updateProject);
projectRouter.delete('/:id', requireAuth, deleteProject);



export default projectRouter;