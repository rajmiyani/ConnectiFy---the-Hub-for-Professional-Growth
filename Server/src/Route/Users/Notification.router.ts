import express from "express"
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../Controller/Users/Notification.controller.js"

const router = express.Router()

router.get("/:userId", getNotifications)
router.patch("/read/:id", markAsRead)
router.patch("/read-all/:userId", markAllAsRead)
router.delete("/:id", deleteNotification)

export default router
