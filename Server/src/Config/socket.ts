import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust this for production
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Users join a private room based on their ID to receive personal notifications
        socket.on("join", (userId: string) => {
            if (userId) {
                socket.join(userId);
                console.log(`👤 User ${userId} joined their private room`);
            }
        });

        // 🏢 Join company room for real-time recruiter updates
        socket.on("join_company", (companyId: string) => {
            if (companyId) {
                socket.join(`company_${companyId}`);
                console.log(`🏢 Company ${companyId} joined their enterprise room`);
            }
        });

        // 🛡️ Join admin room for system-wide updates
        socket.on("join_admin", () => {
            socket.join("admin_room");
            console.log(`🛡️ Admin ${socket.id} joined the command center`);
        });

        // 📝 JOIN INTERVIEW ROOM
        socket.on("join_interview", (interviewId: string) => {
            if (interviewId) {
                socket.join(`interview_${interviewId}`);
                console.log(`🎥 User joined interview room: interview_${interviewId}`);
            }
        });

        // 💻 CODE SYNC
        socket.on("code_change", ({ interviewId, code }) => {
            socket.to(`interview_${interviewId}`).emit("code_update", code);
        });

        // 📞 WEBRTC SIGNALING
        socket.on("webrtc_signal", ({ interviewId, signal }) => {
            // Signal can be offer, answer, or ice_candidate
            socket.to(`interview_${interviewId}`).emit("webrtc_signal", signal);
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
