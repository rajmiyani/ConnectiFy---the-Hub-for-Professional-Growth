import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import { createNotification } from "./Notification.controller.js"

// 🔹 Get People You May Know (Suggestions)
export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string // The current user's ID

        // Find users who are not:
        // 1. Me
        // 2. Already my connections (ACCEPTED)
        // 3. Pending requests (sent or received)

        const myConnections = await prisma.connection.findMany({
            where: {
                OR: [{ senderId: String(userId) }, { receiverId: String(userId) }]
            },
            select: {
                senderId: true,
                receiverId: true
            }
        })

        const connectedUserIds = myConnections.map(c =>
            c.senderId === userId ? c.receiverId : c.senderId
        )

        // Add self to exclusion list
        connectedUserIds.push(userId)

        const suggestions = await prisma.user.findMany({
            where: {
                id: { notIn: connectedUserIds },
                isActive: true
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImg: true,
                headline: true,
                city: true,
                country: true,
                username: true // Added username for profile links
            },
            take: 12
        })

        res.status(200).json({ success: true, data: suggestions })
    } catch (error) {
        next(error)
    }
}

// 🔹 Send Connection Request
export const sendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { senderId, receiverId } = req.body
        console.log("Send Connection Request:", { senderId, receiverId });

        if (!senderId || !receiverId) {
            console.error("Missing senderId or receiverId");
            return res.status(400).json({ success: false, message: "Missing senderId or receiverId" });
        }

        if (senderId === receiverId) return res.status(400).json({ success: false, message: "Cannot connect to yourself" })

        // Check if connection already exists (either way)
        const existingConnection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        })

        if (existingConnection) {
            console.log("Connection already exists:", existingConnection.status);
            return res.status(400).json({
                success: false,
                message: existingConnection.status === "PENDING" ? "Connection request already pending" : "Already connected"
            });
        }

        // Verify users exist
        const [senderCheck, receiverCheck] = await Promise.all([
            prisma.user.findUnique({ where: { id: senderId }, select: { id: true } }),
            prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } })
        ]);

        if (!senderCheck || !receiverCheck) {
            console.error("One or both users not found:", { senderId, receiverId });
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newRequest = await prisma.connection.create({
            data: {
                senderId,
                receiverId,
                status: "PENDING"
            }
        })

        // Notify receiver
        const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { firstName: true, lastName: true } })
        if (sender) {
            await createNotification(
                receiverId,
                senderId,
                "REQUEST",
                `${sender.firstName} ${sender.lastName} sent you a connection request`
            )
        }

        res.status(201).json({ success: true, data: newRequest })
    } catch (error) {
        next(error)
    }
}

// 🔹 Accept/Reject Connection Request
export const handleRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId, status } = req.body // status: ACCEPTED or REJECTED

        const connection = await prisma.connection.update({
            where: { id: requestId },
            data: { status }
        })

        if (status === "ACCEPTED") {
            await prisma.user.update({
                where: { id: connection.senderId },
                data: { connections: { increment: 1 } }
            })
            await prisma.user.update({
                where: { id: connection.receiverId },
                data: { connections: { increment: 1 } }
            })
            // Notify the original sender that their request was accepted
            const accepter = await prisma.user.findUnique({ where: { id: connection.receiverId }, select: { firstName: true, lastName: true } })
            if (accepter) {
                await createNotification(
                    connection.senderId,
                    connection.receiverId,
                    "ACCEPT",
                    `${accepter.firstName} ${accepter.lastName} accepted your connection request`
                )
            }
        }

        res.status(200).json({ success: true, message: `Request ${status.toLowerCase()}` })
    } catch (error) {
        next(error)
    }
}

// 🔹 Get Incoming Requests
export const getPendingRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string

        const requests = await prisma.connection.findMany({
            where: {
                receiverId: String(userId),
                status: "PENDING"
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profileImg: true,
                        headline: true
                    }
                }
            }
        })

        res.status(200).json({ success: true, data: requests })
    } catch (error) {
        next(error)
    }
}
// 🔹 Get Accepted Connections
export const getConnections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string

        const connections = await prisma.connection.findMany({
            where: {
                OR: [
                    { senderId: userId, status: "ACCEPTED" },
                    { receiverId: userId, status: "ACCEPTED" }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        profileImg: true,
                        headline: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        profileImg: true,
                        headline: true
                    }
                }
            },
            orderBy: { updatedAt: "desc" }
        })

        // Format to return the "other" person in the connection
        const formattedConnections = connections.map(c =>
            c.senderId === userId ? c.receiver : c.sender
        )

        res.status(200).json({ success: true, data: formattedConnections })
    } catch (error) {
        next(error)
    }
}
