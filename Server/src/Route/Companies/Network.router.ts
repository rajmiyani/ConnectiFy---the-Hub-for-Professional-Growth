import { Router } from "express";
import { getCompanyNetwork, getNetworkInsights } from "../../Controller/Companies/Network.controller.js";

const router = Router();

router.get("/:companyId", getCompanyNetwork);
router.get("/insights/:companyId", getNetworkInsights);

export default router;
