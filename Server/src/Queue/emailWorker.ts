import { Worker, Job } from "bullmq";
import { redisConnection, QUEUES } from "../Config/queue.js";
import sendEmail from "../Utils/sendEmail.js";

/**
 * THE EMAIL WORKER (The Postal Worker)
 * Why: This is a separate process that lives in the background. 
 * It watches the "Mailing Box" (Queue) 24/7.
 */
export const emailWorker = new Worker(
    QUEUES.EMAIL, // Listen specifically to the email queue
    async (job: Job) => {
        // 1. "Open the envelope" to see the data inside the job
        const { email, subject, message, html } = job.data;

        console.log(`[Worker] Picking up job for ${email} (Job ID: ${job.id})`);

        try {
            // 2. Perform the actual slow task: Handing the email to Gmail (SMTP)
            await sendEmail({ email, subject, message, html });
            console.log(`[Worker] Successfully delivered email to ${email}`);
        } catch (error: any) {
            // 3. If it fails, we log it and THROW the error.
            // Why throw? Because BullMQ sees the error and automatically decides to RETRY later.
            console.error(`[Worker] Delivery failed for ${email}:`, error.message);
            throw error;
        }
    },
    { connection: redisConnection }
);

/* ===================== EVENT LISTENERS ===================== */
// These are like "Activity Logs" for our worker.

emailWorker.on("completed", (job) => {
    console.log(`[Worker] Task ${job.id} finished successfully!`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`[Worker] Task ${job?.id} failed completely after all retries:`, err.message);
});
