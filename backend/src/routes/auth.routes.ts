import { Router } from 'express';
import { login, register, resendVerficationOtp, verifyEmail } from '../controllers/auth.controller.js'

const router = Router();

router.post("/register", register)
router.post("/verify-email", verifyEmail)
router.post("/resend-otp", resendVerficationOtp)
router.post("/login", login)
export default router;