import { ConnectionOptions, DefaultJobOptions } from "bullmq"

/**
 * REDIS CONNECTION DETAILS
 * Why: This tells BullMQ (our Queue system) exactly where the Redis server is.
 */
export const redisConnection: ConnectionOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
}

/**
 * DEFAULT JOB SETTINGS
 * Why: We define how the Queue should behave for every job.
 */
export const defaultJobOptions: DefaultJobOptions = {
    // Logic: Keep info about successful emails for 24 hours so we can see history.
    removeOnComplete: {
        age: 60 * 60 * 24
    },
    // Logic: If an email fails (e.g., SMTP error), retry it 3 times.
    attempts: 3,
    // Logic: If it fails, wait 5 seconds before retrying, then longer each time.
    backoff: {
        type: "exponential",
        delay: 5000
    },
    // Logic: Keep info about failed emails for 7 days so we can debug them.
    removeOnFail: {
        age: 60 * 60 * 24 * 7
    }
}

/**
 * QUEUE NAMES
 * Why: We use a specific name ("email-queue") so our worker knows exactly which pile of jobs to work on.
 */
export const QUEUES = {
    EMAIL: "email-queue"
}