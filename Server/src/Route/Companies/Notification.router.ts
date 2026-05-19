import express from "express"
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../Controller/Users/Notification.controller.js"

const router = express.Router()

router.get("/:companyId", getNotifications)
router.patch("/read/:id", markAsRead)
router.patch("/read-all/:companyId", markAllAsRead)
router.delete("/:id", deleteNotification)

export default router
