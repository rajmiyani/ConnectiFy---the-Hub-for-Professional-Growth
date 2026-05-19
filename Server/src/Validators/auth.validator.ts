import { body } from "express-validator"

export const registerValidation = [
  body("accountType")
    .optional()
    .isIn(["user", "employee", "admin"])
    .withMessage("Invalid account type"),

  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be 2-100 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name allows only letters and spaces"),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be 3-50 characters")
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage("Username allows letters, numbers, dots, underscores"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage("Password must have 8+ chars, uppercase, lowercase, number, symbol"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match")
      }
      return true
    }),

  body("phone")
    .optional()
    .matches(/^(?:\+?91|0)?[6-9]\d{9}$/)
    .withMessage("Valid Indian phone number required (10 digits, starts 6-9)"),

  body("dob")
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage("DOB must be YYYY-MM-DD format")
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        throw new Error("Must be at least 18 years old");
      }
      return true;
    }),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),

  body("educationLevel")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Education level max 100 chars"),

  body("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country max 100 chars"),

  body("state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State max 100 chars"),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City max 100 chars"),

  body("occupation")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Occupation max 100 chars"),

  body("lookingFor")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Looking for max 255 chars"),

  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio max 500 chars"),

  body("skills")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const skills = (value as string).split(',').map(s => s.trim()).filter(s => s);
      if (skills.length === 0) {
        throw new Error("Provide at least one skill");
      }
      if (skills.length > 20) {
        throw new Error("Maximum 20 skills");
      }
      skills.forEach(skill => {
        if (skill.length < 2 || skill.length > 50) {
          throw new Error("Each skill 2-50 characters");
        }
      });
      return true;
    }),

  body("pin")
    .optional()
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage("PIN 4-6 digits"),

  body("profileImg")
    .optional()
    .isURL()
    .withMessage("Valid image URL required"),

  body("profileVisibility")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Invalid visibility"),

  body("accept")
    .isIn(["true", "on"])
    .withMessage("Terms must be accepted"),

  // Ensure at least email or phone
  body("email", "Email or phone required")
    .custom((value, { req }) => !!value || !!req.body.phone)
    .notEmpty(),
]
