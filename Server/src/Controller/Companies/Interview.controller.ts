import { Request, Response, NextFunction } from "express";
import { prisma } from "../../Config/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getInterviewDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const interview = await (prisma as any).interview.findUnique({
            where: { id },
            include: {
                application: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profileImg: true,
                                headline: true,
                                bio: true
                            }
                        },
                        job: true
                    }
                }
            }
        });

        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview not found" });
        }

        res.status(200).json({ success: true, data: interview });
    } catch (error) {
        next(error);
    }
};

export const updateInterviewNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const updated = await (prisma as any).interview.update({
            where: { id },
            data: { notes }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

export const getInterviewSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const interview = await (prisma as any).interview.findUnique({
            where: { id },
            include: {
                application: {
                    include: {
                        user: true,
                        job: true
                    }
                }
            }
        });

        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview not found" });
        }

        const prompt = `You are an AI Interview Assistant for ConnectiFy. 
        Job Details: ${interview.application.job.title} - ${interview.application.job.description}
        Candidate: ${interview.application.user.firstName} ${interview.application.user.lastName} 
        Candidate Bio: ${interview.application.user.bio}
        
        Provide 3-4 specific and technical interview questions or reminders for the interviewer based on this role and candidate's background. Keep it concise as short bullet points.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Split text by lines and clean up bullets
        const suggestions = text.split("\n")
            .filter(line => line.trim().startsWith("*") || line.trim().match(/^\d\./))
            .map(line => line.replace(/^[\*\d\.\s]+/, "").trim());

        res.status(200).json({
            success: true,
            suggestions: suggestions.length > 0 ? suggestions : [text]
        });
    } catch (error) {
        console.error("Gemini Error:", error);
        // Fallback if Gemini fails or API key missing
        res.status(200).json({
            success: true,
            suggestions: [
                "Ask about their experience with relevant tech stack.",
                "Review their recent projects listed in profile.",
                "Discuss their problem-solving approach in their last role."
            ]
        });
    }
};
