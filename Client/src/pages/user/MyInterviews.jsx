import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import {
    FaCalendarAlt, FaClock, FaVideo, FaMapMarkerAlt,
    FaBuilding, FaCheckCircle, FaRobot, FaArrowRight
} from "react-icons/fa";

/* ================= THEME ================= */
const COLORS = {
    primary: "#0073b1",
    secondary: "#e8f4fb",
    textDark: "#1f1f1f",
    textLight: "#606770",
    border: "#e0e0e0",
    white: "#ffffff",
    hover: "#f7f9fa",
    bg: "#f3f2ef",
    success: "#057642",
};

const dummyInterviews = [
    {
        id: 3,
        companyName: "TechNova Solutions",
        role: "Frontend Developer",
        type: "Online",
        date: "2024-03-25T14:30",
        link: "https://meet.google.com/abc-defg-hij",
        status: "Scheduled",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
    },
    {
        id: 8,
        companyName: "Global HR Services",
        role: "HR Manager",
        type: "Offline",
        date: "2024-03-26T11:00",
        location: "TechNova HQ, Meeting Room 3",
        status: "Scheduled",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    }
];

export default function MyInterviews() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const socket = useSocket();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [interviews, setInterviews] = useState([]);

    React.useEffect(() => {
        if (socket) {
            socket.on("interview_scheduled", (data) => {
                console.log("🔥 Interview scheduled received:", data);
                // App.jsx will handle the toast.

                // Add to interviews list
                const newInterview = {
                    id: data.applicationId, // or interview id if returned
                    companyName: "Recent Update", // We might want more info from backend emit
                    role: "Scheduled Interview",
                    type: data.type,
                    date: data.scheduledAt,
                    link: data.location, // location is link if online
                    location: data.location,
                    status: "INTERVIEW_SCHEDULED",
                    companyLogo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                };
                setInterviews(prev => [newInterview, ...prev]);
            });

            return () => socket.off("interview_scheduled");
        }
    }, [socket]);

    React.useEffect(() => {
        const fetchInterviews = async () => {
            if (!user?.id) return;
            try {
                const response = await api.get(`/users/jobs/interviews/${user.id}`);
                const result = response.data;
                if (result.success) {
                    setInterviews(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch interviews:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviews();
    }, [user?.id]);

    return (
        <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "2rem" }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-1" style={{ color: COLORS.textDark }}>My Interviews</h3>
                        <p className="text-muted">Manage and join your upcoming interview sessions</p>
                    </div>
                </div>

                <div className="row g-4">
                    {isLoading ? (
                        [1, 2].map((i) => (
                            <div className="col-lg-6" key={i}>
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px", overflow: "hidden" }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex gap-3">
                                                <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: 56, height: 56 }}></div>
                                                <div>
                                                    <div className="skeleton skeleton-pulse skeleton-title" style={{ width: "150px" }}></div>
                                                    <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "100px" }}></div>
                                                </div>
                                            </div>
                                            <div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "80px", height: "30px" }}></div>
                                        </div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-sm-6"><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "100px" }}></div></div>
                                            <div className="col-sm-6"><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "100px" }}></div></div>
                                            <div className="col-12"><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "200px" }}></div></div>
                                        </div>
                                        <div className="skeleton skeleton-pulse skeleton-rect" style={{ height: "40px" }}></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : interviews.length > 0 ? (
                        interviews.map((interview) => (
                            <div className="col-lg-6" key={interview.id}>
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px", overflow: "hidden" }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex gap-3">
                                                <img
                                                    src={interview.companyLogo}
                                                    alt={interview.companyName}
                                                    width="56" height="56"
                                                    className="rounded-3 object-fit-contain bg-light p-2"
                                                />
                                                <div>
                                                    <h5 className="fw-bold mb-0" style={{ color: COLORS.textDark }}>{interview.role}</h5>
                                                    <p className="text-muted mb-0">{interview.companyName}</p>
                                                </div>
                                            </div>
                                            <div className="badge rounded-pill px-3 py-2" style={{ backgroundColor: COLORS.secondary, color: COLORS.primary }}>
                                                {interview.status}
                                            </div>
                                        </div>

                                        <div className="row g-3 mb-4">
                                            <div className="col-sm-6">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <FaCalendarAlt className="text-primary" />
                                                    <span>{new Date(interview.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <FaClock className="text-primary" />
                                                    <span>{new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    {interview.type === "Online" ? (
                                                        <>
                                                            <FaVideo className="text-primary" />
                                                            <span className="text-truncate">Online via {new URL(interview.link).hostname}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaBuilding className="text-primary" />
                                                            <span>{interview.location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2">
                                            {interview.type === "Online" ? (
                                                <button
                                                    className="btn btn-primary py-2 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3"
                                                    onClick={() => navigate(`/user/interview/${interview.id}`)}
                                                >
                                                    <FaVideo /> Join Interview Room
                                                </button>
                                            ) : (
                                                <button className="btn btn-outline-secondary py-2 fw-bold rounded-3" disabled>
                                                    <FaMapMarkerAlt className="me-2" /> View Office Location
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="mb-4">
                                <FaCalendarAlt size={64} className="text-muted opacity-25" />
                            </div>
                            <h4 className="fw-bold text-muted">No interviews scheduled yet</h4>
                            <p className="text-muted">When a company schedules an interview with you, it will appear here.</p>
                            <button className="btn btn-primary mt-3 px-4 rounded-pill" onClick={() => navigate("/user/jobs")}>
                                Explore Jobs
                            </button>
                        </div>
                    )}
                </div>

                {/* TIPS SECTION */}
                <div className="mt-5 p-4 bg-white rounded-4 shadow-sm border border-primary border-opacity-25">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                            <FaRobot size={24} />
                        </div>
                        <h5 className="fw-bold mb-0">Interview Preparation Tips</h5>
                    </div>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="fw-bold small text-uppercase text-primary mb-2">Technical</h6>
                                <p className="small text-muted mb-0">Review core concepts and practice coding problems in our <a href="/user/mock-interview" className="text-decoration-none fw-bold">Mock Interview</a> area.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="fw-bold small text-uppercase text-primary mb-2">Behavioral</h6>
                                <p className="small text-muted mb-0">Prepare stories using the STAR method for common behavioral questions.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-3 bg-light rounded-3 h-100">
                                <h6 className="fw-bold small text-uppercase text-primary mb-2">Logistics</h6>
                                <p className="small text-muted mb-0">Test your mic and camera at least 15 minutes before the scheduled time.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
