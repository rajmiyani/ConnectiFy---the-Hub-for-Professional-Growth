import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../../Config/prisma.js"
import { addEmailToQueue } from "../../Queue/emailQueue.js"
import { emailTemplates } from "../../Utils/EmailTemplates.js"
import redisClient from "../../Config/redis.js"
import { generateOTP } from "../../Utils/otpGenerator.js"
import crypto from "crypto"
import { getIO } from "../../Config/socket.js"

/**
 * ==============================================================================
 * HELPER: VALIDATE EMAIL FORMAT
 * ==============================================================================
 */
const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * ==============================================================================
 * REGISTER COMPANY CONTROLLER (HIGHLY VALIDATED)
 * ==============================================================================
 */
export const registerCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            companyName,
            companyEmail,
            companyPhone,
            website,
            industry,
            companySize,
            foundedYear,
            recruiterName,
            recruiterEmail,
            recruiterPhone,
            designation,
            country,
            state,
            city,
            pincode,
            address,
            password,
            confirmPassword
        } = req.body

        /* --------------------- STRICT VALIDATION --------------------- */
        if (!companyName || !companyEmail || !password || !confirmPassword || !recruiterName || !recruiterEmail || !recruiterPhone || !country || !state || !city || !address) {
            return res.status(400).json({ success: false, message: "Critical information is missing. Please fill all required fields." })
        }

        if (!isValidEmail(companyEmail)) {
            return res.status(400).json({ success: false, message: "Invalid company email format." })
        }

        if (!isValidEmail(recruiterEmail)) {
            return res.status(400).json({ success: false, message: "Invalid recruiter email format." })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match." })
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." })
        }

        /* --------------------- CHECK EXISTING --------------------- */
        const existingCompany = await prisma.company.findUnique({
            where: { email: companyEmail }
        })

        if (existingCompany) {
            return res.status(409).json({ success: false, message: "This company is already registered." })
        }

        /* --------------------- SECURE HASHING --------------------- */
        const hashedPassword = await bcrypt.hash(password, 12)

        /* --------------------- DB CREATION --------------------- */
        const company = await prisma.company.create({
            data: {
                companyName,
                email: companyEmail,
                phone: companyPhone || null,
                website: website || null,
                industry,
                companySize: companySize || null,
                foundedYear: foundedYear?.toString() || null,
                recruiterName,
                recruiterEmail,
                recruiterPhone,
                recruiterRole: designation || null,
                country,
                state,
                city,
                pincode: pincode || null,
                address,
                password: hashedPassword,
                isVerified: false,
                isActive: true
            }
        })

        const { password: _, ...companyData } = company
        res.status(201).json({
            success: true,
            message: "Company registered successfully! Please login to verify your account.",
            data: companyData
        })

    } catch (error) {
        next(error)
    }
}

/**
 * ==============================================================================
 * LOGIN COMPANY CONTROLLER (WITH SECURITY ALERTS)
 * ==============================================================================
 */
