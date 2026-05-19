import express from "express"
import { toggleLike, addComment, getComments, toggleSavePost, toggleSaveJob, getSavedItems } from "../../Controller/Users/Interaction.controller.js"

const router = express.Router()

router.post("/like", toggleLike)
router.post("/comment", addComment)
router.get("/comments/:postId", getComments)
router.post("/save-post", toggleSavePost)
router.post("/save-job", toggleSaveJob)
router.get("/saved/:userId", getSavedItems)

export default router
