import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import { getIO } from "../../Config/socket.js"

// 🔹 Get All Jobs
export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobs = await (prisma as any).job.findMany({
            where: { status: "Active" },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { savedBy: true }
                }
            }
        })
        res.status(200).json({ success: true, data: jobs })
    } catch (error) {
        next(error)
    }
}

// 🔹 Get Job Details
export const getJobDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobId = req.params.id as string
        const job = await (prisma as any).job.findUnique({
            where: { id: jobId },
            include: {
                company: {
                    select: {
                        id: true,
                        companyName: true,
                        profileImg: true,
                        industry: true,
                        website: true,
                        city: true,
                        state: true,
                        country: true,
                        tagline: true,
                        about: true
                    }
                }
            }
        })
        if (!job) return res.status(404).json({ success: false, message: "Job not found" })
        res.status(200).json({ success: true, data: job })
    } catch (error) {
        next(error)
    }
}

// 🔹 Apply for a Job
export const applyJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { jobId, userId, fullName, email, phone, resumeUrl, coverLetter } = req.body

        if (!jobId || !userId) {
            return res.status(400).json({ success: false, message: "Job ID and User ID are required" })
        }

        // Check if already applied
        const existing = await (prisma as any).application.findUnique({
            where: { jobId_userId: { jobId, userId } }
        })

        if (existing) {
            return res.status(400).json({ success: false, message: "You have already applied for this job" })
        }

        const application = await (prisma as any).application.create({
            data: {
                jobId,
                userId,
                fullName,
                email,
                phone,
                resumeUrl,
                coverLetter,
                status: "PENDING"
            }
        })

        // 🔹 Real-time implementation: Notify company about new applicant
        try {
            const job = await (prisma as any).job.findUnique({
                where: { id: jobId },
                select: { companyId: true, title: true }
            });

            if (job) {
                const io = getIO();
                const eventData = {
                    application,
                    jobTitle: job.title,
                    applicantName: fullName
                };

                // Notify company room
                io.to(`company_${job.companyId}`).emit("new_application", eventData);

                // Global notification for recruiter
                io.to(`company_${job.companyId}`).emit("new_notification", {
                    type: "NEW_APPLICATION",
                    title: "New Application",
                    message: `${fullName} applied for ${job.title}`
                });
            }
        } catch (socketError) {
            console.error("Socket emit failed:", socketError);
        }

        res.status(201).json({ success: true, message: "Application submitted successfully", data: application })
    } catch (error) {
        next(error)
    }
}

// 🔹 Get My Applications
export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params
        const applications = await (prisma as any).application.findMany({
            where: { userId },
            include: {
                job: {
                    include: {
                        company: {
                            select: { companyName: true, profileImg: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        res.status(200).json({ success: true, data: applications })
    } catch (error) {
        next(error)
    }
}

// 🔹 Toggle Save Job
export const toggleSaveJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { jobId, userId } = req.body

        if (!jobId || !userId) return res.status(400).json({ success: false, message: "Missing required fields" })

        const existing = await (prisma as any).savedJob.findUnique({
            where: { userId_jobId: { userId, jobId } }
        })

        if (existing) {
            await (prisma as any).savedJob.delete({
                where: { id: existing.id }
            })
            return res.status(200).json({ success: true, message: "Job removed from saved", saved: false })
        } else {
            await (prisma as any).savedJob.create({
                data: { userId, jobId }
            })
            return res.status(200).json({ success: true, message: "Job saved successfully", saved: true })
        }
    } catch (error) {
        next(error)
    }
}
// 🔹 Get My Interviews (Applications with status INTERVIEW_SCHEDULED)
export const getUserInterviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params
        const interviews = await (prisma as any).application.findMany({
            where: {
                userId,
                status: "INTERVIEW_SCHEDULED"
            },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                companyName: true,
                                profileImg: true,
                                city: true,
                                state: true
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: "desc" }
        })

        // Format for frontend consistency
        const formattedInterviews = interviews.map((app: any) => ({
            id: app.id,
            jobId: app.jobId,
            role: app.job.title,
            companyName: app.job.company.companyName,
            companyLogo: app.job.company.profileImg,
            status: "Scheduled",
            date: app.updatedAt, // Assuming updatedAt is the last status change/interview schedule time
            type: "Online", // Mocked for now, can be dynamic if stored in Application/Job
            link: "https://meet.google.com/abc-defg-hij", // Mocked
            location: `${app.job.company.city}, ${app.job.company.state}`
        }))

        res.status(200).json({ success: true, data: formattedInterviews })
    } catch (error) {
        next(error)
    }
}
