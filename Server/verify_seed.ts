import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    const jobCount = await prisma.job.count();
    const applicationCount = await prisma.application.count();
    const notificationCount = await prisma.notification.count();

    console.log("📊 Database Population Stats:");
    console.log(`- Users: ${userCount}`);
    console.log(`- Companies: ${companyCount}`);
    console.log(`- Jobs: ${jobCount}`);
    console.log(`- Applications: ${applicationCount}`);
    console.log(`- Notifications: ${notificationCount}`);

    if (userCount >= 30 && companyCount >= 15) {
        console.log("✅ Verification successful! Data meets requirements.");
    } else {
        console.error("❌ Verification failed! Data count mismatch.");
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
