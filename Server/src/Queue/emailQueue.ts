import { Queue } from "bullmq";
import { redisConnection, defaultJobOptions, QUEUES } from "../Config/queue.js";

/**
 * INITIALIZE THE EMAIL QUEUE
 * Why: This creates the "Mailing Box". Whenever we want to send an email, 
 * we "drop" a job into this box.
 */
export const emailQueue = new Queue(QUEUES.EMAIL, {
    connection: redisConnection,
    defaultJobOptions: defaultJobOptions,
});

/**
 * HELPER FUNCTION: addEmailToQueue
 * Why: Instead of writing complex BullMQ code every time, we just call this simple function.
 * 
 * Data needed:
 * - email: Who to send it to.
 * - subject: The title of the email.
 * - message: Plain text version (fallback).
 * - html: The beautiful designed version.
 */
export const addEmailToQueue = async (data: {
    email: string;
    subject: string;
    message: string;
    html?: string;
}) => {
    // Logic: Add a new "Task" to the queue named "send-email"
    await emailQueue.add("send-email", data);
};
