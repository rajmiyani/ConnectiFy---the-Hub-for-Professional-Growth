import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
    FaUserPlus,
    FaEnvelope,
    FaMapMarkerAlt,
    FaUserFriends,
} from "react-icons/fa";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const COLORS = {
    primary: "#0073b1",
    accent: "#0096C7",
    background: "#F4F7FB",
    card: "#FFFFFF",
    textDark: "#1E1E1E",
    border: "#E0E0E0",
};

const MyNetwork = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [recentConnections, setRecentConnections] = useState([]);
    const [insights, setInsights] = useState([]);

    const [showAllConnections, setShowAllConnections] = useState(false);
    const [viewAllPeople, setViewAllPeople] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [pendingConnections, setPendingConnections] = useState([]);

    const fetchData = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [networkRes, insightsRes] = await Promise.all([
                api.get(`/companies/network/${user.id}`),
                api.get(`/companies/network/insights/${user.id}`)
            ]);

            if (networkRes.data.success) {
                setSuggestions(networkRes.data.data.suggestions);
                setRecentConnections(networkRes.data.data.recentConnections);
            }
            if (insightsRes.data.success) {
                setInsights(insightsRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching network data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    const handleConnect = (userId) => {
        setPendingConnections(prev => [...prev, userId]);
        // Placeholder for follow/request API
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
                            <img
                                src={user?.profileImg || `https://ui-avatars.com/api/?name=${user?.companyName || 'C'}&background=0073B1&color=fff`}
                                alt="Profile"
                                width="70"
                                height="70"
                                className="rounded-circle border border-3 border-white shadow-sm"
                                style={{ objectFit: "cover" }}
                            />
                            <h6 className="fw-bold mt-2 mb-0">{user?.companyName}</h6>
                            <small className="text-muted d-block mb-1">
                                {user?.industry} • {user?.companySize || "Company"}
                            </small>
                            <div className="d-flex justify-content-center align-items-center text-muted small">
                                <FaMapMarkerAlt className="me-1" size={12} />
                                {user?.city}, {user?.state}
                            </div>
                        </div>

                        <hr className="my-2" style={{ borderTop: `1px solid ${COLORS.border}` }} />

                        <div className="px-3 pb-3 text-center">
                            <div className="d-flex justify-content-around">
                                <div>
                                    <div className="text-muted small">Network</div>
                                    <div className="fw-bold" style={{ color: COLORS.accent }}>{recentConnections.length}</div>
                                </div>
                                <div>
                                    <div className="text-muted small">Insights</div>
                                    <div className="fw-bold" style={{ color: COLORS.accent }}>Trending</div>
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
                            {recentConnections.length === 0 ? (
                                <p className="text-center text-muted small mb-0">No recent connections</p>
                            ) : (
                                recentConnections
                                    .slice(0, showAllConnections ? recentConnections.length : 3)
                                    .map((conn, index) => (
                                        <div key={conn.id} className="d-flex align-items-center mb-3">
                                            <img
                                                src={conn.image || `https://ui-avatars.com/api/?name=${conn.name}&background=random`}
                                                alt={conn.name}
                                                width="40"
                                                height="40"
                                                className="rounded-circle me-2"
                                                style={{ objectFit: "cover" }}
                                            />
                                            <div style={{ minWidth: 0 }}>
                                                <div className="fw-semibold text-truncate" style={{ fontSize: "14px" }}>
                                                    {conn.name}
                                                </div>
                                                <small className="text-muted d-block text-truncate">{conn.role}</small>
                                            </div>
                                        </div>
                                    ))
                            )}
                            {recentConnections.length > 3 && !showAllConnections && (
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
                            )}
                        </div>
                    </div>
                </div>

                {/* -------- CENTER SCROLLABLE SECTION -------- */}
                <div
                    className="col-lg-6"
                    style={{
                        height: "100%",
                        overflowY: "auto",
                        paddingRight: "8px",
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
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
                            Recommended for you
                        </h5>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setViewAllPeople(!viewAllPeople);
                            }}
                            style={{ color: COLORS.accent, fontSize: "14px" }}
                        >
                            {viewAllPeople ? "Show Less" : "View All"}
                        </a>
                    </div>

                    <div className="row g-3 pb-5">
                        {isLoading ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div className="col-md-4" key={i}>
                                    <div className="card border-0 shadow-sm p-3 text-center" style={{ borderRadius: "14px", height: "180px" }}>
                                        <div className="skeleton mb-3 mx-auto rounded-circle" style={{ width: 80, height: 80 }}></div>
                                        <div className="skeleton mb-2 mx-auto" style={{ width: "60%", height: 15 }}></div>
                                        <div className="skeleton mx-auto" style={{ width: "40%", height: 10 }}></div>
                                    </div>
                                </div>
                            ))
                        ) : suggestions.length === 0 ? (
                            <div className="text-center p-5 text-muted">No suggestions available at the moment.</div>
                        ) : (
                            suggestions
                                .slice(0, viewAllPeople ? suggestions.length : 6)
                                .map((person) => (
                                    <div className="col-md-4" key={person.id}>
                                        <div
                                            className="card border-0 shadow-sm overflow-hidden h-100"
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
                                                        src={person.profileImg || `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=random`}
                                                        alt={person.firstName}
                                                        width="80"
                                                        height="80"
                                                        className="rounded-circle border border-3 border-white shadow-sm mb-2"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </div>

                                                <h6
                                                    className="fw-semibold mb-0 text-truncate"
                                                    style={{ color: COLORS.textDark, fontSize: "15px" }}
                                                >
                                                    {person.firstName} {person.lastName}
                                                </h6>
                                                <small className="text-muted d-block text-truncate">{person.headline}</small>
                                                <small className="text-muted d-block mb-3 text-truncate">
                                                    <FaMapMarkerAlt className="me-1" size={11} />
                                                    {person.city || "India"}
                                                </small>

                                                <div
                                                    className="d-flex justify-content-between align-items-center"
                                                    style={{ gap: "8px" }}
                                                >
                                                    {pendingConnections.includes(person.id) ? (
                                                        <button
                                                            className="btn fw-semibold btn-sm"
                                                            disabled
                                                            style={{
                                                                flex: "1",
                                                                borderRadius: "25px",
                                                                backgroundColor: "#ccc",
                                                                color: "#555",
                                                                fontSize: "12px",
                                                                cursor: "not-allowed",
                                                            }}
                                                        >
                                                            Pending
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn fw-semibold btn-sm"
                                                            style={{
                                                                flex: "1",
                                                                borderRadius: "25px",
                                                                border: `1px solid ${COLORS.accent}`,
                                                                color: COLORS.accent,
                                                                background: "transparent",
                                                                transition: "0.3s",
                                                                fontSize: "12px",
                                                            }}
                                                            onClick={() => handleConnect(person.id)}
                                                        >
                                                            <FaUserPlus className="me-1" />
                                                            Connect
                                                        </button>
                                                    )}

                                                    <button
                                                        className="btn fw-semibold text-white btn-sm"
                                                        style={{
                                                            flex: "1",
                                                            borderRadius: "25px",
                                                            backgroundColor: COLORS.primary,
                                                            border: `1px solid ${COLORS.primary}`,
                                                            transition: "0.3s",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        <FaEnvelope className="me-1" />
                                                        Message
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
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
                                Track your platform influence and candidate reach.
                            </p>
                            <button
                                className="btn btn-sm fw-semibold"
                                onClick={() => setShowInsights(!showInsights)}
                                style={{
                                    backgroundColor: COLORS.primary,
                                    color: "#fff",
                                    borderRadius: "25px",
                                    border: "none",
                                    padding: "6px 14px",
                                }}
                            >
                                {showInsights ? "Hide Insights" : "View Insights"}
                            </button>

                            {showInsights && (
                                <div className="mt-4" style={{ height: "200px", width: "100%" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={insights}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="week" hide={false} fontSize={10} />
                                            <YAxis fontSize={10} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="connections"
                                                stroke={COLORS.primary}
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .skeleton {
                    background: #eee;
                    background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
                    border-radius: 5px;
                    background-size: 200% 100%;
                    animation: 1.5s shine linear infinite;
                }
                @keyframes shine {
                    to {
                        background-position-x: -200%;
                    }
                }
                *::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default MyNetwork;
