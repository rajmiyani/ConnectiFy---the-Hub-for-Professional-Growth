import {
    FaHome,
    FaUsers,
    FaBuilding,
    FaBriefcase,
    FaChartBar,
    FaCommentDots,
    FaCog,
    FaBell,
    FaShieldAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

/* ================= THEME ================= */
const COLORS = {
    primary: "#0073b1",
    secondary: "#e8f4fb",
    textDark: "#1f1f1f",
    textLight: "#606770",
    border: "#e0e0e0",
    white: "#ffffff",
    hover: "#f7f9fa",
};

/* ================= MENU ITEM ================= */
const MenuItem = ({ icon, label, to }) => (
    <NavLink
        to={to}
        title={label}
        className={({ isActive }) =>
            `d-flex align-items-center justify-content-center transition-all sidebar-link ${isActive ? 'active' : ''}`
        }
        style={({ isActive }) => ({
            width: 54,
            height: 54,
            borderRadius: 16,
            color: isActive ? COLORS.white : COLORS.textLight,
            backgroundColor: isActive ? COLORS.primary : "transparent",
            textDecoration: "none",
            position: "relative",
            margin: "4px 0"
        })}
    >
        <span style={{ fontSize: 20 }}>{icon}</span>
    </NavLink>
);

/* ================= SIDEBAR ================= */
export default function Sidebar() {
    const topMenu = [
        { icon: <FaHome />, label: "Dashboard", to: "/admin/dashboard" },
        { icon: <FaUsers />, label: "User Management", to: "/admin/users" },
        { icon: <FaBuilding />, label: "Company Management", to: "/admin/companies" },
        { icon: <FaBriefcase />, label: "Job Management", to: "/admin/jobs" },
        { icon: <FaShieldAlt />, label: "Content Moderation", to: "/admin/moderation" },
    ];

    const bottomMenu = [
        { icon: <FaCommentDots />, label: "Chats", to: "/admin/chats" },
        { icon: <FaBell />, label: "Notifications", to: "/admin/notifications" },
        { icon: <FaCog />, label: "Settings", to: "/admin/settings" },
    ];

    return (
        <aside
            style={{
                width: 84,
                height: "100vh",
                backgroundColor: COLORS.white,
                borderRight: `1px solid ${COLORS.border}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 0",
                position: "fixed",
                left: 0,
                top: 0,
                zIndex: 1000,
            }}
        >
            {/* TOP SECTION */}
            <div className="d-flex flex-column align-items-center gap-2">
                {/* LOGO */}
                <div className="mb-4">
                    <img
                        src="/ConnectiFy_logo.png"
                        alt="Logo"
                        style={{ height: "60px", objectFit: "contain" }}
                    />
                </div>

                {topMenu.map((item, index) => (
                    <MenuItem key={index} {...item} />
                ))}
            </div>

            {/* BOTTOM SECTION */}
            <div className="d-flex flex-column align-items-center gap-2">
                {bottomMenu.map((item, index) => (
                    <MenuItem key={index} {...item} />
                ))}
            </div>

            <style>{`
                .sidebar-link {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sidebar-link:hover:not(.active) {
                    background-color: ${COLORS.hover} !important;
                    color: ${COLORS.primary} !important;
                    transform: translateX(3px);
                }
                .sidebar-link.active {
                    box-shadow: 0 8px 15px rgba(0, 115, 177, 0.25) !important;
                }
            `}</style>
        </aside>
    );
}