export const loginCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password } = req.body
        const email = req.body.email?.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." })
        }

        const company = await (prisma as any).company.findUnique({
            where: { email }
        })

        if (!company || !(await bcrypt.compare(password, company.password))) {
            return res.status(401).json({ success: false, message: "Invalid company credentials." })
        }

        /* --------------------- VERIFICATION CHECK --------------------- */
        if (!company.isVerified) {
            const otpCode = generateOTP()
            if (!redisClient.isOpen) await redisClient.connect()
            const otpKey = `otp:company:${email}`

            await redisClient.setEx(otpKey, 600, otpCode)

            await addEmailToQueue({
                email,
                subject: "Verify your Company Account - ConnectiFy",
                message: `Your verification code is ${otpCode}`,
                html: emailTemplates.otp(otpCode)
            })

            return res.status(200).json({
                success: false,
                requiresVerification: true,
                message: "Account unverified. An OTP has been sent to your registered email.",
                email
            })
        }

        /* --------------------- LOGIN SECURITY ALERT --------------------- */
        const device = req.headers["user-agent"] || "Unknown Device"
        await addEmailToQueue({
            email,
            subject: "Security Alert: New Company Login Detected",
            message: `A login was detected on your company account from ${device}`,
            html: emailTemplates.loginAlert(company.companyName, device, "Recent Login")
        })

        const { password: _, ...companyData } = company

        // Generate Tokens
        const JWT_SECRET = process.env.JWT_SECRET || "developer";
        const accessToken = jwt.sign(
            { id: company.id, email: company.email, role: 'company' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: company.id, email: company.email, role: 'company' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Save refresh token to DB
        await (prisma as any).company.update({
            where: { id: company.id },
            data: {
                refreshTokens: {
                    push: refreshToken
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Company portal accessed successfully.",
            data: companyData,
            token: accessToken,
            refreshToken: refreshToken,
            accountType: "company"
        })

    } catch (error) {
        next(error)
    }
}

/**
 * ==============================================================================
 * VERIFY COMPANY OTP
 * ==============================================================================
 */
export const verifyCompanyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { otp } = req.body
        const email = req.body.email?.trim().toLowerCase();

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" })
        }

        if (!redisClient.isOpen) await redisClient.connect()
        const otpKey = `otp:company:${email}`
        const storedOtp = await redisClient.get(otpKey)

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." })
        }

        const company = await prisma.company.update({
            where: { email },
            data: { isVerified: true }
        })

        await redisClient.del(otpKey)

        await addEmailToQueue({
            email,
            subject: "Welcome to ConnectiFy Business!",
            message: `Your company ${company.companyName} is now verified.`,
            html: emailTemplates.welcome(company.companyName)
        })

        const { password: _, ...companyData } = company
        res.status(200).json({ success: true, message: "Account verified successfully.", data: companyData })

    } catch (error) {
        next(error)
    }
}

/**
 * ==============================================================================
 * RESEND COMPANY OTP
 * ==============================================================================
 */
export const resendCompanyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" })
        }

        const company = await prisma.company.findUnique({
            where: { email },
            select: { companyName: true, isVerified: true }
        })

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" })
        }

        if (company.isVerified) {
            return res.status(400).json({ success: false, message: "Company already verified" })
        }

        const otp = generateOTP()
        if (!redisClient.isOpen) await redisClient.connect()
        const otpKey = `otp:company:${email}`
        await redisClient.setEx(otpKey, 600, otp)

        await addEmailToQueue({
            email,
            subject: "New Verification Code - ConnectiFy",
            message: `Your new verification code is ${otp}`,
            html: emailTemplates.otp(otp)
        })

        res.status(200).json({ success: true, message: "New OTP sent to your email." })

    } catch (error) {
        next(error)
    }
}

