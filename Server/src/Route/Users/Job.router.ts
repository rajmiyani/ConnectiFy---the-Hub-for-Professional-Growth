import { Router } from "express"
import {
    getJobs,
    getJobDetails,
    applyJob,
    getMyApplications,
    toggleSaveJob,
    getUserInterviews
} from "../../Controller/Users/Job.controller.js"

const router = Router()

router.get("/", getJobs)
router.get("/:id", getJobDetails)
router.post("/apply", applyJob)
router.get("/applications/:userId", getMyApplications)
router.get("/interviews/:userId", getUserInterviews)
router.post("/toggle-save", toggleSaveJob)

export default router
