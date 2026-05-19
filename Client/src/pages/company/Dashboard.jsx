import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBriefcase,
    FaUsers,
    FaEye,
    FaPlus,
    FaUserCheck,
    FaChartLine,
} from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

const COLORS = {
    brandCorporate: "rgb(0, 115, 177)",
    secondary: "#e8f4fb",
    textDark: "#1f1f1f",
    textLight: "#606770",
    border: "#e0e0e0",
    white: "#ffffff",
    bg: "#f3f2ef",
};


const Dashboard = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        shortlisted: 0,
        profileViews: 0,
        profileCompleteness: 0
    });
    const [companyInfo, setCompanyInfo] = useState({
        name: "",
        industry: "",
        city: "",
        profileImg: ""
    });
    const [applicants, setApplicants] = useState([]);

    const fetchDashboardData = async () => {
        const companyId = user?.id || user?.company?.id;
        if (!companyId) return;

        setIsLoading(true);
        try {
            const res = await api.get(`/companies/stats/${companyId}`);
            const data = res.data;
            if (data.success) {
                setStats(data.data.stats);
                setApplicants(data.data.recentApplicants);
                setCompanyInfo(data.data.companyInfo);
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user?.id, user?.company?.id]);

    useEffect(() => {
        if (socket) {
            socket.on("new_application", (data) => {
                console.log("🔥 New application received:", data);
                // The global notification in App.jsx will show the toast.

                // Update Stats
                setStats(prev => ({
                    ...prev,
                    totalApplicants: prev.totalApplicants + 1
                }));

                // Add to Recent Applicants list safely
                const newApplicant = {
                    id: data.application.id,
                    name: data.applicantName,
                    role: data.jobTitle,
                    avatar: "https://randomuser.me/api/portraits/lego/1.jpg", // Placeholder
                    time: "Just now",
                    status: "Pending",
                    experience: "Recent applicant"
                };

                setApplicants(prev => [newApplicant, ...prev].slice(0, 10));
            });

            return () => socket.off("new_application");
        }
    }, [socket]);

    return (
        <div style={{ background: COLORS.bg, minHeight: "100vh", padding: "25px" }}>
            <div className="container-fluid">

                {/* PAGE TITLE */}
                <div>
                    <p style={{ color: COLORS.textLight }}>
                        Manage jobs, applicants & hiring insights
                    </p>
                </div>

                {/* STATS CARDS */}
                <div className="row g-3 mb-4">
                    {[
                        { title: "Active Jobs", value: stats.activeJobs, icon: <FaBriefcase /> },
                        { title: "Total Applicants", value: stats.totalApplicants, icon: <FaUsers /> },
                        { title: "Shortlisted", value: stats.shortlisted, icon: <FaUserCheck /> },
                        { title: "Profile Views", value: stats.profileViews, icon: <FaEye /> },
                    ].map((item, index) => (
                        <div className="col-xl-3 col-md-6" key={index}>
                            <div
                                className="p-4 rounded-4 shadow-sm h-100"
                                style={{
                                    background: COLORS.white,
                                    border: `1px solid ${COLORS.border}`,
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-1 text-muted small">{item.title}</p>
                                        {isLoading ? (
                                            <div className="skeleton skeleton-pulse skeleton-title mb-0" style={{ width: "60px" }}></div>
                                        ) : (
                                            <h4 className="fw-bold mb-0">{item.value}</h4>
                                        )}
                                    </div>
                                    <div
                                        className={isLoading ? "skeleton skeleton-pulse skeleton-circle" : ""}
                                        style={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: "50%",
                                            background: isLoading ? "transparent" : COLORS.secondary,
                                            color: COLORS.brandCorporate,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 18,
                                        }}
                                    >
                                        {!isLoading && item.icon}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* QUICK ACTIONS */}
                <div className="row g-3 mb-4">
                    <div className="col-lg-8">
                        <div
                            className="p-4 rounded-4 shadow-sm"
                            style={{
                                background: COLORS.white,
                                border: `1px solid ${COLORS.border}`,
                            }}
                        >
                            <h5 className="fw-bold mb-3">Hiring Activity</h5>

                            <div className="d-flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    className="btn px-4 py-2"
                                    style={{
                                        background: COLORS.brandCorporate,
                                        color: COLORS.white,
                                        fontWeight: 600,
                                    }}
                                    onClick={() => navigate("/company/job-posting")}
                                >
                                    <FaPlus className="me-2" />
                                    Post New Job
                                </button>

                                <button
                                    type="button"
                                    className="btn px-4 py-2"
                                    style={{
                                        background: COLORS.secondary,
                                        color: COLORS.primary,
                                        fontWeight: 600,
                                    }}
                                    onClick={() => navigate("/company/view-applicants")}
                                >
                                    <FaUsers className="me-2" />
                                    View Applicants
                                </button>

                                <button
                                    type="button"
                                    className="btn px-4 py-2"
                                    style={{
                                        background: COLORS.secondary,
                                        color: COLORS.primary,
                                        fontWeight: 600,
                                    }}
                                    onClick={() => navigate("/company/analytics")}
                                >
                                    <FaChartLine className="me-2" />
                                    Hiring Analytics
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COMPANY PROFILE SNAPSHOT */}
                    <div className="col-lg-4">
                        <div
                            className="p-4 rounded-4 shadow-sm h-100"
                            style={{
                                background: COLORS.white,
                                border: `1px solid ${COLORS.border}`,
                            }}
                        >
                            <h6 className="fw-bold mb-3">Company Profile</h6>

                            <div className="d-flex align-items-center gap-3 mb-3">
                                {isLoading ? (
                                    <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: 55, height: 55 }}></div>
                                ) : (
                                    <img
                                        src={companyInfo.profileImg || user?.profileImg || "https://cdn-icons-png.flaticon.com/512/5968/5968852.png"}
                                        alt="company"
                                        width={55}
                                        height={55}
                                        className="rounded-circle"
                                        style={{ objectFit: "cover" }}
                                    />
                                )}
                                <div>
                                    {isLoading ? (
                                        <>
                                            <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "120px" }}></div>
                                            <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "80px", height: "10px" }}></div>
                                        </>
                                    ) : (
                                        <>
                                            <h6 className="mb-0 fw-semibold">{companyInfo.name || user?.companyName || "ConnectiFy Business"}</h6>
                                            <small className="text-muted">{companyInfo.industry || user?.industry || "Tech"} • {companyInfo.city || user?.city || "Location"}</small>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="text-muted small mb-3">
                                {isLoading ? (
                                    <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "100%" }}></div>
                                ) : (
                                    <>Your profile is <strong>{stats.profileCompleteness}%</strong> complete</>
                                )}
                            </div>

                            <button
                                className={`btn w-100 ${isLoading ? "skeleton skeleton-pulse skeleton-rect" : ""}`}
                                onClick={() => navigate("/company/profile")}
                                style={isLoading ? { border: "none" } : {
                                    background: COLORS.brandCorporate,
                                    color: COLORS.white,
                                    fontWeight: 600,
                                }}
                            >
                                {!isLoading && "Complete Profile"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RECENT APPLICANTS */}
                {/* RECENT APPLICANTS – PRO VERSION */}
                <div
                    className="p-4 rounded-4 shadow-sm mt-4"
                    style={{
                        background: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                    }}
                >
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 className="fw-bold mb-0">Recent Applicants</h5>
                            <small className="text-muted">
                                Candidates who applied in last 7 days
                            </small>
                        </div>

                        <button
                            className="btn btn-sm"
                            style={{
                                background: COLORS.secondary,
                                color: COLORS.brandCorporate,
                                fontWeight: 600,
                            }}
                        >
                            View All
                        </button>
                    </div>

                    {/* Desktop Table */}
                    <div className="table-responsive d-none d-md-block">
                        <table className="table align-middle">
                            <thead>
                                <tr className="text-muted small">
                                    <th>Candidate</th>
                                    <th>Applied For</th>
                                    <th>Status</th>
                                    <th>Applied</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3].map((item) => (
                                        <tr key={item}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: 42, height: 42 }}></div>
                                                    <div>
                                                        <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "100px" }}></div>
                                                        <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "60px", height: "10px" }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "120px" }}></div></td>
                                            <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "80px" }}></div></td>
                                            <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "60px" }}></div></td>
                                            <td className="text-end">
                                                <div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "100px" }}></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : applicants.length > 0 ? (
                                    applicants.map((item, i) => (
                                        <tr key={i}>
                                            {/* Candidate */}
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <img
                                                        src={item.avatar}
                                                        alt="user"
                                                        width={42}
                                                        height={42}
                                                        className="rounded-circle"
                                                    />
                                                    <div>
                                                        <div className="fw-semibold">{item.name}</div>
                                                        <small className="text-muted">{item.experience} experience</small>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td>
                                                <span
                                                    className="px-3 py-1 rounded-pill small"
                                                    style={{
                                                        background: COLORS.secondary,
                                                        color: COLORS.brandCorporate,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {item.role}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span
                                                    className="badge px-3 py-2"
                                                    style={{
                                                        background:
                                                            item.status === "Shortlisted"
                                                                ? "#d4edda"
                                                                : item.status === "Pending"
                                                                    ? "#fff3cd"
                                                                    : "#e2e3e5",
                                                        color: "#333",
                                                    }}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* Time */}
                                            <td className="text-muted small">{item.time}</td>

                                            {/* Actions */}
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm me-2"
                                                    style={{
                                                        background: COLORS.brandCorporate,
                                                        color: COLORS.white,
                                                    }}
                                                    onClick={() => navigate("/company/view-applicants")}
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    disabled={item.status === "Shortlisted"}
                                                    onClick={() => navigate("/company/view-applicants")}
                                                >
                                                    {item.status === "Shortlisted" ? "Shortlisted" : "Shortlist"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            No recent applicants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE VIEW – CARD LAYOUT */}
                    <div className="d-md-none d-flex flex-column gap-3">
                        {isLoading ? (
                            <div className="text-center py-3 text-muted">Loading applicants...</div>
                        ) : applicants.length > 0 ? (
                            applicants.map((item, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-3"
                                    style={{
                                        border: `1px solid ${COLORS.border}`,
                                        background: COLORS.white,
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <img
                                            src={item.avatar}
                                            width={40}
                                            className="rounded-circle"
                                            alt="user"
                                        />
                                        <div>
                                            <div className="fw-semibold">{item.name}</div>
                                            <small className="text-muted">{item.role}</small>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">{item.time}</span>
                                        <span
                                            className="badge"
                                            style={{
                                                background:
                                                    item.status === "Shortlisted"
                                                        ? "#d4edda"
                                                        : "#fff3cd",
                                                color: "#333",
                                            }}
                                        >
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="d-flex gap-2 mt-3">
                                        <button
                                            className="btn btn-sm w-50"
                                            style={{
                                                background: COLORS.brandCorporate,
                                                color: COLORS.white,
                                            }}
                                            onClick={() => navigate("/company/view-applicants")}
                                        >
                                            View
                                        </button>

                                        <button
                                            className="btn btn-sm w-50 btn-outline-secondary"
                                            disabled={item.status === "Shortlisted"}
                                            onClick={() => navigate("/company/view-applicants")}
                                        >
                                            {item.status === "Shortlisted" ? "Shortlisted" : "Shortlist"}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-3 text-muted">No recent applicants found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
