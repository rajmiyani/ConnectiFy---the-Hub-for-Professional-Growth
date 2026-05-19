import { Router } from "express"
import AuthRouter from "./Auth.router.js"
import ProfileRouter from "./Profile.router.js"
import PostRouter from "./Post.router.js"
import InteractionRouter from "./Interaction.router.js"
import NetworkRouter from "./Network.router.js"
import NotificationRouter from "./Notification.router.js"
import JobRouter from "./Job.router.js"
import ChatRouter from "./Chat.router.js"
import MockInterviewRouter from "./MockInterview.router.js"
import { authenticate } from "../../Middleware/AuthMiddleware.js"

const router = Router()

// Public User Routes
router.use("/", AuthRouter)

// Authenticated User Routes
router.use("/profile", authenticate, ProfileRouter)
router.use("/posts", authenticate, PostRouter)
router.use("/interaction", authenticate, InteractionRouter)
router.use("/network", authenticate, NetworkRouter)
router.use("/notifications", authenticate, NotificationRouter)
router.use("/jobs", authenticate, JobRouter)
router.use("/chat", authenticate, ChatRouter)
router.use("/mock-interview", authenticate, MockInterviewRouter)

export default router
