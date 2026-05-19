import { Router } from "express";
import { getAIResponse, analyzeMockSession } from "../../Controller/Users/MockInterview.controller.js";

const router = Router();

router.post("/chat", getAIResponse);
router.post("/analyze", analyzeMockSession);

export default router;
