import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    FaUsers,
    FaBuilding,
    FaBriefcase,
    FaUserPlus,
    FaComments,
    FaChartPie,
    FaFileCsv,
    FaFilePdf,
} from "react-icons/fa";

/* ================= THEME ================= */
const COLORS = {
    primary: "rgb(0, 115, 177)",
    secondary: "#e8f4fb",
    white: "#ffffff",
    border: "#e5e9f2",
    textDark: "#1f1f1f",
    textLight: "#606770",
};

/* ================= DATA ================= */
const DATA_7_DAYS = [
    { label: "Day 1", users: 120 },
    { label: "Day 2", users: 190 },
    { label: "Day 3", users: 260 },
    { label: "Day 4", users: 310 },
    { label: "Day 5", users: 380 },
    { label: "Day 6", users: 460 },
    { label: "Day 7", users: 520 },
];

const DATA_30_DAYS = [
    { label: "Week 1", users: 850 },
    { label: "Week 2", users: 1400 },
    { label: "Week 3", users: 2150 },
    { label: "Week 4", users: 2900 },
];

const DATA_90_DAYS = [
    { label: "Jan", users: 3200 },
    { label: "Feb", users: 5100 },
    { label: "Mar", users: 7800 },
];

const jobPosts = [
    { day: "Mon", jobs: 45 },
    { day: "Tue", jobs: 60 },
    { day: "Wed", jobs: 55 },
    { day: "Thu", jobs: 80 },
    { day: "Fri", jobs: 70 },
];

const engagement = [
    { month: "Jan", applications: 320, messages: 180 },
    { month: "Feb", applications: 520, messages: 310 },
    { month: "Mar", applications: 740, messages: 490 },
    { month: "Apr", applications: 980, messages: 620 },
];

const companyActivity = [
    { name: "Active", value: 65 },
    { name: "Inactive", value: 20 },
    { name: "New", value: 15 },
];

const PIE_COLORS = ["rgb(0, 115, 177)", "#cfd8dc", "#90caf9"];

/* ================= STAT CARD ================= */
const StatCard = ({ icon, label, value, isLoading }) => (
    <div
        className="p-4 rounded-4 h-100 transition-all stat-card"
        style={{
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
        }}
    >
        <div className="d-flex justify-content-between align-items-start">
            <div>
                <p className="text-muted small fw-bold text-uppercase mb-2" style={{ letterSpacing: "0.5px" }}>{label}</p>
                {isLoading ? (
                    <div className="skeleton skeleton-pulse skeleton-title" style={{ width: "80px", margin: 0 }}></div>
                ) : (
                    <h3 className="fw-bold mb-0" style={{ color: COLORS.textDark }}>{value}</h3>
                )}
            </div>
            {isLoading ? (
                <div className="skeleton skeleton-pulse" style={{ width: 48, height: 48, borderRadius: "14px" }}></div>
            ) : (
                <div
                    className="shadow-sm"
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: "14px",
                        background: COLORS.secondary,
                        color: COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                    }}
                >
                    {icon}
                </div>
            )}
        </div>
        <div className="mt-4 pt-2 border-top">
            {isLoading ? (
                <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "100px", margin: 0 }}></div>
            ) : (
                <>
                    <span className="text-success small fw-bold">↑ 12%</span>
                    <span className="text-muted small ms-2">vs last month</span>
                </>
            )}
        </div>
    </div>
);

