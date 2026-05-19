import { body } from "express-validator"

export const profileUpdateValidation = [
    body("headline")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Headline must not exceed 100 characters"),

    body("bio")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Bio must not exceed 500 characters"),

    body("skills")
        .optional()
        .custom((value) => {
            if (!value) return true;
            const skills = typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(s => s) : value;
            if (skills.length > 30) {
                throw new Error("Maximum 30 skills allowed");
            }
            return true;
        }),

    body("university")
        .optional()
        .isLength({ max: 200 })
        .withMessage("University name too long"),

    body("courseName")
        .optional()
        .isLength({ max: 200 })
        .withMessage("Course name too long"),

    body("cgpa")
        .optional()
        .matches(/^[0-9]+(\.[0-9]{1,2})?%?$/)
        .withMessage("Invalid CGPA or Percentage format"),

    body("linkedin")
        .optional()
        .custom((value) => {
            if (!value || value === "#") return true;
            if (!value.startsWith("https://www.linkedin.com/")) {
                throw new Error("Invalid LinkedIn URL");
            }
            return true;
        }),

    body("portfolio")
        .optional()
        .custom((value) => {
            if (!value || value === "#") return true;
            try {
                new URL(value);
                return true;
            } catch (e) {
                throw new Error("Invalid Portfolio URL");
            }
        }),

    body("phone")
        .optional()
        .matches(/^(?:\+?91|0)?[6-9]\d{9}$/)
        .withMessage("Invalid phone number"),

    body("profileImg")
        .optional()
        .custom((value) => {
            if (!value) return true;
            const isUrl = value.startsWith("http://") || value.startsWith("https://");
            const isDataUri = value.startsWith("data:image/");
            if (!isUrl && !isDataUri) {
                throw new Error("Invalid profile image format (URL or Data URI required)");
            }
            return true;
        }),

    body("coverPhoto")
        .optional()
        .custom((value) => {
            if (!value) return true;
            const isUrl = value.startsWith("http://") || value.startsWith("https://");
            const isDataUri = value.startsWith("data:image/");
            if (!isUrl && !isDataUri) {
                throw new Error("Invalid cover photo format (URL or Data URI required)");
            }
            return true;
        }),
]