import express from 'express';
import  requireAuth  from '../middleware/authentication.js';
import { checkRole } from '../middleware/roleCheck.js'; 
import { applyToProject } from '../controllers/application.controler.js';
const applicationRouter = express.Router();


// APPLICATION ROUTE
applicationRouter.post('/apply', requireAuth, checkRole(['FREELANCER']), applyToProject);

export default applicationRouter;