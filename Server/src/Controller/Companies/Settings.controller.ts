import { Request, Response, NextFunction } from "express"
import { prisma } from "../../Config/prisma.js"
import bcrypt from "bcrypt"

// 🔹 Update Company Settings
export const updateCompanySettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId, notificationPrefs, privacySettings, twoFactorEnabled, activityStatus } = req.body

        if (!companyId) {
            return res.status(400).json({ success: false, message: "Company ID is required" })
        }

        const updatedCompany = await prisma.company.update({
            where: { id: companyId },
            data: {
                notificationPrefs: notificationPrefs !== undefined ? notificationPrefs : undefined,
                privacySettings: privacySettings !== undefined ? privacySettings : undefined,
                twoFactorEnabled: twoFactorEnabled !== undefined ? twoFactorEnabled : undefined,
                activityStatus: activityStatus !== undefined ? activityStatus : undefined,
            },
            select: {
                id: true,
                notificationPrefs: true,
                privacySettings: true,
                twoFactorEnabled: true,
                activityStatus: true
            }
        })

        res.status(200).json({
            success: true,
            message: "Company settings updated successfully",
            data: updatedCompany
        })
    } catch (error) {
        next(error)
    }
}

// 🔹 Update Company Password
export const updateCompanyPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyId, currentPassword, newPassword } = req.body

        if (!companyId || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { password: true }
        })

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" })
        }

        const isMatch = await bcrypt.compare(currentPassword, company.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect current password" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.company.update({
            where: { id: companyId },
            data: { password: hashedPassword }
        })

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        next(error)
    }
}
