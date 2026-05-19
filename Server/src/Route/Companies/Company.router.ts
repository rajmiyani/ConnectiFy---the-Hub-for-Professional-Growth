import express from "express"
import { registerCompany, loginCompany, verifyCompanyOTP, resendCompanyOTP, forgotPassword, resetPassword, getProfile, updateProfile, getDashboardStats, getCompanyAnalytics, refreshCompanyToken, logoutCompany } from "../../Controller/Companies/Company.controller.js"

const router = express.Router()

// PUBLIC ROUTES
router.post("/register", registerCompany)
router.post("/login", loginCompany)
router.post("/verify-otp", verifyCompanyOTP)
router.post("/resend-otp", resendCompanyOTP)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/refresh-token", refreshCompanyToken)
router.post("/logout", logoutCompany)

// PROTECTED ROUTES
import { authenticate } from "../../Middleware/AuthMiddleware.js"
import { authorize } from "../../Middleware/RoleMiddleware.js"

router.get("/profile/:id", authenticate, getProfile)
router.put("/profile/:companyId", authenticate, authorize(["company"]), updateProfile)
router.get("/stats/:companyId", authenticate, authorize(["company"]), getDashboardStats)
router.get("/analytics/:companyId", authenticate, authorize(["company"]), getCompanyAnalytics)

export default router
