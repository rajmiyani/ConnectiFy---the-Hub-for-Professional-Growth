import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserPlus,
    FaEnvelope,
    FaMapMarkerAlt,
    FaUserFriends,
    FaTimesCircle,
    FaClock,
    FaUserTie
} from "react-icons/fa";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);
import { useAuth } from "../../context/AuthContext";
import { Toast, ToastContainer } from "react-bootstrap";
import api from "../../utils/api";

const COLORS = {
    primary: "#004E89",
    accent: "#0096C7",
    background: "#F4F7FB",
    card: "#FFFFFF",
    textDark: "#1E1E1E",
    border: "#E0E0E0",
};

const MyNetwork = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [recentConnections, setRecentConnections] = useState([]);
    const [stats, setStats] = useState({ connections: 0, profileViews: 0, posts: 0 });
    const [pendingConnecting, setPendingConnecting] = useState([]); // Array of user IDs being connected to
    const [showInsights, setShowInsights] = useState(false);
    const [viewAllPeople, setViewAllPeople] = useState(false);
    const [showAllConnections, setShowAllConnections] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", bg: "info" });

    useEffect(() => {
        if (user?.id) {
            fetchStats();
            fetchSuggestions();
            fetchInvitations();
            fetchRecentConnections();
        }
    }, [user?.id]);

    const fetchStats = async () => {
        try {
            const res = await api.get(`/users/profile/${user.id}`);
            const data = res.data;
            if (data.success) {
                setStats({
                    connections: data.data.connections || 0,
                    profileViews: data.data.profileViews || 0,
                    posts: data.data._count?.posts || 0
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchRecentConnections = async () => {
        try {
            const res = await api.get(`/users/network/accepted/${user.id}`);
            const data = res.data;
            if (data.success) setRecentConnections(data.data);
        } catch (error) {
            console.error("Error fetching recent connections:", error);
        }
    };

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/users/network/suggestions/${user.id}`);
            const data = res.data;
            if (data.success) setProfiles(data.data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInvitations = async () => {
        try {
            const res = await api.get(`/users/network/pending/${user.id}`);
            const data = res.data;
            if (data.success) setInvitations(data.data);
        } catch (error) {
            console.error("Error fetching invitations:", error);
        }
    };

    const showToast = (message, bg = "info") => {
        setToast({ show: true, message, bg });
        setTimeout(() => setToast({ show: false, message: "", bg: "info" }), 3000);
    };

    const handleConnect = async (receiverId) => {
        if (!user?.id) {
            showToast("Please login to connect", "warning");
            return;
        }

        setPendingConnecting(prev => [...prev, receiverId]);

        try {
            const res = await api.post("/users/network/request", { senderId: user.id, receiverId });
            const data = res.data;
            if (data.success) {
                showToast("✅ Connection request sent!", "success");
            } else {
                showToast(`❌ ${data.message || "Failed to send request"}`, "danger");
                setPendingConnecting(prev => prev.filter(id => id !== receiverId));
            }
        } catch (error) {
            showToast("❌ Network error", "danger");
            setPendingConnecting(prev => prev.filter(id => id !== receiverId));
        }
    };

    const handleAcceptRequest = async (requestId, status) => {
        try {
            const res = await api.post("/users/network/handle", { requestId, status });
            const data = res.data;
            if (data.success) {
                showToast("✅ Request accepted!", "success");
                setInvitations(prev => prev.filter(inv => inv.id !== requestId));
                fetchStats(); // Update connection count
                fetchRecentConnections(); // Refresh the connections list
            }
        } catch (error) {
            console.error("Error handling request:", error);
        }
    };




    return (
        <div
            className="container-fluid py-4"
            style={{
                backgroundColor: COLORS.background,
                minHeight: "100vh",
                overflow: "hidden",
            }}
        >
            <div className="row g-4" style={{ height: "calc(100vh - 40px)" }}>
                {/* -------- LEFT SIDEBAR -------- */}
                <div
                    className="col-lg-3"
                    style={{
                        height: "100%",
                        overflow: "hidden",
                        position: "sticky",
                        top: "0",
                    }}
                >
                    <div
                        className="card border-0 shadow-sm mb-4"
                        style={{
                            borderRadius: "16px",
                            backgroundColor: COLORS.card,
                            color: COLORS.textDark,
                        }}
                    >
                        <div
                            style={{
                                height: "80px",
                                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                                borderTopLeftRadius: "16px",
                                borderTopRightRadius: "16px",
                            }}
                        ></div>

                        <div className="text-center position-relative" style={{ marginTop: "-35px" }}>
                            {isLoading ? (
                                <>
                                    <div className="skeleton skeleton-pulse mx-auto" style={{ width: "70px", height: "70px", borderRadius: "50%", border: "3px solid white" }}></div>
                                    <div className="skeleton skeleton-pulse skeleton-title mx-auto mt-2" style={{ width: "60%" }}></div>
                                    <div className="skeleton skeleton-pulse skeleton-text mx-auto" style={{ width: "40%", height: "10px" }}></div>
                                    <div className="skeleton skeleton-pulse skeleton-text mx-auto" style={{ width: "30%", height: "10px" }}></div>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={user?.profileImg || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || "User"}`}
                                        alt="Profile"
                                        width="70"
                                        height="70"
                                        className="rounded-circle border border-3 border-white shadow-sm"
                                    />
                                    <h6 className="fw-bold mt-2 mb-0">{user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (user?.name || "User")}</h6>
                                    <small className="text-muted d-block mb-1">
                                        {user?.headline || "Software Developer • MERN"}
                                    </small>
                                    <div className="d-flex justify-content-center align-items-center text-muted small">
                                        <FaMapMarkerAlt className="me-1" size={12} />
                                        {user?.city && user?.country ? `${user.city}, ${user.country}` : "Gujarat, India"}
                                    </div>
                                </>
                            )}
                        </div>

                        <hr className="my-2" style={{ borderTop: `1px solid ${COLORS.border}` }} />

                        <div className="px-3 pb-3 text-center">
                            <div className="d-flex justify-content-around">
                                <div>
                                    <div className="text-muted small">Connections</div>
                                    <div className="fw-bold" style={{ color: COLORS.accent }}>{stats.connections}</div>
                                </div>
                                <div>
                                    <div className="text-muted small">Profile Views</div>
                                    <div className="fw-bold" style={{ color: COLORS.accent }}>{stats.profileViews}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="card border-0 shadow-sm"
                        style={{
                            borderRadius: "16px",
                            backgroundColor: COLORS.card,
                        }}
                    >
                        <div className="card-body">
                            <h6 className="fw-bold mb-3" style={{ color: COLORS.textDark }}>
                                Recent Connections
                            </h6>
                            {recentConnections
                                .slice(0, showAllConnections ? recentConnections.length : 3)
                                .map((conn, index) => (
                                    <div
                                        key={conn.id || index}
                                        className="d-flex align-items-center mb-3"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => navigate(`/user/profile/${conn.username}`)}
                                        title={`View ${conn.firstName}'s profile`}
                                    >
                                        <img
                                            src={conn.profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.firstName}`}
                                            alt={conn.firstName}
                                            width="40"
                                            height="40"
                                            className="rounded-circle me-2"
                                            style={{ flexShrink: 0 }}
                                        />
                                        <div>
                                            <div
                                                className="fw-semibold"
                                                style={{ fontSize: "14px", color: COLORS.accent }}
                                            >
                                                {conn.firstName} {conn.lastName}
                                            </div>
                                            <small className="text-muted">Connected recently</small>
                                        </div>
                                    </div>
                                ))}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowAllConnections(true);
                                }}
                                className="small fw-semibold text-decoration-none"
                                style={{ color: COLORS.accent }}
                            >
                                View all connections →
                            </a>
                        </div>
                    </div>
                </div>

                {/* -------- CENTER SCROLLABLE SECTION -------- */}
                <div
                    className="col-lg-6"
                    style={{
                        height: "100%",
                        overflowY: "scroll",
                        paddingRight: "8px",
                        msOverflowStyle: "none", // For Internet Explorer and Edge
                        scrollbarWidth: "none",  // For Firefox
                    }}

                >
                    <div
                        className="d-flex justify-content-between align-items-center mb-3"
                        style={{
                            borderBottom: `2px solid ${COLORS.border}`,
                            paddingBottom: "6px",
                            position: "sticky",
                            top: 0,
                            backgroundColor: COLORS.background,
                            zIndex: 10,
                        }}
                    >
                        <h5 className="fw-bold mb-0" style={{ color: COLORS.textDark }}>
                            People you may know
                        </h5>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setViewAllPeople(true);
                            }}
                            style={{ color: COLORS.accent, fontSize: "14px" }}
                        >
                            View All
                        </a>
                    </div>

                    <div className="row g-3 pb-5">
                        {isLoading ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div className="col-md-4" key={i}>
                                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
                                        <div className="skeleton skeleton-pulse skeleton-circle mx-auto mb-3" style={{ width: "80px", height: "80px" }}></div>
                                        <div className="skeleton skeleton-pulse skeleton-title mx-auto mb-2" style={{ width: "70%" }}></div>
                                        <div className="skeleton skeleton-pulse skeleton-text mx-auto" style={{ width: "50%", height: "10px" }}></div>
                                        <div className="skeleton skeleton-pulse skeleton-text mx-auto mb-3" style={{ width: "40%", height: "10px" }}></div>
                                        <div className="d-flex gap-2">
                                            <div className="skeleton skeleton-pulse skeleton-btn flex-grow-1" style={{ height: "35px" }}></div>
                                            <div className="skeleton skeleton-pulse skeleton-btn flex-grow-1" style={{ height: "35px" }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : profiles
                            .slice(0, viewAllPeople ? profiles.length : 6)
                            .map((person, index) => (
                                <div className="col-md-4" key={person.id}>
                                    <div
                                        className="card border-0 shadow-sm overflow-hidden"
                                        style={{
                                            borderRadius: "14px",
                                            transition: "0.3s",
                                            cursor: "pointer",
                                            backgroundColor: COLORS.card,
                                        }}
                                        onMouseOver={(e) =>
                                            (e.currentTarget.style.transform = "translateY(-5px)")
                                        }
                                        onMouseOut={(e) =>
                                            (e.currentTarget.style.transform = "translateY(0)")
                                        }
                                    >
                                        <div className="text-center p-3" style={{ marginTop: "10px" }}>
                                            <div className="d-flex justify-content-center">
                                                <img
                                                    src={person.profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.firstName}`}
                                                    alt={person.firstName}
                                                    width="80"
                                                    height="80"
                                                    className="rounded-circle border border-3 border-white shadow-sm mb-2"
                                                />
                                            </div>

                                            <h6
                                                className="fw-semibold mb-0"
                                                style={{ color: COLORS.textDark, fontSize: "15px" }}
                                            >
                                                {person.firstName} {person.lastName}
                                            </h6>
                                            <small className="text-muted d-block">{person.headline || "ConnectiFy User"}</small>
                                            <small className="text-muted d-block mb-3">
                                                <FaMapMarkerAlt className="me-1" size={11} />
                                                {person.city || person.country || "Somewhere"}
                                            </small>

                                            <div
                                                className="d-flex justify-content-between align-items-center"
                                                style={{ gap: "8px" }}
                                            >
                                                {pendingConnecting.includes(person.id) ? (
                                                    <button
                                                        className="btn fw-semibold"
                                                        disabled
                                                        style={{
                                                            flex: "1",
                                                            borderRadius: "25px",
                                                            backgroundColor: "#ccc",
                                                            color: "#555",
                                                            fontSize: "14px",
                                                            padding: "6px 0",
                                                            cursor: "not-allowed",
                                                        }}
                                                    >
                                                        <FaClock className="me-1" /> Pending
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn fw-semibold"
                                                        style={{
                                                            flex: "1",
                                                            borderRadius: "25px",
                                                            border: `1px solid ${COLORS.accent}`,
                                                            color: COLORS.accent,
                                                            background: "transparent",
                                                            transition: "0.3s",
                                                            fontSize: "14px",
                                                            padding: "6px 0",
                                                        }}
                                                        onClick={() => handleConnect(person.id)}
                                                        onMouseOver={(e) => {
                                                            e.target.style.background = COLORS.accent;
                                                            e.target.style.color = "#fff";
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.background = "transparent";
                                                            e.target.style.color = COLORS.accent;
                                                        }}
                                                    >
                                                        <FaUserPlus className="me-1" /> Connect
                                                    </button>
                                                )}

                                                <button
                                                    className="btn fw-semibold text-white d-flex align-items-center justify-content-center"
                                                    onClick={() => navigate("/user/messages", { state: { recipientId: person.id, recipientName: `${person.firstName} ${person.lastName}` } })}
                                                    style={{
                                                        flex: "1",
                                                        borderRadius: "25px",
                                                        backgroundColor: COLORS.primary,
                                                        border: `1px solid ${COLORS.primary}`,
                                                        transition: "0.3s",
                                                        fontSize: "14px",
                                                        padding: "6px 0",
                                                    }}
                                                    onMouseOver={(e) =>
                                                        (e.currentTarget.style.backgroundColor = COLORS.accent)
                                                    }
                                                    onMouseOut={(e) =>
                                                        (e.currentTarget.style.backgroundColor = COLORS.primary)
                                                    }
                                                >
                                                    <FaEnvelope className="me-1" /> Message
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* -------- RIGHT SIDEBAR -------- */}
                <div
                    className="col-lg-3"
                    style={{
                        height: "100%",
                        overflow: "hidden",
                        position: "sticky",
                        top: "0",
                    }}
                >
                    <div
                        className="card border-0 shadow-sm mb-3"
                        style={{
                            borderRadius: "16px",
                            backgroundColor: COLORS.card,
                        }}
                    >
                        <div className="card-body">
                            <h6 className="fw-bold mb-3" style={{ color: COLORS.textDark }}>
                                Invitations
                            </h6>
                            {invitations.length === 0 ? (
                                <p className="text-muted text-center mb-0">
                                    No invitations found
                                </p>
                            ) : (
                                invitations.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="d-flex align-items-center justify-content-between mb-3"
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <img
                                                src={invite.sender?.profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${invite.sender?.firstName}`}
                                                alt="invite"
                                                className="rounded-circle"
                                                width="40"
                                                height="40"
                                            />
                                            <div>
                                                <h6 className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
                                                    {invite.sender?.firstName} {invite.sender?.lastName}
                                                </h6>
                                                <small className="text-muted">
                                                    {invite.sender?.role || invite.sender?.headline || "Wants to connect"}
                                                </small>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm text-white"
                                                style={{ backgroundColor: COLORS.accent }}
                                                onClick={() => handleAcceptRequest(invite.id, "ACCEPTED")}
                                            >
                                                Accept
                                            </button>

                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleAcceptRequest(invite.id, "REJECTED")}
                                            >
                                                Ignore
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                            <a
                                href="#"
                                className="small text-decoration-none fw-semibold"
                                style={{ color: COLORS.accent }}
                            >
                                See all invitations →
                            </a>
                        </div>
                    </div>

                    <div
                        className="card border-0 shadow-sm"
                        style={{
                            borderRadius: "16px",
                            backgroundColor: COLORS.card,
                        }}
                    >
                        <div className="card-body text-center">
                            <FaUserFriends size={34} color={COLORS.primary} className="mb-2" />
                            <h6 className="fw-bold mb-1" style={{ color: COLORS.textDark }}>
                                Your Network Growth
                            </h6>
                            <p className="small text-muted mb-2">
                                You have <b>{stats.connections}</b> connections!
                                Keep building your network.
                            </p>
                            <button
                                className="btn btn-sm fw-semibold"
                                onClick={() => setShowInsights(true)}
                                style={{
                                    backgroundColor: COLORS.primary,
                                    color: "#fff",
                                    borderRadius: "25px",
                                    border: "none",
                                    padding: "6px 14px",
                                }}
                            >
                                View Insights
                            </button>
                            {showInsights && (
                                <div
                                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                                    style={{
                                        background: "rgba(0, 0, 0, 0.4)",
                                        zIndex: 1050, // Higher than sticky headers
                                        backdropFilter: "blur(8px)", // Glassmorphism effect
                                        animation: "fadeIn 0.3s ease-in-out"
                                    }}
                                    onClick={() => setShowInsights(false)} // Close on background click
                                >
                                    <div
                                        className="bg-white rounded-5 shadow-lg position-relative overflow-hidden"
                                        style={{
                                            width: "650px",
                                            maxHeight: "90vh",
                                            overflowY: "auto",
                                            border: "1px solid rgba(255, 255, 255, 0.5)",
                                            animation: "slideUp 0.4s ease-out"
                                        }}
                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                                    >

                                        {/* HEADER */}
                                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                                            <div>
                                                <h5 className="fw-bold mb-0 text-dark">Profile Analytics</h5>
                                                <small className="text-muted">Real-time performance metrics</small>
                                            </div>
                                            <button
                                                onClick={() => setShowInsights(false)}
                                                className="btn btn-light btn-sm rounded-circle p-2 shadow-sm"
                                            >
                                                <FaTimesCircle size={20} color={COLORS.textLight} />
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            {/* Key Stats Grid */}
                                            <div className="row g-3 mb-4">
                                                {[
                                                    { label: "Profile Views", value: stats.profileViews, growth: "+0%", color: "#EFF6FF", text: "#1D4ED8", icon: "👁️" },
                                                    { label: "Post Impressions", value: stats.posts * 10, growth: "+0%", color: "#F3E8FF", text: "#7E22CE", icon: "📊" },
                                                    { label: "Connections", value: stats.connections, growth: "+0%", color: "#FFFBEB", text: "#B45309", icon: "🤝" },
                                                    { label: "Posts", value: stats.posts, growth: "+0%", color: "#ECFDF5", text: "#047857", icon: "✍️" },
                                                ].map((stat, i) => (
                                                    <div className="col-6" key={i}>
                                                        <div className="p-3 rounded-4 h-100 position-relative overflow-hidden" style={{ backgroundColor: stat.color, transition: "transform 0.2s" }}
                                                            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                                                            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <small className="fw-bold text-muted text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>{stat.label}</small>
                                                                <span style={{ fontSize: "14px" }}>{stat.icon}</span>
                                                            </div>
                                                            <div className="d-flex align-items-baseline gap-2">
                                                                <h3 className="fw-bold mb-0" style={{ color: stat.text }}>{stat.value}</h3>
                                                            </div>
                                                            <small className="fw-bold mt-1 d-block" style={{ color: stat.text, fontSize: "12px" }}>
                                                                <span className="badge bg-white bg-opacity-50 px-2 py-1 rounded-pill">{stat.growth}</span> vs last month
                                                            </small>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Charts Section */}
                                            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="fw-bold text-dark mb-0">Engagement Overview</h6>
                                                        <select className="form-select form-select-sm w-auto border-0 bg-light fw-bold text-muted pointer" style={{ cursor: "pointer" }}>
                                                            <option>Last 30 Days</option>
                                                            <option>Last 3 Months</option>
                                                            <option>Last Year</option>
                                                        </select>
                                                    </div>
                                                    <div style={{ height: "220px", width: "100%" }}>
                                                        <Line
                                                            data={{
                                                                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                                                                datasets: [
                                                                    {
                                                                        label: "Profile Views",
                                                                        data: [20, 45, 30, 80],
                                                                        borderColor: COLORS.primary,
                                                                        backgroundColor: "rgba(37, 99, 235, 0.1)",
                                                                        fill: true,
                                                                        tension: 0.4,
                                                                        pointRadius: 4,
                                                                        pointHoverRadius: 6
                                                                    },
                                                                    {
                                                                        label: "Connections",
                                                                        data: [5, 15, 10, 25],
                                                                        borderColor: COLORS.success,
                                                                        borderDash: [5, 5],
                                                                        tension: 0.4,
                                                                        pointRadius: 0
                                                                    },
                                                                ],
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: { position: 'top', align: 'end', labels: { boxWidth: 10, usePointStyle: true } }
                                                                },
                                                                scales: {
                                                                    x: { grid: { display: false } },
                                                                    y: { grid: { color: "#f3f4f6" }, border: { display: false } }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Top Industries Section */}
                                            <div>
                                                <h6 className="fw-bold text-dark mb-3">Who is viewing your profile?</h6>
                                                {[
                                                    { name: "Information Technology & Services", percent: 65, color: COLORS.primary },
                                                    { name: "Computer Software", percent: 20, color: COLORS.accent },
                                                    { name: "Higher Education", percent: 15, color: COLORS.textLight },
                                                ].map((ind, i) => (
                                                    <div key={i} className="mb-3">
                                                        <div className="d-flex justify-content-between small mb-1">
                                                            <span className="fw-semibold text-muted">{ind.name}</span>
                                                            <span className="fw-bold text-dark">{ind.percent}%</span>
                                                        </div>
                                                        <div className="progress rounded-pill" style={{ height: "8px", backgroundColor: "#f3f4f6" }}>
                                                            <div
                                                                className="progress-bar rounded-pill"
                                                                style={{
                                                                    width: `${ind.percent}%`,
                                                                    backgroundColor: ind.color,
                                                                    transition: "width 1s ease-in-out"
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <style>
                                        {`
                                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                                            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                                        `}
                                    </style>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* TOAST NOTIFICATIONS */}
            <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast show={toast.show} bg={toast.bg} autohide delay={3000} onClose={() => setToast({ ...toast, show: false })}>
                    <Toast.Body className={`${toast.bg === 'warning' || toast.bg === 'info' ? 'text-dark' : 'text-white'} fw-semibold`}>
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default MyNetwork;
