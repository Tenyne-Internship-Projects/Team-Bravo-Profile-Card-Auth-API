import express from 'express';
import { auth } from '../Middleware/authentication.js';
import { createProfile, getProfile, updateProfile, deleteProfile, updateAvailability } from '../controllers/profileController.js';
import { updateAvatar, uploadAvatar } from '../controllers/upload.js';

const profileRouter = express.Router();

profileRouter.post('/create', auth, createProfile);
profileRouter.post('/upload-avatar', auth, uploadAvatar, updateAvatar);
profileRouter.get('/get', auth, getProfile);
profileRouter.put('/update', auth, updateProfile);
profileRouter.put('/avalability', auth, updateAvailability);
profileRouter.delete('/delete', auth, deleteProfile);
export default profileRouter;
