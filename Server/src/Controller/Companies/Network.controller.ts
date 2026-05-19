import { Request, Response, NextFunction } from "express";
import { prisma } from "../../Config/prisma.js";

/**
 * @desc Get Network data for a company
 * Includes suggestions (users) and recent connections (applicants)
 */
export const getCompanyNetwork = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId } = req.params;

        // 1. Get Suggestions: Users who are NOT the company obviously
        // For simplicity, we fetch top 12 active users
        const suggestions = await (prisma as any).user.findMany({
            where: { isActive: true },
            take: 12,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                headline: true,
                city: true,
                state: true,
                profileImg: true
            }
        });

        // 2. Get Recent Connections: Applicants for this company's jobs
        const recentApplicants = await (prisma as any).application.findMany({
            where: {
                job: {
                    companyId: companyId
                }
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImg: true,
                        headline: true
                    }
                }
            }
        });

        const recentConnections = recentApplicants.map((app: any) => ({
            id: app.user.id,
            name: `${app.user.firstName} ${app.user.lastName}`,
            image: app.user.profileImg,
            role: app.user.headline || "Applicant",
            appliedAt: app.createdAt
        }));

        res.status(200).json({
            success: true,
            data: {
                suggestions,
                recentConnections
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Get Network growth insights
 */
export const getNetworkInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Mocking growth data for now as we don't have a "Connections" model for companies yet
        // In a real scenario, this would aggregate follows/applications over time
        const insights = [
            { week: "Week 1", connections: 5 },
            { week: "Week 2", connections: 12 },
            { week: "Week 3", connections: 25 },
            { week: "Week 4", connections: 40 },
        ];

        res.status(200).json({
            success: true,
            data: insights
        });
    } catch (error) {
        next(error);
    }
};
