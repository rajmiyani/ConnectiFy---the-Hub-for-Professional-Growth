import { Router } from "express"

// Import feature routers
import UserRoutes from "./Users/index.js"
import CompanyRoutes from "./Companies/index.js"
import AdminRoutes from "./Admin/Admin.router.js"

const router = Router()

/**
 * API Versioning
 */

router.use("/users", UserRoutes)
router.use("/companies", CompanyRoutes)
router.use("/admin", AdminRoutes)

export default router
