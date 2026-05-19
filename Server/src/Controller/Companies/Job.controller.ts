import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import { getIO } from "../../Config/socket.js"

// 🔹 Notifications & Messaging
import { createNotification } from "../Users/Notification.controller.js"
import sendEmail from "../../Utils/sendEmail.js"
import { emailTemplates } from "../../Utils/EmailTemplates.js"

/**
 * Helper: Automated Notifications for Candidate
 */
const triggerApplicationNotifications = async (applicationId: string, status: string, interviewDetails?: any) => {
    try {
        const app = await (prisma as any).application.findUnique({
            where: { id: applicationId },
            include: {
                user: true,
                job: {
                    include: { company: true }
                }
            }
        });

        if (!app || !app.user || !app.job || !app.job.company) return;

        const candidateName = `${app.user.firstName} ${app.user.lastName} `;
        const companyName = app.job.company.companyName;
        const jobTitle = app.job.title;
        const candidateEmail = app.user.email;
        const companyId = app.job.company.id;
        const userId = app.user.id;

        let message = "";
        let emailSubject = "";
        let emailBody = "";

        switch (status) {
            case "SHORTLISTED":
                message = `Congratulations ${candidateName} !You have been shortlisted for the ${jobTitle} position at ${companyName}. We will contact you soon for the next steps.`;
                emailSubject = `Congratulations! You've been shortlisted for ${jobTitle}`;
                emailBody = `<p>Hi <strong>${candidateName}</strong>,</p><p>We are excited to inform you that you have been shortlisted for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p><p>Our team will review your profile further and get in touch with you regarding the next steps.</p><p>Best regards,<br>${companyName} Recruiting Team</p>`;
                break;
            case "INTERVIEW_SCHEDULED":
                const dateStr = new Date(interviewDetails.scheduledAt).toLocaleString();
                message = `Hi ${candidateName}, your interview for ${jobTitle} has been scheduled for ${dateStr}. Location/Link: ${interviewDetails.location}`;
                emailSubject = `Interview Scheduled: ${jobTitle} position`;
                emailBody = `<p>Hi <strong>${candidateName}</strong>,</p><p>Your interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been scheduled.</p><p><strong>Time:</strong> ${dateStr}<br><strong>Location/Link:</strong> <a href="${interviewDetails.location}">${interviewDetails.location}</a></p><p>Please be on time. Good luck!</p><p>Best regards,<br>${companyName} Recruiting Team</p>`;
                break;
            case "HIRED":
                message = `Great news ${candidateName}! You have been selected for the ${jobTitle} position at ${companyName}. Welcome aboard!`;
                emailSubject = `Job Offer: ${jobTitle} at ${companyName}`;
                emailBody = `<p>Hi <strong>${candidateName}</strong>,</p><p>We are thrilled to offer you the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>!</p><p>You've impressed us with your skills and experience, and we can't wait to have you on our team.</p><p>Welcome aboard!</p><p>Best regards,<br>${companyName} Team</p>`;
                break;
            case "REJECTED":
                message = `Hi ${candidateName}, thank you for your interest in the ${jobTitle} position at ${companyName}. Unfortunately, we have decided to move forward with other candidates.`;
                emailSubject = `Application Update: ${jobTitle}`;
                emailBody = `<p>Hi <strong>${candidateName}</strong>,</p><p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p><p>After careful consideration, we have decided to move forward with other candidates who more closely match our current needs.</p><p>We appreciate your interest in our company and wish you the best in your job search.</p><p>Best regards,<br>${companyName} Team</p>`;
                break;
        }

        if (!message) return;

        // 1. System Notification
        await createNotification(userId, companyId, "SYSTEM", message, undefined, "user", "company");

        // 2. Chat Message
        let conversation = await (prisma as any).conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { companies: { some: { id: companyId } } }
                ]
            }
        });

        if (!conversation) {
            conversation = await (prisma as any).conversation.create({
                data: {
                    participants: { connect: [{ id: userId }] },
                    companies: { connect: [{ id: companyId }] }
                }
            });
        }

        await (prisma as any).message.create({
            data: {
                conversationId: conversation.id,
                senderId: companyId,
                senderType: "company",
                senderCompanyId: companyId,
                content: message
            }
        });

        // 3. Email Notification
        await sendEmail({
            email: candidateEmail,
            subject: emailSubject,
            message: message.replace(/<[^>]*>?/gm, ''), // Stripping HTML for plain text
            html: emailTemplates.generalNotification(emailSubject, emailBody, status === "INTERVIEW_SCHEDULED" ? "Join Interview" : "View Details", "http://localhost:5173/user/applications")
        });

    } catch (error) {
        console.error("Failed to trigger application notifications:", error);
    }
}

