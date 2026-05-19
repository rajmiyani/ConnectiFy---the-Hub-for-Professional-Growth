import { Router } from "express"
import {
    postJob,
    getMyJobs,
    updateJob,
    deleteJob,
    getApplicants,
    getAllCompanyApplicants,
    updateApplicationStatus,
    scheduleInterview
} from "../../Controller/Companies/Job.controller.js"

const router = Router()

router.post("/", postJob)
router.get("/my-jobs/:companyId", getMyJobs)
router.put("/:jobId", updateJob)
router.delete("/:jobId", deleteJob)
router.get("/applicants/:jobId", getApplicants)
router.get("/all-applicants/:companyId", getAllCompanyApplicants)
router.put("/application-status/:applicationId", updateApplicationStatus)
router.post("/schedule-interview/:applicationId", scheduleInterview)

export default router
