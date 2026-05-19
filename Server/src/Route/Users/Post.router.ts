import { Router } from "express"
import * as PostController from "../../Controller/Users/Post.controller.js"

const router = Router()

router.post("/", PostController.createPost)
router.get("/", PostController.getPosts)
router.delete("/:id", PostController.deletePost)

router.post("/events", PostController.createEvent)
router.get("/events", PostController.getEvents)

export default router
