import { Request, Response } from "express";
import { prisma } from "../../Config/prisma.js";
import { AccountType, ApplicationStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "developer";

/**
 * @desc Admin Login - Returns JWT token for admin access
 * @route POST /admin/login
 */
export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Static admin credentials (can be replaced with DB lookup later)
    if (email !== "admin@connectify.com" || password !== "Admin@123") {
        return res.status(401).json({ success: false, message: "Invalid admin credentials." });
    }

    const token = jwt.sign(
        { id: "system-admin", email: "admin@connectify.com", role: "admin" },
        JWT_SECRET,
        { expiresIn: "8h" }
    );

    return res.status(200).json({
        success: true,
        message: "Admin login successful.",
        token,
        data: { id: "system-admin", email: "admin@connectify.com", role: "admin", name: "Admin" }
    });
};

/**
 * @desc Get Admin Dashboard Stats
 * @route GET /admin/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count({
            where: { accountType: AccountType.user }
        });
        const totalCompanies = await prisma.company.count();
        const activeJobs = await prisma.job.count({
            where: { status: "Active" }
        });

        // Mock signups today (real logic would involve createdAt filter)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const signupsToday = await prisma.user.count({
            where: { createdAt: { gte: today } }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalCompanies,
                activeJobs,
                signupsToday
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get All Users
 * @route GET /admin/users
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json({ success: true, users });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Update User Status
 * @route PATCH /admin/users/:id/status
 */
export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body; // Expecting "Active" or "Blocked"

        const user = await prisma.user.update({
            where: { id },
            data: { isActive: status === "Active" }
        });

        res.status(200).json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Delete User
 * @route DELETE /admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.user.delete({ where: { id } });
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get All Companies
 * @route GET /admin/companies
 */
export const getAllCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await prisma.company.findMany({
            orderBy: { createdAt: "desc" },
            include: { jobs: true }
        });
        res.status(200).json({ success: true, companies });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Approve Company
 * @route PATCH /admin/companies/:id/approve
 */
export const approveCompany = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const company = await prisma.company.update({
            where: { id },
            data: { isVerified: true, isActive: true }
        });
        res.status(200).json({ success: true, company });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Reject Company
 * @route PATCH /admin/companies/:id/reject
 */
export const rejectCompany = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { reason } = req.body;

        const company = await prisma.company.update({
            where: { id },
            data: { isVerified: false, isActive: false }
        });

        res.status(200).json({ success: true, company, message: `Company rejected for: ${reason}` });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get All Jobs
 * @route GET /admin/jobs
 */
