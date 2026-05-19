import express from "express"
import { getConversations, getOrCreateConversation, sendMessage, getMessages } from "../../Controller/Users/Chat.controller.js"

const router = express.Router()

router.get("/conversations/:userId", getConversations)
router.post("/conversation", getOrCreateConversation)
router.post("/message", sendMessage)
router.get("/messages/:conversationId", getMessages)

export default router
