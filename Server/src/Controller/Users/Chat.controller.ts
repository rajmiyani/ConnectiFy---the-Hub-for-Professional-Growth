import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import { getIO } from "../../Config/socket.js"

// 🔹 Get all conversations for a user or company
export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accountId } = req.params
        const { type } = req.query // 'user' or 'company'

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participants: { some: { id: accountId as string } } },
                    { companies: { some: { id: accountId as string } } }
                ]
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImg: true,
                    }
                },
                companies: {
                    select: {
                        id: true,
                        companyName: true,
                        profileImg: true,
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" }
                }
            },
            orderBy: { updatedAt: "desc" }
        })

        res.status(200).json({ success: true, data: conversations })
    } catch (error) {
        next(error)
    }
}

// 🔹 Create or get a conversation between two entities (User or Company)
export const getOrCreateConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { senderId, senderType, receiverId, receiverType } = req.body

        // Construct IDs array for search
        const participantIds = [senderId, receiverId]

        // Check if conversation exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    senderType === "user" ? { participants: { some: { id: senderId } } } : { companies: { some: { id: senderId } } },
                    receiverType === "user" ? { participants: { some: { id: receiverId } } } : { companies: { some: { id: receiverId } } }
                ]
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImg: true,
                    }
                },
                companies: {
                    select: {
                        id: true,
                        companyName: true,
                        profileImg: true,
                    }
                }
            }
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participants: {
                        connect: [
                            ...(senderType === "user" ? [{ id: senderId }] : []),
                            ...(receiverType === "user" ? [{ id: receiverId }] : [])
                        ]
                    },
                    companies: {
                        connect: [
                            ...(senderType === "company" ? [{ id: senderId }] : []),
                            ...(receiverType === "company" ? [{ id: receiverId }] : [])
                        ]
                    }
                },
                include: {
                    participants: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profileImg: true,
                        }
                    },
                    companies: {
                        select: {
                            id: true,
                            companyName: true,
                            profileImg: true,
                        }
                    }
                }
            })
        }

        res.status(200).json({ success: true, data: conversation })
    } catch (error) {
        next(error)
    }
}

// 🔹 Send a message
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { conversationId, senderId, senderType, content, mediaUrl, mediaType } = req.body

        const message = await (prisma as any).message.create({
            data: {
                conversationId,
                senderId,
                senderType: senderType === "company" ? "company" : "user",
                senderUserId: senderType === "user" ? senderId : null,
                senderCompanyId: senderType === "company" ? senderId : null,
                content,
                mediaUrl,
                mediaType
            },
            include: {
                senderUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImg: true
                    }
                },
                senderCompany: {
                    select: {
                        id: true,
                        companyName: true,
                        profileImg: true
                    }
                }
            }
        })

        // Update conversation lastMessage and timestamp
        const lastMsgPreview = content || (mediaType === "image" ? "📷 Photo" : "📄 PDF Document")

        await (prisma as any).conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: lastMsgPreview,
                updatedAt: new Date()
            }
        })

        // Real-time emit
        try {
            const io = getIO();
            io.to(conversationId).emit("newMessage", message);
        } catch (err) {
            console.warn("⚠️ Socket emit failed for message");
        }

        res.status(201).json({ success: true, data: message })
    } catch (error) {
        next(error)
    }
}

// 🔹 Get messages for a conversation
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const conversationId = req.params.conversationId as string

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                senderUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImg: true,
                    }
                },
                senderCompany: {
                    select: {
                        id: true,
                        companyName: true,
                        profileImg: true,
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        })

        res.status(200).json({ success: true, data: messages })
    } catch (error) {
        next(error)
    }
}
