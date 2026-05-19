import { PrismaClient, ApplicationStatus, AccountType, ConnectionStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Comprehensive Seeding Process...");

    console.log("🧹 Sweep: Cleaning up existing data...");
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
    await prisma.experience.deleteMany();
    await prisma.educationDetail.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. CREATE COMPANIES (15)
    console.log("🏢 Creating 15 Companies...");
    const companyNames = [
        "Google", "Microsoft", "Meta", "Amazon", "Apple",
        "Netflix", "Tesla", "Adobe", "Intel", "IBM",
        "Salesforce", "Oracle", "Spotify", "Uber", "Airbnb"
    ];

    const industries = ["Search & AI", "Software & Cloud", "Social Media", "E-commerce", "Consumer Tech", "Streaming", "Electric Vehicles", "Creative Software", "Semiconductors", "Enterprise Solutions", "CRM", "Database Systems", "Music Streaming", "Mobility", "Hospitality"];
    const cities = ["Mountain View", "Redmond", "Menlo Park", "Seattle", "Cupertino", "Los Gatos", "Austin", "San Jose", "Santa Clara", "Armonk", "San Francisco", "Austin", "Stockholm", "San Francisco", "San Francisco"];

    const createdCompanies = [];
    for (let i = 0; i < 15; i++) {
        const company = await prisma.company.create({
            data: {
                companyName: companyNames[i],
                email: `hr@${companyNames[i].toLowerCase()}.com`,
                password: hashedPassword,
                industry: industries[i],
                website: `https://www.${companyNames[i].toLowerCase()}.com`,
                companySize: "10,000+",
                foundedYear: (1970 + i * 2).toString(),
                recruiterName: `HR Manager at ${companyNames[i]}`,
                recruiterEmail: `recruiter@${companyNames[i].toLowerCase()}.com`,
                recruiterPhone: `+1 800-${100 + i}`,
                address: `One ${companyNames[i]} Way, ${cities[i]}`,
                city: cities[i],
                state: "CA",
                country: "USA",
                tagline: `Leading the ${industries[i]} revolution.`,
                about: `We are ${companyNames[i]}, a world-renowned leader in ${industries[i]}. Join us to build the future.`,
                isVerified: true,
                isActive: true,
                profileImg: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyNames[i])}&background=random&color=fff`,
                coverPhoto: `https://images.unsplash.com/photo-${1500000000000 + i}`,
                techStack: JSON.stringify(["React", "TypeScript", "Node.js", "GraphQL", "K8s"])
            }
        });
        createdCompanies.push(company);
    }

    // 2. CREATE USERS (40)
    console.log("👤 Creating 40 Users...");
    const userSeedData = [
        "Aarav Sharma", "Aditi Rao", "Arjun Mehta", "Ananya Gupta", "Ishaan Varma",
        "Kavya Singh", "Hrithik Patel", "Riya Malhotra", "Karthik Nair", "Saira Khan",
        "Vikram Joshi", "Meera Iyer", "Kabir Deshmukh", "Zara Ahmed", "Omkar Kulkarni",
        "Priya Saxena", "Rahul Banerjee", "Sneha Kapoor", "Amit Trivedi", "Tanvi Shah",
        "Rohan Das", "Nisha Reddy", "Sahil Verma", "Pooja Joshi", "Manish Pandey",
        "Deepak Verma", "Shweta Kulkarni", "Kunal Shah", "Anjali Menon", "Prateek Jain",
        "Siddharth Roy", "Esha Gupta", "Varun Dhawan", "Alia Bhatt", "Ranbir Kapoor",
        "Kiara Advani", "Ayushmann Khurrana", "Bhumi Pednekar", "Kartik Aaryan", "Sara Ali Khan"
    ];

    const createdUsers = [];
    for (let i = 0; i < userSeedData.length; i++) {
        const [firstName, lastName] = userSeedData[i].split(" ");
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@connectify.com`,
                password: hashedPassword,
                headline: `Software Engineer at ${companyNames[i % 15]} | Tech Enthusiast`,
                bio: `Passionately building scalable applications and exploring new technologies. Excited to connect and collaborate.`,
                skills: "React, Node.js, Next.js, PostgreSQL, Docker, AWS",
                city: "Bengaluru",
                state: "Karnataka",
                country: "India",
                isActive: true,
                isVerified: true,
                profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
                coverPhoto: `https://images.unsplash.com/photo-${1600000000000 + i}`,
                connections: Math.floor(Math.random() * 1000),
                profileViews: Math.floor(Math.random() * 5000),
                education: {
                    create: [
                        {
                            institution: "Indian Institute of Technology",
                            degree: "B.Tech in Computer Science",
                            year: "2020",
                            description: "Focused on Algorithms and Distributed Systems."
                        }
                    ]
                },
                experiences: {
                    create: [
                        {
                            role: "Full Stack Developer",
                            company: companyNames[(i + 1) % 15],
                            duration: "2 years",
                            description: "Developing core platform components."
                        }
                    ]
                }
            }
        });
        createdUsers.push(user);
    }

    // 3. CREATE JOBS (45)
    console.log("💼 Creating 45 Jobs...");
    const roles = ["Senior Frontend Developer", "Backend Architect", "Product Designer", "Data Scientist", "DevOps Engineer", "Project Manager", "Security Specialist", "Mobile Engineer", "HR Specialist"];
    const createdJobs = [];
    for (let i = 0; i < 45; i++) {
        const company = createdCompanies[i % 15];
        const job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: roles[i % roles.length],
                location: company.city,
                type: i % 4 === 0 ? "Internship" : i % 3 === 0 ? "Contract" : "Full-time",
                workMode: i % 2 === 0 ? "Remote" : "Hybrid",
                experience: `${(i % 5) + 2} - ${(i % 5) + 5} years`,
                salary: `$${(i % 10 + 80)}k - $${(i % 10 + 150)}k`,
                description: `We are looking for a highly motivated ${roles[i % roles.length]} to join our team at ${company.companyName}. You will be working on high-impact projects.`,
                skills: "System Design, Microservices, React, Go, Kubernetes",
                status: "Active",
                logo: company.profileImg
            }
        });
        createdJobs.push(job);
    }

    // 4. CREATE APPLICATIONS & INTERVIEWS (100)
    console.log("✉️ Creating 100 Applications & Interviews...");
    const appStatuses: ApplicationStatus[] = ["PENDING", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED", "REJECTED"];
    for (let i = 0; i < 100; i++) {
        const user = createdUsers[i % 40];
        const job = createdJobs[i % 45];
        const status = appStatuses[i % appStatuses.length];

        const application = await prisma.application.create({
            data: {
                userId: user.id,
                jobId: job.id,
                status: status,
                fullName: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: "+91 9999988888",
                resumeUrl: "https://connectify-storage.com/dummy-resume.pdf",
                coverLetter: "I am confident that my skills in cloud architecture and backend development make me a perfect fit for this role."
            }
        }).catch(() => null);

        if (application && (status === "INTERVIEW_SCHEDULED" || status === "HIRED")) {
            await prisma.interview.create({
                data: {
                    applicationId: application.id,
                    scheduledAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
                    type: "Online",
                    location: "https://zoom.us/j/123456789",
                    notes: "Be prepared to discuss your portfolio and recent projects."
                }
            });
        }
    }

    // 5. CREATE SOCIAL FEED (POSTS, LIKES, COMMENTS) (60)
    console.log("📝 Creating Social Feed (Posts, Likes, Comments)...");
    for (let i = 0; i < 60; i++) {
        const user = createdUsers[i % 40];
        const post = await prisma.post.create({
            data: {
                userId: user.id,
                content: `Excited to share that I've been diving deep into ${industries[i % 15]} lately. The future is bright! #Tech #Connectify #Learning`,
                mediaType: i % 4 === 0 ? "image" : "article",
                mediaUrls: i % 4 === 0 ? ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97"] : []
            }
        });

        // Add 10 random likes
        for (let l = 0; l < 10; l++) {
            const liker = createdUsers[(i + l + 1) % 40];
            await prisma.like.create({
                data: { userId: liker.id, postId: post.id }
            }).catch(() => null);
        }

        // Add 3 random comments
        for (let c = 0; c < 3; c++) {
            const commenter = createdUsers[(i + c + 5) % 40];
            await prisma.comment.create({
                data: {
                    userId: commenter.id,
                    postId: post.id,
                    content: "This is great insight! Thanks for sharing."
                }
            });
        }
    }

    // 6. CREATE CONNECTIONS (100)
    console.log("🔗 Creating 100 Connections...");
    for (let i = 0; i < 100; i++) {
        const u1 = createdUsers[i % 40];
        const u2 = createdUsers[(i + 13) % 40];
        if (u1.id !== u2.id) {
            await prisma.connection.create({
                data: {
                    senderId: u1.id,
                    receiverId: u2.id,
                    status: i % 10 === 0 ? ConnectionStatus.PENDING : ConnectionStatus.ACCEPTED
                }
            }).catch(() => null);
        }
    }

    // 7. CREATE NOTIFICATIONS (120)
    console.log("🔔 Creating 120 Notifications...");
    const notifTypes: NotificationType[] = [NotificationType.LIKE, NotificationType.COMMENT, NotificationType.REQUEST, NotificationType.ALERT];
    for (let i = 0; i < 120; i++) {
        const recipient = createdUsers[i % 40];
        const sender = createdUsers[(i + 7) % 40];
        await prisma.notification.create({
            data: {
                recipientId: recipient.id,
                recipientType: AccountType.user,
                recipientUserId: recipient.id,
                senderId: sender.id,
                senderType: AccountType.user,
                senderUserId: sender.id,
                type: notifTypes[i % notifTypes.length],
                content: `A new ${notifTypes[i % notifTypes.length].toLowerCase()} on your profile/post.`,
                isRead: i % 3 === 0
            }
        });
    }

    console.log("✅ Master Seeding Completed! 15 Companies and 40 Users created with full interaction history.");
}

main()
    .catch((e) => {
        console.error("❌ Seeding Failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });