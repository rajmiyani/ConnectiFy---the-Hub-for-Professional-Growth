import { Router } from "express"
import { updateCompanySettings, updateCompanyPassword } from "../../Controller/Companies/Settings.controller.js"

const router = Router()

// @route   PUT /companies/settings
// @desc    Update company account settings
router.put("/", updateCompanySettings)

// @route   PUT /companies/settings/change-password
// @desc    Update company password
router.put("/change-password", updateCompanyPassword)

export default router
