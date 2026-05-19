import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import { getIO } from "../../Config/socket.js"

// 🔔 Get all notifications for a user
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string
        const notifications = await prisma.notification.findMany({
            where: { recipientId: userId },
            orderBy: { createdAt: "desc" },
            include: {
                senderUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImg: true,
                        headline: true
                    }
                },
                senderCompany: {
                    select: {
                        id: true,
                        companyName: true,
                        profileImg: true,
                        industry: true
                    }
                }
            },
            take: 50
        })
        const unreadCount = await prisma.notification.count({
            where: { recipientId: userId, isRead: false }
        })
        res.status(200).json({ success: true, data: notifications, unreadCount })
    } catch (error) {
        next(error)
    }
}

// ✅ Mark a single notification as read
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        })
        res.status(200).json({ success: true, message: "Notification marked as read" })
    } catch (error) {
        next(error)
    }
}

// ✅ Mark ALL notifications as read for a user
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string
        await prisma.notification.updateMany({
            where: { recipientId: userId, isRead: false },
            data: { isRead: true }
        })
        res.status(200).json({ success: true, message: "All notifications marked as read" })
    } catch (error) {
        next(error)
    }
}

// 🗑️ Delete a notification
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string
        await prisma.notification.delete({ where: { id } })
        res.status(200).json({ success: true, message: "Notification deleted" })
    } catch (error) {
        next(error)
    }
}

// 🔔 Create a notification (internal helper - also exported for use in other controllers)
export const createNotification = async (
    recipientId: string,
    senderId: string | null,
    type: "REQUEST" | "ACCEPT" | "LIKE" | "COMMENT" | "MENTION" | "SYSTEM" | "ALERT",
    content: string,
    postId?: string,
    recipientType: "user" | "company" = "user",
    senderType: "user" | "company" = "user"
) => {
    if (recipientId === senderId && recipientType === senderType) return // Don't notify yourself

    const notification = await prisma.notification.create({
        data: {
            recipientId,
            recipientType,
            senderId: senderId || null,
            senderType,
            content,
            type,
            postId: postId || null,
            // Explicitly connect to the correct relation fields for include to work
            ...(recipientType === "user" ? { recipientUserId: recipientId } : { recipientCompanyId: recipientId }),
            ...(senderId && (senderType === "user" ? { senderUserId: senderId } : { senderCompanyId: senderId }))
        },
        include: {
            senderUser: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImg: true,
                    headline: true
                }
            },
            senderCompany: {
                select: {
                    id: true,
                    companyName: true,
                    profileImg: true,
                    industry: true
                }
            }
        }
    })

    // Real-time Emit
    try {
        const io = getIO();
        io.to(recipientId).emit("new_notification", notification);
    } catch (error) {
        console.warn("Socket emission failed for notification:", error);
    }
}
