import React, { useState, useRef, useEffect } from "react";
import api from "../../utils/api";
import {
  FaBell,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ================= THEME ================= */
const COLORS = {
  primary: "rgb(0, 115, 177)",
  secondary: "#e8f4fb",
  textDark: "#1f1f1f",
  textLight: "#606770",
  border: "#e0e0e0",
  white: "#ffffff",
  hover: "#f7f9fa",
  bg: "#f3f2ef",
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  /* PROFILE DROPDOWN */
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* NOTIFICATION DROPDOWN */
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifyRef = useRef(null);

  /* FETCH NOTIFICATIONS */
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/admin/notifications");
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch admin notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  /* SCROLL EFFECT */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* CLOSE DROPDOWNS ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setNotifyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header
      className={`transition-all ${isScrolled ? "shadow-sm py-2" : "py-3"}`}
      style={{
        height: isScrolled ? 70 : 85,
        backgroundColor: COLORS.white,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "fixed",
        top: 0,
        left: 84,
        right: 0,
        zIndex: 999,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* BRAND / LOGO */}
      <div className="d-flex align-items-center gap-2">
        <img src="/ConnectiFy_logo.png" alt="Logo" style={{ height: "60px" }} />
      </div>

      {/* RIGHT ACTIONS */}
      <div className="d-flex align-items-center gap-3">
        {/* NOTIFICATIONS */}
        <div ref={notifyRef} className="position-relative">
          <button
            onClick={() => setNotifyOpen(!notifyOpen)}
            className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center position-relative shadow-sm transition-all"
            style={{ width: 42, height: 42, border: "none", backgroundColor: COLORS.white }}
          >
            <FaBell color={COLORS.primary} />
            {unreadCount > 0 && (
              <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ top: "15%", left: "85%", fontSize: "9px" }}>
                {unreadCount}
              </span>
            )}
          </button>

          {notifyOpen && (
            <div
              className="position-absolute mt-3 shadow-lg border-0 rounded-4 overflow-hidden"
              style={{
                top: "100%",
                right: 0,
                width: 320,
                backgroundColor: COLORS.white,
                zIndex: 1100,
                boxShadow: "0 15px 35px rgba(0,0,0,0.15) !important"
              }}
            >
              <div className="px-3 py-3 d-flex justify-content-between align-items-center border-bottom bg-light">
                <span className="fw-bold small text-uppercase" style={{ letterSpacing: "0.5px", color: COLORS.primary }}>Recent Notifications</span>
                <span className="badge rounded-pill" style={{ backgroundColor: COLORS.primary }}>{unreadCount}</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">No new notifications</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 border-bottom hover-bg transition-all cursor-pointer ${!n.isRead ? 'bg-light' : ''}`}
                      onClick={() => { navigate("/admin/notifications"); setNotifyOpen(false); }}
                    >
                      <p className={`mb-1 small text-dark ${!n.isRead ? 'fw-bold' : 'fw-medium'}`}>{n.content}</p>
                      <span className="text-primary small fw-bold" style={{ fontSize: "10px", color: COLORS.primary }}>View Details →</span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 text-center bg-light">
                <button className="btn btn-link btn-sm text-decoration-none fw-bold" style={{ fontSize: "11px", color: COLORS.primary }} onClick={() => navigate("/admin/notifications")}>View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div ref={profileRef} className="position-relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="btn d-flex align-items-center gap-2 p-1 pe-3 rounded-pill bg-white shadow-sm border"
            style={{ transition: "all 0.2s" }}
          >
            <img
              src={user?.admin?.avatar || `https://ui-avatars.com/api/?name=Admin&background=0073B1&color=fff`}
              alt="Admin"
              className="rounded-circle border border-2"
              style={{ width: 36, height: 36, borderColor: COLORS.primary }}
            />
            <div className="text-start d-none d-lg-block">
              <p className="mb-0 fw-bold small text-dark leading-tight">{user?.admin?.name || "System Admin"}</p>
              <span className="text-muted" style={{ fontSize: "10px" }}>Super Admin</span>
            </div>
            <FaChevronDown size={10} className="text-muted ms-1" />
          </button>

          {profileOpen && (
            <div
              className="position-absolute mt-3 shadow-lg border-0 rounded-4 overflow-hidden"
              style={{
                top: "100%",
                right: 0,
                width: 200,
                backgroundColor: COLORS.white,
                zIndex: 1100,
                boxShadow: "0 15px 35px rgba(0,0,0,0.1) !important"
              }}
            >
              <div className="p-3 border-bottom bg-light">
                <p className="mb-0 fw-bold small text-dark">My Account</p>
                <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>admin@connectify.com</p>
              </div>
              <DropdownItem icon={<FaUser />} label="Profile" onClick={() => { setProfileOpen(false); navigate("/admin/profile"); }} />
              <DropdownItem icon={<FaCog />} label="Settings" onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }} />
              <div className="border-top">
                <DropdownItem icon={<FaSignOutAlt />} label="Logout" danger onClick={logout} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-bg:hover { background-color: #f8f9fa; }
        .cursor-pointer { cursor: pointer; }
        .leading-tight { line-height: 1.2; }
      `}</style>
    </header>
  );
}

/* ================= DROPDOWN ITEM ================= */
const DropdownItem = ({ icon, label, onClick, danger }) => (
  <div
    onClick={onClick}
    className={`d-flex align-items-center gap-3 px-3 py-2 cursor-pointer transition-all ${danger ? "text-danger" : "text-dark"}`}
    style={{ fontWeight: 600, fontSize: "13px" }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f7ff")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  >
    <span className={danger ? "text-danger" : "text-primary"} style={{ color: danger ? "" : "rgb(0, 115, 177)" }}>{icon}</span>
    {label}
  </div>
);
