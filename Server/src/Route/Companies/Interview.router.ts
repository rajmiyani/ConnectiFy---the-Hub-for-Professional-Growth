import { Router } from "express";
import { getInterviewDetails, updateInterviewNotes, getInterviewSuggestions } from "../../Controller/Companies/Interview.controller.js";

const router = Router();

router.get("/:id", getInterviewDetails);
router.patch("/:id/notes", updateInterviewNotes);
router.get("/:id/suggestions", getInterviewSuggestions);

export default router;
