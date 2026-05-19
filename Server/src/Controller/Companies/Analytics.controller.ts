import { Request, Response } from "express"
import { prisma } from "../../Config/prisma.js"

/**
 * @desc Get company analytics data
 * @route GET /companies/analytics/:companyId?range=7|30|90
 */
export const getCompanyAnalytics = async (req: Request, res: Response) => {
    const { companyId } = req.params
    const range = parseInt(req.query.range as string) || 30

    try {
        const since = new Date()
        since.setDate(since.getDate() - range)

        // All jobs for this company
        const jobs = await prisma.job.findMany({
            where: { companyId },
            include: {
                applications: {
                    where: { createdAt: { gte: since } },
                    select: { id: true, status: true, createdAt: true }
                }
            }
        })

        const totalApplicants = jobs.reduce((sum: number, j) => sum + j.applications.length, 0)
        const shortlisted = jobs.reduce((sum: number, j) => sum + j.applications.filter((a: any) => a.status === "SHORTLISTED" || a.status === "INTERVIEW").length, 0)
        const interviewed = jobs.reduce((sum: number, j) => sum + j.applications.filter((a: any) => a.status === "INTERVIEW").length, 0)
        const hires = jobs.reduce((sum: number, j) => sum + j.applications.filter((a: any) => a.status === "ACCEPTED").length, 0)

        // Build daily growth data (last N days)
        const growthData: { date: string; applicants: number }[] = []
        for (let i = range - 1; i >= 0; i--) {
            const day = new Date()
            day.setDate(day.getDate() - i)
            const dayStr = day.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
            const count = jobs.reduce((sum: number, j) => {
                return sum + j.applications.filter((a: any) => {
                    const d = new Date(a.createdAt)
                    return d.toDateString() === day.toDateString()
                }).length
            }, 0)
            growthData.push({ date: dayStr, applicants: count })
        }

        // Job performance data (top 5 jobs by applicants)
        const jobPerformance = jobs
            .sort((a, b) => b.applications.length - a.applications.length)
            .slice(0, 5)
            .map(j => ({ job: j.title?.slice(0, 20) || "Untitled", applicants: j.applications.length }))

        // Application funnel
        const allApplications = jobs.flatMap(j => j.applications)
        const funnelData = [
            { stage: "Applied", count: allApplications.length },
            { stage: "Shortlisted", count: allApplications.filter((a: any) => ["SHORTLISTED", "INTERVIEW", "ACCEPTED"].includes(a.status)).length },
            { stage: "Interviewed", count: allApplications.filter((a: any) => ["INTERVIEW", "ACCEPTED"].includes(a.status)).length },
            { stage: "Hired", count: allApplications.filter((a: any) => a.status === "ACCEPTED").length },
        ]

        const kpis = [
            { label: "Total Applicants", value: String(totalApplicants), trend: `+${totalApplicants}` },
            { label: "Shortlisted", value: String(shortlisted), trend: `+${shortlisted}` },
            { label: "Interviews", value: String(interviewed), trend: `+${interviewed}` },
            { label: "Hires", value: String(hires), trend: `+${hires}` },
        ]

        res.status(200).json({
            success: true,
            data: { kpis, growthData, jobPerformance, funnelData, sourceData: [] }
        })
    } catch (error) {
        console.error("Analytics error:", error)
        res.status(500).json({ success: false, message: "Analytics fetch failed" })
    }
}