export const postJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            companyId,
            jobTitle,
            jobType,
            workMode,
            location,
            experience,
            salary,
            openings,
            applyDeadline,
            skills,
            description,
            benefits,
            status
        } = req.body

        if (!companyId || !jobTitle || !jobType || !workMode || !location || !experience || !salary || !openings || !skills || !description) {
            return res.status(400).json({ success: false, message: "Missing required fields" })
        }

        const company = await (prisma as any).company.findUnique({ where: { id: companyId } })
        if (!company) return res.status(404).json({ success: false, message: "Company not found" })

        const newJob = await (prisma as any).job.create({
            data: {
                companyId,
                title: jobTitle,
                type: jobType,
                workMode,
                location,
                experience,
                salary: salary.toString(),
                openings: parseInt(openings),
                applyDeadline: applyDeadline ? new Date(applyDeadline) : null,
                skills,
                description,
                benefits,
                status: status || "Active",
                companyName: company.companyName,
                logo: company.profileImg
            }
        })

        // 🔹 Real-time implementation: Notify all users about the new job
        try {
            const io = getIO();
            io.emit("new_job", newJob);

            // Global notification for all users
            io.emit("new_notification", {
                type: "NEW_JOB",
                title: "New Job Opportunity",
                message: `🚀 ${company.companyName} is hiring for ${jobTitle}!`
            });
        } catch (socketError) {
            console.error("Socket emit failed:", socketError);
        }

        res.status(201).json({ success: true, message: "Job posted successfully", data: newJob })
    } catch (error) {
        next(error)
    }
}

// 🔹 Get Jobs by Company
export const getMyJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId } = req.params
        const jobs = await (prisma as any).job.findMany({
            where: { companyId },
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Map counts for frontend consistency
        const formattedJobs = jobs.map((job: any) => ({
            ...job,
            applicants: job._count.applications
        }))

        res.status(200).json({ success: true, data: formattedJobs })
    } catch (error) {
        next(error)
    }
}

// 🔹 Update Job
export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { jobId } = req.params
        const {
            jobTitle,
            jobType,
            workMode,
            location,
            experience,
            salary,
            openings,
            applyDeadline,
            skills,
            description,
            benefits,
            status
        } = req.body

        const updateData: any = {}
        if (jobTitle) updateData.title = jobTitle
        if (jobType) updateData.type = jobType
        if (workMode) updateData.workMode = workMode
        if (location) updateData.location = location
        if (experience) updateData.experience = experience
        if (salary !== undefined) updateData.salary = salary.toString()
        if (openings !== undefined) updateData.openings = parseInt(openings)
        if (applyDeadline) updateData.applyDeadline = new Date(applyDeadline)
        if (skills) updateData.skills = skills
        if (description) updateData.description = description
        if (benefits !== undefined) updateData.benefits = benefits
        if (status) updateData.status = status

        const updatedJob = await (prisma as any).job.update({
            where: { id: jobId },
            data: updateData
        })

        res.status(200).json({ success: true, message: "Job updated successfully", data: updatedJob })
    } catch (error) {
        next(error)
    }
}

// 🔹 Delete Job
export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { jobId } = req.params
        await (prisma as any).job.delete({ where: { id: jobId } })
        res.status(200).json({ success: true, message: "Job deleted successfully" })
    } catch (error) {
        next(error)
    }
}