/* ================= TIME FILTER ================= */
const TimeFilter = ({ active, setActive }) => {
    const options = [
        { label: "7D", value: "7" },
        { label: "30D", value: "30" },
        { label: "90D", value: "90" },
    ];

    return (
        <div
            className="d-flex align-items-center bg-white rounded-pill p-1 border shadow-sm"
        >
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setActive(opt.value)}
                    className="btn btn-sm rounded-pill px-3 fw-bold transition-all border-0"
                    style={{
                        background: active === opt.value ? COLORS.primary : "transparent",
                        color: active === opt.value ? COLORS.white : COLORS.textLight,
                        fontSize: "12px"
                    }}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

/* ================= MAIN ================= */
export default function AdminDashboard() {
    const socket = useSocket();
    const { user } = useAuth();
    const [range, setRange] = useState("7");
    const [isLoading, setIsLoading] = useState(true);
    const [activityData, setActivityData] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        activeJobs: 0,
        signupsToday: 0
    });

    const fetchStats = async () => {
        try {
            const response = await api.get("/admin/stats");
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            const response = await api.get(`/admin/activity?range=${range}`);
            if (response.data.success) {
                setActivityData(response.data.activityData);
            }
        } catch (error) {
            console.error("Error fetching admin activity:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchActivity();
    }, [range]);

    useEffect(() => {
        if (socket) {
            socket.emit("join_admin");

            const handleRefresh = () => {
                console.log("🔄 Refreshing dashboard stats due to new activity...");
                fetchStats();
                fetchActivity();
            };

            socket.on("new_user_registration", handleRefresh);
            socket.on("new_company_registration", handleRefresh);
            socket.on("new_job_posted", handleRefresh);

            return () => {
                socket.off("new_user_registration", handleRefresh);
                socket.off("new_company_registration", handleRefresh);
                socket.off("new_job_posted", handleRefresh);
            };
        }
    }, [socket]);

    const userGrowth = activityData.length > 0 ? activityData : (range === "7" ? DATA_7_DAYS : range === "30" ? DATA_30_DAYS : DATA_90_DAYS);

    return (
        <div style={{ minHeight: "100vh", padding: "10px 20px" }}>

            {/* ===== HEADER + ACTION BAR ===== */}
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3 p-3 bg-white rounded-4 border shadow-sm">
                <div>
                    <h4 className="fw-bold mb-1" style={{ color: COLORS.textDark }}>
                        System Overview
                    </h4>
                    <p className="text-muted small mb-0">
                        Monitoring platform health, signups, and job market trends.
                    </p>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <TimeFilter active={range} setActive={setRange} />
                    <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                        <FaFileCsv /> Export Report
                    </button>
                </div>
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={<FaUsers />} label="Total Users" value={stats.totalUsers.toLocaleString()} isLoading={isLoading} />
                </div>
                <div className="col-md-3">
                    <StatCard icon={<FaBuilding />} label="Companies" value={stats.totalCompanies.toLocaleString()} isLoading={isLoading} />
                </div>
                <div className="col-md-3">
                    <StatCard icon={<FaBriefcase />} label="Active Jobs" value={stats.activeJobs.toLocaleString()} isLoading={isLoading} />
                </div>
                <div className="col-md-3">
                    <StatCard icon={<FaUserPlus />} label="Signups Today" value={stats.signupsToday.toLocaleString()} isLoading={isLoading} />
                </div>
            </div>

            {/* ===== ANALYTICS ===== */}
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="p-4 rounded-4 border bg-white shadow-sm h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-bold mb-0">User Growth Analytics</h6>
                            <span className="badge bg-primary rounded-pill px-3 py-2 fw-medium">Real-time Data</span>
                        </div>
                        {isLoading ? (
                            <div className="skeleton skeleton-pulse w-100" style={{ height: "320px", borderRadius: "12px" }}></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={userGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1} />
                                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="p-4 rounded-4 border bg-white shadow-sm h-100">
                        <h6 className="fw-bold mb-4 text-center">Company Distributions</h6>
                        {isLoading ? (
                            <>
                                <div className="skeleton skeleton-pulse mx-auto mb-4" style={{ width: "160px", height: "160px", borderRadius: "50%", display: "block" }}></div>
                                <div className="mt-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="skeleton skeleton-pulse skeleton-text mb-2"></div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={companyActivity} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={5}>
                                            {companyActivity.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4">
                                    {companyActivity.map((item, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i] }} />
                                                <span className="small text-muted">{item.name}</span>
                                            </div>
                                            <span className="small fw-bold">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="p-4 rounded-4 border bg-white shadow-sm">
                        <h6 className="fw-bold mb-4">Weekly Job Trends</h6>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={jobPosts}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="jobs" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={35} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="p-4 rounded-4 border bg-white shadow-sm">
                        <h6 className="fw-bold mb-4">Signups vs Applications</h6>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={engagement}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="applications" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="messages" stroke="#ff9100" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .stat-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.06) !important; }
                .transition-all { transition: all 0.3s ease; }
            `}</style>
        </div>
    );
}
