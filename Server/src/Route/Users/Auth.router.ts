import { Router } from "express";
import { register, verifyOTP, resendOTP, forgotPassword, resetPassword, login, refreshToken, logout } from "../../Controller/Users/Auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);


export default router;