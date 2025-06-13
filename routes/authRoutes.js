import express from 'express';
import { register, login, logout, sendResetOtp, resetPasswordController, verifyEmail, resendOtp } from '../controllers/authController.js';
import { loginRateLimiter } from '../Middleware/rateLimit.js';
const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/resend-otp', resendOtp);
authRouter.post('/verify-otp', verifyEmail);
authRouter.post('/login', loginRateLimiter, login);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', sendResetOtp);
authRouter.post('/reset-password', resetPasswordController);
export default authRouter;