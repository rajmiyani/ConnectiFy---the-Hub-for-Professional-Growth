import { createClient } from "redis";

/**
 * REDIS CLIENT CONFIGURATION
 * Why: Redis is our "Sticky Note" storage. We use it for data that we need to 
 * access very fast, but only for a short time (like OTPs).
 */
const redisClient = createClient({
    // Logic: Use the URL from .env, or default to standard local redis
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Logic: Log an error if the connection to the sticky note box fails.
redisClient.on("error", (err) => console.log("❌ Redis Client Error", err));

// Logic: Log a message when we successfully connect.
redisClient.on("connect", () => console.log("✅ Redis Client Connected"));

export default redisClient;
