import { PrismaClient, ApplicationStatus, AccountType, NotificationType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Global Seeding Process...");

    console.log("Sweep 1: Cleaning up existing data...");
    await prisma.notification.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.application.deleteMany();
    await prisma.savedJob.deleteMany();
    await prisma.job.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.savedPost.deleteMany();
    await prisma.post.deleteMany();
    await prisma.connection.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. CREATE COMPANIES (15)
    console.log("🏢 Creating 15 Companies...");
    const companyData = [
        { name: "TechNova Solutions", email: "hr@technova.in", industry: "IT Services", city: "Bangalore", about: "Leading digital transformation partner specializing in cloud and AI." },
        { name: "Pune Logic", email: "careers@punelogic.com", industry: "Software", city: "Pune", about: "Specialized in enterprise software solutions for global logistics." },
        { name: "CloudScale Systems", email: "talent@cloudscale.io", industry: "Cloud Computing", city: "Hyderabad", about: "Next-gen cloud infrastructure and serverless solutions." },
        { name: "DataMint AI", email: "join@datamint.ai", industry: "Artificial Intelligence", city: "Mumbai", about: "Driving AI innovation in fintech and digital banking." },
        { name: "SecureNet Labs", email: "hr@securenet.co", industry: "Cybersecurity", city: "Gurgaon", about: "Pioneering cybersecurity defense systems for modern enterprises." },
        { name: "InnoSoft Lab", email: "jobs@innosoft.in", industry: "SaaS", city: "Bangalore", about: "SaaS solutions for global healthcare and clinical research." },
        { name: "Vertex Consulting", email: "hr@vertex.com", industry: "Consulting", city: "Delhi", about: "Business and technology consulting leaders for Fortune 500." },
        { name: "BlueChip Tech", email: "hr@bluechip.io", industry: "Hardware", city: "Chennai", about: "Next-gen semicon and hardware design for IoT." },
        { name: "Zenix Digital", email: "talent@zenix.in", industry: "Digital Marketing", city: "Ahmedabad", about: "Digital transformation and omnichannel marketing for retailers." },
        { name: "Apex FinTech", email: "hr@apexfin.com", industry: "Fintech", city: "Mumbai", about: "Revolutionizing digital payments and wealth management." },
        { name: "CoreDynamics", email: "careers@coredynamics.in", industry: "Core Engineering", city: "Indore", about: "Industrial automation, robotics, and smart manufacturing." },
        { name: "Swift Logistics", email: "hr@swiftlog.com", industry: "Logistics", city: "Surat", about: "AI-powered logistics and global supply chain management." },
        { name: "MediTech Systems", email: "hr@meditech.in", industry: "Healthcare", city: "Bangalore", about: "Innovating healthcare through digital health records and AI diagnostics." },
        { name: "EduVantage Solutions", email: "careers@eduvantage.com", industry: "EdTech", city: "Pune", about: "Bridging the gap between education and industry through immersive learning." },
        { name: "GreenEnergy Labs", email: "jobs@greenenergy.io", industry: "Renewable Energy", city: "Hyderabad", about: "Sustainable energy solutions for a greener future." }
    ];

    const createdCompanies = [];
    for (const c of companyData) {
        const company = await prisma.company.create({
            data: {
                companyName: c.name,
                email: c.email,
                password: hashedPassword,
                industry: c.industry,
                companySize: "500-1000",
                city: c.city,
                state: "Karnataka", // Default state
                country: "India",
                address: `Tech Park, ${c.city}`,
                tagline: "Innovating for a better tomorrow.",
                about: c.about,
                recruiterName: "John Recruiter",
                recruiterEmail: `recruiter@${c.name.toLowerCase().replace(/\s/g, "")}.com`,
                recruiterPhone: "9876543210",
                recruiterRole: "HR Manager",
                isActive: true,
                isVerified: true,
                profileImg: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0073B1&color=fff`,
                techStack: JSON.stringify(["React", "Node.js", "AWS", "PostgreSQL"])
            }
        });
        createdCompanies.push(company);
    }

    // 2. CREATE USERS (30)
    console.log("👤 Creating 30 Users...");
    const firstNames = [
        "Aarav", "Aditi", "Arjun", "Ananya", "Ishaan", "Kavya", "Hrithik", "Riya", "Karthik", "Saira",
        "Vikram", "Meera", "Kabir", "Zara", "Omkar", "Priya", "Rahul", "Sneha", "Amit", "Tanvi",
        "Rohan", "Nisha", "Sahil", "Pooja", "Manish", "Deepak", "Asha", "Vijay", "Lata", "Sunil"
    ];
    const lastNames = [
        "Sharma", "Rao", "Mehta", "Gupta", "Varma", "Singh", "Patel", "Malhotra", "Nair", "Khan",
        "Joshi", "Iyer", "Deshmukh", "Ahmed", "Kulkarni", "Saxena", "Banerjee", "Kapoor", "Trivedi", "Shah",
        "Das", "Reddy", "Verma", "Joshi", "Pandey", "Chopra", "Bose", "Kaur", "Mishra", "Pillai"
    ];

    const jobTitles = ["Frontend Developer", "Backend Developer", "Full Stack Engineer", "UI/UX Designer", "Product Manager", "Data Scientist", "DevOps Engineer", "Mobile App Developer", "QA Automation Engineer", "System Architect"];

    const createdUsers = [];
    for (let i = 0; i < 30; i++) {
        const firstName = firstNames[i];
        const lastName = lastNames[i];
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                username: `${firstName.toLowerCase()}${i}`,
                email: `${firstName.toLowerCase()}${i}@example.com`,
                password: hashedPassword,
                headline: `${jobTitles[i % jobTitles.length]} | Tech Enthusiast`,
                bio: `Hi, I am ${firstName}, a professional dedicated to excellence in ${jobTitles[i % jobTitles.length]}.`,
                skills: "React, Node.js, TypeScript, PostgreSQL",
                city: "Mumbai",
                state: "Maharashtra",
                country: "India",
                isActive: true,
                isVerified: true,
                profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}`,
                connections: Math.floor(Math.random() * 500),
                profileViews: Math.floor(Math.random() * 1000)
            }
        });
        createdUsers.push(user);
    }

    // 3. CREATE JOBS (45)
    console.log("💼 Creating 45 Jobs...");
    const createdJobs = [];
    for (let i = 0; i < 45; i++) {
        const company = createdCompanies[i % createdCompanies.length];
        const job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: jobTitles[i % jobTitles.length],
                location: company.city,
                type: i % 4 === 0 ? "Contract" : i % 3 === 0 ? "Internship" : "Full-time",
                workMode: i % 2 === 0 ? "Remote" : "Onsite",
                experience: `${(i % 5) + 1}+ years`,
                salary: `${(i % 10) + 8} - ${(i % 10) + 20} LPA`,
                description: `We are looking for a ${jobTitles[i % jobTitles.length]} to join our team at ${company.companyName}. You will work on innovative projects in the ${company.industry} sector.`,
                skills: "JavaScript, React, Node.js, Cloud Technologies",
                status: i % 10 === 0 ? "Closed" : "Active"
            }
        });
        createdJobs.push(job);
    }

    // 4. CREATE APPLICATIONS (60)
    console.log("✉️ Creating 60 Applications...");
    const appStatuses: ApplicationStatus[] = ["PENDING", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED", "REJECTED"];
    for (let i = 0; i < 60; i++) {
        const user = createdUsers[i % createdUsers.length];
        const job = createdJobs[i % createdJobs.length];
        await prisma.application.create({
            data: {
                userId: user.id,
                jobId: job.id,
                status: appStatuses[i % appStatuses.length],
                fullName: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: "9198765432",
                resumeUrl: "https://example.com/sample_resume.pdf",
                coverLetter: "I am highly interested in this role and believe my skills align perfectly."
            }
        }).catch(() => { }); // Ignore duplicates if any
    }

    // 5. CREATE POSTS & NOTIFICATIONS (30)
    console.log("📝 Creating Social Feed & Notifications...");
    for (let i = 0; i < 30; i++) {
        const user = createdUsers[i];
        const post = await prisma.post.create({
            data: {
                userId: user.id,
                content: `Excited to share that I'm exploring new opportunities in ${jobTitles[i % jobTitles.length]}! #Tech #CareerGrowth`,
                mediaType: "article"
            }
        });

        // Add some notifications for the user
        try {
            await prisma.notification.create({
                data: {
                    recipientId: user.id,
                    recipientUserId: user.id,
                    recipientType: AccountType.user,
                    type: NotificationType.ALERT,
                    content: "Welcome to ConnectiFy! Start building your network today.",
                    isRead: false
                }
            });
        } catch (err) {
            console.warn(`⚠️ Failed to create notification for user ${user.id}:`, err);
        }
    }

    console.log("✅ Database Seeding Completed Successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding Failed:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
