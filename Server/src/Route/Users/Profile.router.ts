import { Router } from "express"
import { updateProfile, getProfile, getProfileByUsername, getUserAnalytics, updateSettings, updatePassword } from "../../Controller/Users/Profile.controller.js"
import { profileUpdateValidation } from "../../Validators/profile.validator.js"

const router = Router()

// @route   GET /users/profile/by-username/:username
// @desc    Get profile by username (for viewing other users)
router.get("/by-username/:username", getProfileByUsername)

// @route   GET /users/profile/:id
// @desc    Get user profile details
router.get("/:id", getProfile)

// @route   PUT /users/profile
// @desc    Update user profile details
// @access  Private (Authentication placeholder)
router.put("/", profileUpdateValidation, updateProfile)

// @route   GET /users/profile/analytics/:id
// @desc    Get user profile analytics
router.get("/analytics/:id", getUserAnalytics)

// @route   PUT /users/profile/settings
// @desc    Update user account settings
router.put("/settings", updateSettings)

// @route   PUT /users/profile/change-password
// @desc    Update user password
router.put("/change-password", updatePassword)

export default router