/**
 * ==============================================================================
 * PASSWORD RESET FLOW
 * ==============================================================================
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        const company = await prisma.company.findUnique({ where: { email } })

        if (!company) {
            return res.status(404).json({ success: false, message: "No company registered with this email." })
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        await redisClient.setEx(`reset:company:${resetToken}`, 3600, email)

        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&type=company`

        await addEmailToQueue({
            email,
            subject: "Company Account: Reset Password Request",
            message: `Click here to reset your password: ${resetLink}`,
            html: emailTemplates.resetPassword(resetLink)
        })

        res.status(200).json({ success: true, message: "A secure reset link has been sent to your email." })
    } catch (error) {
        next(error)
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body
        const email = await redisClient.get(`reset:company:${token}`)

        if (!email) {
            return res.status(400).json({ success: false, message: "This link has expired or is invalid." })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)
        const company = await prisma.company.update({
            where: { email },
            data: { password: hashedPassword }
        })

        await redisClient.del(`reset:company:${token}`)

        // Send confirmation alert
        await addEmailToQueue({
            email,
            subject: "Security Alert: Company Password Updated",
            message: "Your company account password was recently updated.",
            html: emailTemplates.passwordChanged(company.companyName)
        })

        res.status(200).json({ success: true, message: "Password updated successfully. You can now login." })
    } catch (error) {
        next(error)
    }
}

/**
 * ==============================================================================
 * PROFILE MANAGEMENT
 * ==============================================================================
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const company = await (prisma as any).company.findUnique({
            where: { id },
            include: {
                jobs: {
                    include: {
                        _count: {
                            select: { applications: true }
                        }
                    }
                }
            }
        })

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" })
        }

        const { password: _, ...companyData } = company
        res.status(200).json({ success: true, data: companyData })
    } catch (error) {
        next(error)
    }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId } = req.params
        const updateData = { ...req.body }
        console.log("Update Company Profile Request:", { companyId, bodyKeys: Object.keys(updateData) });

        // Safelist only the fields that are part of the Company model in schema.prisma
        const allowedFields = [
            "companyName", "phone", "website", "industry", "companySize", "foundedYear",
            "recruiterName", "recruiterEmail", "recruiterPhone", "recruiterRole",
            "country", "state", "city", "pincode", "address",
            "profileImg", "coverPhoto", "tagline", "about", "mission", "vision", "services", "techStack",
            "isActive"
        ];

        const filteredData: any = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        });

        console.log("Filtered Data Keys:", Object.keys(filteredData));

        // 1. Check if company exists
        const existingCompany = await (prisma as any).company.findUnique({
            where: { id: companyId }
        });

        if (!existingCompany) {
            console.warn(`Update failed: Company with ID ${companyId} not found.`);
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // 2. Perform Update
        console.log("Filtered Data Keys:", Object.keys(filteredData));

        const updatedCompany = await (prisma as any).company.update({
            where: { id: companyId },
            data: filteredData
        })

        const { password: _, ...data } = updatedCompany
        res.status(200).json({ success: true, message: "Company profile updated successfully.", data })
    } catch (error: any) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error during profile update",
            error: error.message
        });
    }
}

/**
 * ==============================================================================
 * DASHBOARD ANALYTICS & STATS
 * ==============================================================================
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId } = req.params;

        // 1. Get counts using optimized Prisma queries
        const [activeJobsCount, totalApplicants, shortlistedCount, companyProfile] = await Promise.all([
            (prisma as any).job.count({
                where: { companyId, status: "Active" }
            }),
            (prisma as any).application.count({
                where: { job: { companyId } }
            }),
            (prisma as any).application.count({
                where: {
                    job: { companyId },
                    status: "SHORTLISTED"
                }
            }),
            (prisma as any).company.findUnique({
                where: { id: companyId }
            })
        ]);

        if (!companyProfile) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // 2. Calculate Profile Completeness
        let completedFields = 0;
        const totalPossibleFields = 9;

        if (companyProfile.profileImg) completedFields += 1; // 10%
        if (companyProfile.coverPhoto) completedFields += 1; // 10%
        if (companyProfile.about) completedFields += 2;      // 20% (weighted)
        if (companyProfile.website) completedFields += 1;    // 10%
        if (companyProfile.phone) completedFields += 1;      // 10%
        if (companyProfile.companySize) completedFields += 1; // 10%
        if (companyProfile.foundedYear) completedFields += 1; // 10%
        if (companyProfile.tagline) completedFields += 1;     // 10%

        const completenessPercentage = Math.min(Math.round((completedFields / totalPossibleFields) * 100), 100);

        // 3. Fetch Recent Applicants (Last 5)
        const recentApplications = await (prisma as any).application.findMany({
            where: { job: { companyId } },
            take: 6,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImg: true,
                        city: true,
                        country: true,
                        experiences: {
                            take: 1,
                            orderBy: { createdAt: "desc" }
                        }
                    }
                },
                job: {
                    select: {
                        title: true
                    }
                }
            }
        });

        // Format recent applicants for frontend
        const formattedApplicants = recentApplications.map((app: any) => ({
            id: app.id,
            name: `${app.user.firstName} ${app.user.lastName}`,
            role: app.job.title,
            avatar: app.user.profileImg || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            status: app.status.charAt(0) + app.status.slice(1).toLowerCase().replace(/_/g, " "),
            time: new Date(app.createdAt).toLocaleDateString(),
            experience: app.user.experiences[0]?.duration || "N/A"
        }));

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    activeJobs: activeJobsCount,
                    totalApplicants: totalApplicants,
                    shortlisted: shortlistedCount,
                    profileViews: 0, // Placeholder
                    profileCompleteness: completenessPercentage
                },
                companyInfo: {
                    name: companyProfile.companyName,
                    industry: companyProfile.industry,
                    city: companyProfile.city,
                    profileImg: companyProfile.profileImg
                },
                recentApplicants: formattedApplicants
            }
        });
    } catch (error) {
        next(error)
    }
}

/**
 * ==============================================================================
 * RECRUITMENT ANALYTICS (FUNNEL, GROWTH, PERFORMANCE)
 * ==============================================================================
 */