// 🔹 View Applicants for a Job
export const getApplicants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { jobId } = req.params
        const applications = await (prisma as any).application.findMany({
            where: { jobId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImg: true,
                        headline: true,
                        city: true,
                        state: true,
                        country: true,
                        skills: true,
                        occupation: true,
                        university: true,
                        courseName: true,
                        educationLevel: true,
                        bio: true
                    }
                },
                interviews: true
            },
            orderBy: { createdAt: "desc" }
        })

        // Format for frontend
        const formatted = applications.map((app: any) => {
            const skillsArray = app.user.skills ? (typeof app.user.skills === 'string' ? app.user.skills.split(',').map((s: string) => s.trim()) : app.user.skills) : [];
            const matchScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75; // Random score for demo

            return {
                id: app.id,
                name: `${app.user.firstName} ${app.user.lastName}`,
                role: app.user.headline || app.user.occupation || "Applicant",
                experience: app.user.occupation || "Not specified",
                education: `${app.user.educationLevel || ""} ${app.user.courseName || ""} from ${app.user.university || ""}`.trim() || "Not specified",
                email: app.email || app.user.email,
                phone: app.phone || "Not provided",
                location: app.user.city || app.user.country || "N/A",
                skills: skillsArray,
                status: app.status === "PENDING" ? "Applied" :
                    app.status === "SHORTLISTED" ? "Shortlisted" :
                        app.status === "INTERVIEW_SCHEDULED" ? "Interviewing" :
                            app.status === "HIRED" ? "Hired" :
                                app.status === "REJECTED" ? "Rejected" : app.status,
                profileImg: app.user.profileImg || "https://randomuser.me/api/portraits/lego/1.jpg",
                coverLetter: app.coverLetter || app.user.bio || "No cover letter provided.",
                appliedDate: app.createdAt.toISOString().split('T')[0],
                matchScore: matchScore,
                aiAnalysis: {
                    summary: `Strong candidate with ${skillsArray.slice(0, 2).join(' and ')} expertise. Aligns well with the technical requirements.`,
                    technical: matchScore + 2 > 100 ? 100 : matchScore + 2,
                    culture: Math.floor(Math.random() * (95 - 80 + 1)) + 80,
                    tags: ["High Performer", matchScore > 90 ? "Top Talent" : "Solid Match"]
                },
                resumeUrl: app.resumeUrl,
                interviewDetails: app.interviews && app.interviews.length > 0 ? {
                    id: app.interviews[0].id,
                    type: app.interviews[0].type,
                    date: app.interviews[0].scheduledAt,
                    location: app.interviews[0].location,
                    notes: app.interviews[0].notes
                } : null
            }
        })

        res.status(200).json({ success: true, data: formatted })
    } catch (error) {
        next(error)
    }
}

// 🔹 View All Applicants for a Company
export const getAllCompanyApplicants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId } = req.params
        const jobsWithApplications = await (prisma as any).job.findMany({
            where: { companyId },
            include: {
                applications: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profileImg: true,
                                headline: true,
                                city: true,
                                state: true,
                                country: true,
                                skills: true,
                                occupation: true,
                                university: true,
                                courseName: true,
                                educationLevel: true,
                                bio: true
                            }
                        },
                        interviews: true
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        })

        // Flatten all applications from all jobs
        const allApplications: any[] = []
        jobsWithApplications.forEach((job: any) => {
            job.applications.forEach((app: any) => {
                allApplications.push({
                    ...app,
                    job: { title: job.title }
                })
            })
        })

        // Sort globally by date
        allApplications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Format for frontend
        const formatted = allApplications.map((app: any) => {
            const skillsArray = app.user.skills ? (typeof app.user.skills === 'string' ? app.user.skills.split(',').map((s: string) => s.trim()) : app.user.skills) : [];
            const matchScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75;

            return {
                id: app.id,
                name: `${app.user.firstName} ${app.user.lastName}`,
                role: app.user.headline || app.user.occupation || `Applicant for ${app.job.title}`,
                experience: app.job.title,
                education: `${app.user.educationLevel || ""} ${app.user.courseName || ""} from ${app.user.university || ""}`.trim() || "Not specified",
                email: app.email || app.user.email,
                phone: app.phone || "Not provided",
                location: app.user.city || app.user.country || "N/A",
                skills: skillsArray,
                status: app.status === "PENDING" ? "Applied" :
                    app.status === "SHORTLISTED" ? "Shortlisted" :
                        app.status === "INTERVIEW_SCHEDULED" ? "Interviewing" :
                            app.status === "HIRED" ? "Hired" :
                                app.status === "REJECTED" ? "Rejected" : app.status,
                profileImg: app.user.profileImg || "https://randomuser.me/api/portraits/lego/1.jpg",
                coverLetter: app.coverLetter || app.user.bio || "No cover letter provided.",
                appliedDate: app.createdAt instanceof Date ? app.createdAt.toISOString().split('T')[0] : new Date(app.createdAt).toISOString().split('T')[0],
                matchScore: matchScore,
                aiAnalysis: {
                    summary: `Solid candidate for ${app.job.title}. Expertise in ${skillsArray.slice(0, 2).join(' and ')}.`,
                    technical: matchScore + 2 > 100 ? 100 : matchScore + 2,
                    culture: Math.floor(Math.random() * (95 - 80 + 1)) + 80,
                    tags: ["High Performer", matchScore > 90 ? "Top Talent" : "Solid Match"]
                },
                resumeUrl: app.resumeUrl,
                interviewDetails: app.interviews && app.interviews.length > 0 ? {
                    id: app.interviews[0].id,
                    type: app.interviews[0].type,
                    date: app.interviews[0].scheduledAt,
                    location: app.interviews[0].location,
                    notes: app.interviews[0].notes
                } : null
            }
        })

        res.status(200).json({ success: true, data: formatted })
    } catch (error) {
        next(error)
    }
}

