import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import { createNotification } from "./Notification.controller.js"

// 🔹 Like/Unlike Toggle
export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId, userId } = req.body

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: { userId, postId }
            }
        })

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            })
            return res.status(200).json({ success: true, liked: false, message: "Unliked post" })
        }

        await prisma.like.create({
            data: { userId, postId }
        })

        // Notify the post owner
        const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true, user: { select: { firstName: true, lastName: true } } } })
        const liker = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } })
        if (post && liker) {
            await createNotification(
                post.userId,
                userId,
                "LIKE",
                `${liker.firstName} ${liker.lastName} liked your post`,
                postId
            )
        }

        res.status(200).json({ success: true, liked: true, message: "Liked post" })
    } catch (error) {
        next(error)
    }
}

// 🔹 Add Comment
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId, userId, content } = req.body

        if (!content) return res.status(400).json({ success: false, message: "Comment content is required" })

        const newComment = await prisma.comment.create({
            data: {
                postId,
                userId,
                content
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profileImg: true
                    }
                }
            }
        })

        // Notify the post owner
        const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } })
        const commenter = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } })
        if (post && commenter) {
            await createNotification(
                post.userId,
                userId,
                "COMMENT",
                `${commenter.firstName} ${commenter.lastName} commented on your post`,
                postId
            )
        }

        res.status(201).json({ success: true, data: newComment })
    } catch (error) {
        next(error)
    }
}

// 🔹 Get Comments for a Post
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.postId as string

        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profileImg: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        res.status(200).json({ success: true, data: comments })
    } catch (error) {
        next(error)
    }
}

// 🔹 Toggle Save Post
export const toggleSavePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId, userId } = req.body

        const existingSave = await prisma.savedPost.findUnique({
            where: {
                userId_postId: { userId, postId }
            }
        })

        if (existingSave) {
            await prisma.savedPost.delete({
                where: { id: existingSave.id }
            })
            return res.status(200).json({ success: true, saved: false, message: "Removed from saved posts" })
        }

        await prisma.savedPost.create({
            data: { userId, postId }
        })

        res.status(200).json({ success: true, saved: true, message: "Post saved" })
    } catch (error) {
        next(error)
    }
}

// 🔹 Toggle Save Job
export const toggleSaveJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { jobId, userId } = req.body
        console.log("Toggle Save Job Request:", { jobId, userId });

        if (!jobId || !userId) {
            console.error("Missing jobId or userId in request body");
            return res.status(400).json({ success: false, message: "Missing jobId or userId" });
        }

        const existingSave = await prisma.savedJob.findUnique({
            where: {
                userId_jobId: { userId, jobId }
            }
        })

        if (existingSave) {
            await prisma.savedJob.delete({
                where: { id: existingSave.id }
            })
            return res.status(200).json({ success: true, saved: false, message: "Removed from saved jobs" })
        }

        // Check if user and job exist to avoid constraint errors
        const [userExists, jobExists] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
            prisma.job.findUnique({ where: { id: jobId }, select: { id: true } })
        ]);

        if (!userExists) {
            console.error("User not found:", userId);
            return res.status(404).json({ success: false, message: "User not found. Please re-login." });
        }
        if (!jobExists) {
            console.error("Job not found:", jobId);
            return res.status(404).json({ success: false, message: "Job not found." });
        }

        await prisma.savedJob.create({
            data: { userId, jobId }
        })

        res.status(200).json({ success: true, saved: true, message: "Job saved" })
    } catch (error) {
        next(error)
    }
}

// 🔹 Get All Saved Items (Jobs & Posts)
export const getSavedItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId as string

        const [savedPosts, savedJobs] = await Promise.all([
            prisma.savedPost.findMany({
                where: { userId },
                include: {
                    post: {
                        include: {
                            user: {
                                select: { firstName: true, lastName: true, profileImg: true, headline: true }
                            },
                            _count: { select: { likes: true, comments: true } }
                        }
                    }
                }
            }),
            prisma.savedJob.findMany({
                where: { userId },
                include: {
                    job: true
                }
            })
        ])

        const formattedPosts = savedPosts.map(s => ({
            ...s.post,
            savedItemId: s.id,
            type: "Post",
            savedTime: s.createdAt
        }))

        const formattedJobs = savedJobs.map(s => ({
            ...s.job,
            savedItemId: s.id,
            type: "Job",
            savedTime: s.createdAt
        }))

        // Combined and sorted by saved date
        const allSavedItems = [...formattedPosts, ...formattedJobs].sort((a, b) =>
            new Date(b.savedTime).getTime() - new Date(a.savedTime).getTime()
        )

        res.status(200).json({ success: true, data: allSavedItems })
    } catch (error) {
        next(error)
    }
}
