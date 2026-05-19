import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { prisma } from "./Config/prisma.js"
import redisClient from "./Config/redis.js"
import Routes from "./Route/index.js"
import globalErrorHandler from "./Middleware/GlobalErrorHandler.js"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import "./Queue/emailWorker.js"

// Why: Load variables from .env file (database passwords, etc.) so they are not hardcoded in the code.
dotenv.config()

const app = express()

// Why: Prisma is our bridge to PostgreSQL (The Filing Cabinet). 
// One client instance is used across the whole app to save memory.
// Why: Path to PostgreSQL is now handled in Config/prisma.ts

/* ===================== MIDDLEWARE ===================== */
// Middleware are like "Checkpoints" that every request passes through.

// Why: Allow our Frontend (running on a different port) to talk to this Backend.
app.use(cors())

// Why: Standard security headers
app.use(helmet())

// Why: Prevent Brute Force/DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter);

// Why: Allow large payloads (e.g., base64 images) for profile updates.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Why: Allow the server to read JSON data sent from the Frontend. (Redundant but keeping existing structure)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

/* ===================== ENV ===================== */
// Use the Port defined in .env, or default to 8000.
const PORT = process.env.PORT || 8000

/* ===================== HEALTH CHECK ===================== */
// Why: A simple URL to check if the database and Redis are actually working.
app.get("/health", async (_req, res) => {
  try {
    // Try to "ping" the Filing Cabinet (PostgreSQL)
    await prisma.$queryRaw`SELECT 1`

    // Check if the Sticky Note box (Redis) is open
    const redisStatus = redisClient.isOpen ? "Connected" : "Disconnected";

    res.json({
      status: "OK",
      database: "Connected",
      redis: redisStatus
    })
  } catch (error: any) {
    res.status(500).json({ status: "ERROR", message: error.message })
  }
})

/* ===================== ROUTES ===================== */
// Why: All our actual features (Login, Register, etc.) are organized inside the "Route" folder.
app.use("/", Routes)

/* ===================== ERROR HANDLING ===================== */
// Why: If any code crashes, this middleware catches it and sends a clean error message to the user.
app.use(globalErrorHandler)

import { createServer } from "http"
import { initSocket } from "./Config/socket.js"

/* ===================== START SERVER ===================== */
const startServer = async () => {
  try {
    // 1. Connect to our main Filing Cabinet (PostgreSQL)
    await prisma.$connect()
    console.log("✅ Database connected (Prisma)")

    // 2. Connect to our Sticky Note box (Redis)
    if (!redisClient.isOpen) {
      try {
        await redisClient.connect()
        console.log("✅ Redis connected")
      } catch (err) {
        console.warn("⚠️ Redis connection failed - Features like OTP might not work");
      }
    }

    // 3. Create HTTP Server and Initialize Socket.io
    const httpServer = createServer(app);
    initSocket(httpServer);
    console.log("✅ Socket.io initialized");

    // 4. Start listening for requests on the HTTP Server instance
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("❌ Startup Failed:", error)
    process.exit(1) // Stop everything if the database won't connect
  }
}

startServer()