// 🔹 Update Application Status (Shortlist, Hire, Reject)
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { applicationId } = req.params
        const { status } = req.body

        const validStatuses = ["PENDING", "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED", "REJECTED"]
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" })
        }

        const finalStatus = status === "APPLIED" ? "PENDING" : status

        const updatedApplication = await (prisma as any).application.update({
            where: { id: applicationId },
            data: { status: finalStatus }
        })

        // 🔹 Trigger Automated Notifications
        if (["SHORTLISTED", "HIRED", "REJECTED"].includes(finalStatus)) {
            triggerApplicationNotifications(applicationId as string, finalStatus);
        }

        // 🔹 Real-time implementation: Notify user about status change
        try {
            const io = getIO();
            const eventData = {
                applicationId,
                status: finalStatus,
                message: `Your application for this job has been ${finalStatus.toLowerCase()}.`
            };
            io.to(updatedApplication.userId).emit("status_update", eventData);

            // Global notification
            io.to(updatedApplication.userId).emit("new_notification", {
                type: "APPLICATION_STATUS",
                title: "Application Update",
                message: eventData.message
            });
        } catch (socketError) {
            console.error("Socket emit failed:", socketError);
        }

        res.status(200).json({ success: true, message: `Status updated to ${finalStatus.replace(/_/g, " ")}`, data: updatedApplication })
    } catch (error) {
        next(error)
    }
}

// 🔹 Schedule Interview
export const scheduleInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { applicationId } = req.params
        const { type, scheduledAt, location, notes } = req.body

        if (!type || !scheduledAt || !location) {
            return res.status(400).json({ success: false, message: "Type, Date, and Location/Link are required" })
        }

        const scheduledDate = new Date(scheduledAt)
        if (scheduledDate < new Date()) {
            return res.status(400).json({ success: false, message: "Interview date cannot be in the past" })
        }

        const interview = await (prisma as any).interview.create({
            data: {
                applicationId,
                type,
                scheduledAt: scheduledDate,
                location,
                notes
            }
        })

        // Also update application status
        await (prisma as any).application.update({
            where: { id: applicationId },
            data: { status: "INTERVIEW_SCHEDULED" }
        })

        // 🔹 Trigger Automated Notifications
        triggerApplicationNotifications(applicationId as string, "INTERVIEW_SCHEDULED", {
            scheduledAt: scheduledDate,
            location
        });

        // 🔹 Real-time implementation: Notify user about scheduled interview
        try {
            const io = getIO();
            const application = await (prisma as any).application.findUnique({
                where: { id: applicationId },
                select: { userId: true, job: { select: { title: true } } }
            });
            if (application) {
                const eventData = {
                    applicationId,
                    type,
                    scheduledAt: scheduledDate,
                    location,
                    message: `An interview has been scheduled for your application for "${application.job.title}".`
                };
                io.to(application.userId).emit("interview_scheduled", eventData);

                // Global notification
                io.to(application.userId).emit("new_notification", {
                    type: "INTERVIEW_SCHEDULED",
                    title: "Interview Scheduled",
                    message: eventData.message
                });
            }
        } catch (socketError) {
            console.error("Socket emit failed:", socketError);
        }

        res.status(201).json({ success: true, message: "Interview scheduled successfully", data: interview })
    } catch (error) {
        next(error)
    }
}
