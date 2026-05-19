import React from "react";
import { motion } from "framer-motion";
import { FiEye, FiBarChart2, FiUsers, FiEdit3 } from "react-icons/fi";

const COLORS = {
    bg: "#ffffff",
    card: "#f8f9fa",
    border: "#e5e7eb",
    brandCorporate: "rgb(0, 115, 177)",
    secondary: "#e0f2fe",
    text: "#1e293b",
    textMuted: "#64748b",
    success: "#10b981",
    warning: "#f59e0b",
};

const MetricCard = ({ icon: Icon, label, value, trend, color }) => (
    <motion.div
        whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        style={{
            background: COLORS.card,
            backdropFilter: "blur(12px)",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            transition: "0.3s ease",
        }}
    >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
                style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: `filter(drop-shadow(0 0 8px ${color}))`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: color === COLORS.secondary ? COLORS.brandCorporate : color,
                    fontSize: "20px",
                    backgroundColor: color === COLORS.secondary ? `${COLORS.brandCorporate}15` : `${color}15`,
                }}
            >
                <Icon />
            </div>
            <div style={{ color: COLORS.success, fontSize: "12px", fontWeight: 600 }}>
                {trend}
            </div>
        </div>

        <div>
            <div style={{ fontSize: "13px", color: COLORS.textMuted, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: "24px", color: COLORS.text, fontWeight: 700, marginTop: "4px" }}>{value}</div>
        </div>

        <div style={{ height: "2px", width: "100%", background: `linear-gradient(90deg, ${color}40, transparent)`, borderRadius: "1px" }} />
    </motion.div>
);

const EngagementOverview = ({ stats }) => {
    const { profileViews = 0, connections = 0, posts = 0 } = stats || {};

    // Dummy logic for impressions (stats usually come from post analytics)
    const postImpressions = posts * 10;

    const metrics = [
        {
            icon: FiEye,
            label: "Profile Views",
            value: profileViews,
            trend: stats?.trend || "+12% vs last month",
            color: COLORS.brandCorporate,
        },
        {
            icon: FiBarChart2,
            label: "Post Impressions",
            value: postImpressions,
            trend: "+5% vs last month",
            color: COLORS.secondary,
        },
        {
            icon: FiUsers,
            label: "Connections",
            value: connections,
            trend: "+3% vs last month",
            color: COLORS.success,
        },
        {
            icon: FiEdit3,
            label: "Posts",
            value: posts,
            trend: "+2% vs last month",
            color: COLORS.warning,
        },
    ];

    return (
        <div
            style={{
                padding: "25px",
                background: COLORS.bg,
                borderRadius: "24px",
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                marginTop: "30px",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h5 style={{ color: COLORS.text, margin: 0, fontWeight: 700 }}>Real-time performance metrics</h5>
                    <p style={{ color: COLORS.textMuted, fontSize: "13px", margin: "2px 0 0 0" }}>Overview of your recent engagement across the platform</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.success, animation: "pulse 2s infinite" }} />
                    <span style={{ color: COLORS.success, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Live Insight</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {metrics.map((m, i) => (
                    <MetricCard key={i} {...m} />
                ))}
            </div>
        </div>
    );
};

export default EngagementOverview;
