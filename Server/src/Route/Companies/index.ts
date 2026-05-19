import { Router } from "express"
import CompanyRouter from "./Company.router.js"
import JobRouter from "./Job.router.js"
import InterviewRouter from "./Interview.router.js"
import SettingsRouter from "./Settings.router.js"
import NetworkRouter from "./Network.router.js"
import NotificationRouter from "./Notification.router.js"
import { authenticate } from "../../Middleware/AuthMiddleware.js"
import { authorize } from "../../Middleware/RoleMiddleware.js"

const router = Router()

// Public Routes (Company)
router.use("/", CompanyRouter) // Login/Register are inside CompanyRouter

// Protected Routes (Company)
router.use("/jobs", authenticate, authorize(["company"]), JobRouter)
router.use("/interviews", authenticate, authorize(["company"]), InterviewRouter)
router.use("/settings", authenticate, authorize(["company"]), SettingsRouter)
router.use("/network", authenticate, authorize(["company"]), NetworkRouter)
router.use("/notifications", authenticate, authorize(["company"]), NotificationRouter)

export default router
