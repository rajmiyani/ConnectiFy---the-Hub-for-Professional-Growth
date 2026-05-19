import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const counts = {
        companies: await prisma.company.count(),
        users: await prisma.user.count(),
        jobs: await prisma.job.count(),
        applications: await prisma.application.count(),
        posts: await prisma.post.count()
    };
    console.log("DATABASE_COUNTS:", JSON.stringify(counts, null, 2));
    process.exit(0);
}

main();