export const getCompanyAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId } = req.params;
        const { range } = req.query; // '7', '30', '90', '180' (days)
        const days = parseInt(range as string) || 30;

        // 1. KPI Counts
        const [totalApplicants, shortlisted, interviewScheduled, hired] = await Promise.all([
            (prisma as any).application.count({ where: { job: { companyId } } }),
            (prisma as any).application.count({ where: { job: { companyId }, status: "SHORTLISTED" } }),
            (prisma as any).application.count({ where: { job: { companyId }, status: "INTERVIEW_SCHEDULED" } }),
            (prisma as any).application.count({ where: { job: { companyId }, status: "HIRED" } })
        ]);

        // 2. Growth Data (Based on range)
        const rangeStartDate = new Date();
        rangeStartDate.setDate(rangeStartDate.getDate() - days);

        const growthRaw = await (prisma as any).application.findMany({
            where: {
                job: { companyId },
                createdAt: { gte: rangeStartDate }
            },
            select: { createdAt: true }
        });

        const growthMap: any = {};
        const isShortRange = days <= 30;

        if (isShortRange) {
            // Group by days
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                growthMap[dayLabel] = 0;
            }

            growthRaw.forEach((app: any) => {
                const dayLabel = new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                if (growthMap[dayLabel] !== undefined) growthMap[dayLabel]++;
            });
        } else {
            // Group by months
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthCount = Math.ceil(days / 30);
            for (let i = monthCount - 1; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                growthMap[months[d.getMonth()]] = 0;
            }

            growthRaw.forEach((app: any) => {
                const monthName = months[new Date(app.createdAt).getMonth()];
                if (growthMap[monthName] !== undefined) growthMap[monthName]++;
            });
        }

        const growthData = Object.keys(growthMap).map(label => ({
            label,
            applicants: growthMap[label]
        }));

        // 3. Job Performance (Top 5 Jobs)
        const jobPerformanceRaw = await (prisma as any).job.findMany({
            where: { companyId },
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: {
                applications: { _count: "desc" }
            },
            take: 5
        });

        const jobPerformance = jobPerformanceRaw.map((job: any) => ({
            role: job.title.length > 20 ? job.title.substring(0, 18) + "..." : job.title,
            applicants: job._count.applications,
            conversion: shortlisted > 0 ? `${Math.round((shortlisted / totalApplicants) * 100)}%` : "0%"
        }));

        // 4. Funnel Data
        const funnelData = [
            { stage: "Applied", value: totalApplicants },
            { stage: "Shortlisted", value: shortlisted },
            { stage: "Interview", value: interviewScheduled },
            { stage: "Hired", value: hired }
        ];

        res.status(200).json({
            success: true,
            data: {
                kpis: [
                    { label: "Total Applicants", value: totalApplicants.toLocaleString(), trend: "+12%" },
                    { label: "Shortlisted", value: shortlisted.toLocaleString(), trend: "+5%" },
                    { label: "Interviews", value: interviewScheduled.toLocaleString(), trend: "+8%" },
                    { label: "Hires", value: hired.toLocaleString(), trend: "+2%" }
                ],
                growthData,
                jobPerformance,
                funnelData,
                sourceData: [
                    { source: "ConnectiFy", value: totalApplicants, efficiency: "High" },
                    { source: "Direct", value: Math.floor(totalApplicants * 0.2), efficiency: "Medium" }
                ]
            }
        });
    } catch (error) {
        next(error)
    }
}

/**
 * REFRESH COMPANY TOKEN
 */
export const refreshCompanyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "Refresh token is required" });
        }

        const JWT_SECRET = process.env.JWT_SECRET || "developer";
        let payload: any;
        try {
            payload = jwt.verify(refreshToken, JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
        }

        const company = await (prisma as any).company.findUnique({
            where: { id: payload.id },
            select: { refreshTokens: true, email: true, id: true }
        });

        if (!company || !company.refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ success: false, message: "Refresh token not recognized" });
        }

        // Issue new access token
        const newAccessToken = jwt.sign(
            { id: company.id, email: company.email, role: 'company' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            success: true,
            token: newAccessToken
        });
    } catch (error) {
        next(error);
    }
};

/**
 * LOGOUT COMPANY
 */
export const logoutCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken, companyId } = req.body;

        if (refreshToken && companyId) {
            const company = await (prisma as any).company.findUnique({ where: { id: companyId }, select: { refreshTokens: true } });
            if (company) {
                await (prisma as any).company.update({
                    where: { id: companyId },
                    data: {
                        refreshTokens: company.refreshTokens.filter((rt: string) => rt !== refreshToken)
                    }
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};
