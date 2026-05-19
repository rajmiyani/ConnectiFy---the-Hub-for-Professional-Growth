import express from "express"
import { getSuggestions, sendRequest, handleRequest, getPendingRequests, getConnections } from "../../Controller/Users/Network.controller.js"

const router = express.Router()

router.get("/suggestions/:userId", getSuggestions)
router.post("/request", sendRequest)
router.post("/handle", handleRequest)
router.get("/pending/:userId", getPendingRequests)
router.get("/accepted/:userId", getConnections)

export default router
