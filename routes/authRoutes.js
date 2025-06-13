import express from 'express';
import { register, login, logout, sendResetOtp, resetPasswordController, verifyEmail, resendOtp } from '../controllers/authController.js';
const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/resend-otp', resendOtp);
authRouter.post('/verify-otp', verifyEmail);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', sendResetOtp);
authRouter.post('/reset-password', resetPasswordController);
export default authRouter;