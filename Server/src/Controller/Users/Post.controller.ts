import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import { getIO } from "../../Config/socket.js"

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, content, mediaType, mediaUrls, title, articleContent } = req.body

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" })
        }

        const post = await prisma.post.create({
            data: {
                userId,
                content,
                mediaType,
                mediaUrls: mediaUrls || [],
                title,
                articleContent
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        profileImg: true,
                        headline: true
                    }
                },
                likes: { select: { userId: true } },
                savedBy: { select: { userId: true } },
                _count: { select: { likes: true, comments: true } }
            }
        })

        // Emit socket event for real-time update
        try {
            const io = getIO();
            io.emit("newPost", post);
        } catch (err) {
            console.warn("⚠️ Socket emit failed - Receiver might not get real-time update");
        }

        res.status(201).json({ success: true, data: post })
    } catch (error) {
        next(error)
    }
}

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        profileImg: true,
                        headline: true
                    }
                },
                likes: {
                    select: { userId: true }
                },
                savedBy: {
                    select: { userId: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        res.status(200).json({ success: true, data: posts })
    } catch (error) {
        next(error)
    }
}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string }
        const { userId } = req.body // In a real app, this would come from auth middleware

        const post = await prisma.post.findUnique({ where: { id } })
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        if (post.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" })
        }

        await prisma.post.delete({ where: { id: id as string } })
        res.status(200).json({ success: true, message: "Post deleted successfully" })
    } catch (error) {
        next(error)
    }
}

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, title, description, date, location, mediaUrl } = req.body

        if (!userId || !title || !date) {
            return res.status(400).json({ success: false, message: "UserId, Title and Date are required" })
        }

        const event = await prisma.event.create({
            data: {
                userId,
                title,
                description,
                date: new Date(date),
                location,
                mediaUrl
            }
        })

        res.status(201).json({ success: true, data: event })
    } catch (error) {
        next(error)
    }
}

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const events = await prisma.event.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                date: "asc"
            }
        })

        res.status(200).json({ success: true, data: events })
    } catch (error) {
        next(error)
    }
}