export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: "desc" },
            include: { company: true }
        });
        res.status(200).json({ success: true, jobs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Update Job Status
 * @route PATCH /admin/jobs/:id/status
 */
export const updateJobStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body; // Approved, Rejected, Expired

        const job = await prisma.job.update({
            where: { id },
            data: { status }
        });

        res.status(200).json({ success: true, job });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Delete Job Permanent
 * @route DELETE /admin/jobs/:id
 */
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.job.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Job listing deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get Admin Notifications
 * @route GET /admin/notifications
 */
export const getAdminNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { recipientType: AccountType.admin },
                    { recipientId: "system-admin" }
                ]
            },
            orderBy: { createdAt: "desc" },
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
        });

        res.status(200).json({ success: true, notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Mark Admin Notification as Read
 * @route PATCH /admin/notifications/:id
 */
export const markAdminNotificationRead = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Delete Admin Notification
 * @route DELETE /admin/notifications/:id
 */
export const deleteAdminNotification = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.notification.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get System Settings
 * @route GET /admin/settings
 */
export const getSystemSettings = async (req: Request, res: Response) => {
    try {
        res.status(200).json({
            success: true,
            settings: {
                platformName: "ConnectiFy",
                notifications: { email: true, adminAlerts: true },
                features: { messaging: true, jobPosting: true, analytics: true, aiModeration: false },
                maintenanceMode: false
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Update System Settings
 * @route PATCH /admin/settings
 */
export const updateSystemSettings = async (req: Request, res: Response) => {
    try {
        const settings = req.body;
        res.status(200).json({ success: true, settings });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =============================================================================
// CONTENT MODERATION
// =============================================================================

/**
 * @desc Get all posts for moderation
 * @route GET /admin/moderation/posts
 */
export const getModerationPosts = async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, username: true, email: true } }
            }
        });

        const reports = posts.map(p => ({
            id: p.id,
            type: "Post",
            entity: (p.content as string)?.slice(0, 50) || `Post #${p.id.slice(-6)}`,
            authorName: p.user ? `${p.user.firstName || ""} ${p.user.lastName || ""}`.trim() || p.user.username : "Unknown",
            authorEmail: p.user?.email || "N/A",
            category: "User Content",
            severity: 2,
            status: p.isActive === false ? "Blocked" : "Pending",
            date: new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            contentPreview: (p.content as string)?.slice(0, 200) || "",
            raw: p
        }));

        res.status(200).json({ success: true, reports });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Update moderation status for a post (block/delete/warn)
 * @route PATCH /admin/moderation/posts/:id
 */
export const moderatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action } = req.body; // "block" | "delete" | "warn"

    try {
        if (action === "delete") {
            await prisma.post.delete({ where: { id: id as string } });
            return res.status(200).json({ success: true, message: "Post deleted." });
        }

        if (action === "block") {
            await prisma.post.update({ where: { id: id as string }, data: { isActive: false } });
            return res.status(200).json({ success: true, message: "Post blocked." });
        }

        // warn — just log it, no DB mutation
        return res.status(200).json({ success: true, message: "Warning issued for post." });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =============================================================================
// DASHBOARD ACTIVITY CHART
// =============================================================================

/**
 * @desc Get daily user signup activity for dashboard chart
 * @route GET /admin/activity?range=7|30|90
 */
export const getDashboardActivity = async (req: Request, res: Response) => {
    const range = parseInt(req.query.range as string) || 7;
    try {
        const activityData: { label: string; users: number; companies: number }[] = [];

        for (let i = range - 1; i >= 0; i--) {
            const start = new Date();
            start.setDate(start.getDate() - i);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);

            const [users, companies] = await Promise.all([
                prisma.user.count({ where: { createdAt: { gte: start, lte: end }, accountType: AccountType.user } }),
                prisma.company.count({ where: { createdAt: { gte: start, lte: end } } })
            ]);

            const label = range <= 7
                ? start.toLocaleDateString("en-GB", { weekday: "short" })
                : start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

            activityData.push({ label, users, companies });
        }

        res.status(200).json({ success: true, activityData });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =============================================================================
// ADMIN PROFILE
// =============================================================================

/**
 * @desc Get Admin Profile
 * @route GET /admin/profile
 */
export const getAdminProfile = async (req: Request, res: Response) => {
    try {
        const adminEmail = "admin@connectify.com";
        const admin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!admin) {
            return res.status(200).json({
                success: true,
                data: {
                    id: "system-admin",
                    name: "System Administrator",
                    email: adminEmail,
                    role: "admin",
                    avatar: "https://ui-avatars.com/api/?name=Admin&background=0073b1&color=fff"
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: admin.id,
                name: `${admin.firstName} ${admin.lastName}`.trim(),
                email: admin.email,
                role: "admin",
                avatar: admin.profileImg || `https://ui-avatars.com/api/?name=${admin.firstName}&background=0073b1&color=fff`,
                phone: admin.phone,
                bio: admin.bio
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Update Admin Profile
 * @route PATCH /admin/profile
 */
export const updateAdminProfile = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, bio } = req.body;
        const [firstName, ...lastNameParts] = (name || "").split(" ");
        const lastName = lastNameParts.join(" ");

        const admin = await prisma.user.upsert({
            where: { email: "admin@connectify.com" },
            update: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phone: phone || undefined,
                bio: bio || undefined
            },
            create: {
                email: "admin@connectify.com",
                firstName: firstName || "Admin",
                lastName: lastName || "",
                password: "Admin@123",
                username: "admin_system",
                accountType: AccountType.admin,
                isActive: true
            }
        });

        res.status(200).json({
            success: true,
            message: "Admin profile updated successfully",
            data: {
                id: admin.id,
                name: `${admin.firstName} ${admin.lastName}`.trim(),
                email: admin.email,
                role: "admin",
                avatar: admin.profileImg || `https://ui-avatars.com/api/?name=${admin.firstName}&background=0073b1&color=fff`,
                phone: admin.phone,
                bio: admin.bio
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
