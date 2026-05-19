import React, { useState, useEffect, useCallback } from "react";
import {
  FiMessageSquare,
  FiUserPlus,
  FiCheck,
  FiX,
  FiClock,
  FiBell,
  FiAtSign,
  FiCpu,
  FiCheckCircle,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

const COLORS = {
  primary: "#0073b1",
  secondary: "#e8f4fb",
  textDark: "#1f1f1f",
  textLight: "#606770",
  border: "#e0e0e0",
  white: "#ffffff",
  hover: "#f7f9fa",
  bg: "#f3f2ef",
  success: "#2e7d32",
  danger: "#c62828",
};


const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const ICON_MAP = {
  REQUEST: <FiUserPlus />,
  ACCEPT: <FiCheckCircle />,
  LIKE: <FiBell />,
  COMMENT: <FiMessageSquare />,
  MENTION: <FiAtSign />,
  SYSTEM: <FiCpu />,
  ALERT: <FiBell />,
};

const TAB_TYPE_MAP = {
  requests: ["REQUEST", "ACCEPT"],
  alerts: ["LIKE", "ALERT"],
  mentions: ["MENTION", "COMMENT"],
  system: ["SYSTEM"],
};

const Notification = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/users/notifications/${user.id}`);
      const data = res.data;
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.token]);

  const socket = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    return () => {
      socket.off("new_notification");
    };
  }, [socket, user?.id]);

  const handleMarkRead = async (id) => {
    await api.patch(`/users/notifications/read/${id}`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await api.patch(`/users/notifications/read-all/${user.id}`);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id) => {
    await api.delete(`/users/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    const types = TAB_TYPE_MAP[activeTab] || [];
    return types.includes(n.type);
  });

  const getTabCount = (key) => {
    if (key === "all") return unreadCount;
    const types = TAB_TYPE_MAP[key] || [];
    return notifications.filter((n) => types.includes(n.type) && !n.isRead).length;
  };

  const tabs = [
    { key: "all", label: "All", icon: <FiBell /> },
    { key: "requests", label: "Requests", icon: <FiUserPlus /> },
    { key: "alerts", label: "Alerts", icon: <FiBell /> },
    { key: "mentions", label: "Mentions", icon: <FiAtSign /> },
    { key: "system", label: "System", icon: <FiCpu /> },
  ];

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh", padding: "50px 80px" }}>
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          border: `1px solid ${COLORS.border}`,
          padding: "30px 40px",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "15px", marginBottom: "25px" }}>
          <h3 style={{ color: COLORS.textDark, fontWeight: 600, margin: 0 }}>
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "10px",
                  background: COLORS.primary,
                  color: "#fff",
                  borderRadius: "50px",
                  padding: "2px 10px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {unreadCount} new
              </span>
            )}
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={fetchNotifications}
              title="Refresh"
              style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: COLORS.textLight, display: "flex", alignItems: "center", gap: "5px" }}
            >
              <FiRefreshCw /> Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: COLORS.primary, border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FiCheckCircle /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {tabs.map((tab) => {
            const count = getTabCount(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.icon} {tab.label}
                {count > 0 && <span className="badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="mt-3"
          >
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="notification-card" style={{ border: `1px solid ${COLORS.border}` }}>
                  <div className="notification-content">
                    <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: 48, height: 48 }} />
                    <div className="ms-3">
                      <div className="skeleton skeleton-pulse skeleton-title" style={{ width: "120px" }} />
                      <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "200px", height: "10px" }} />
                    </div>
                  </div>
                  <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "60px" }} />
                </div>
              ))
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "60px 20px", color: COLORS.textLight }}
              >
                <FiBell size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
                <p style={{ fontSize: "16px", fontWeight: 500 }}>No notifications here yet</p>
                <p style={{ fontSize: "14px" }}>When someone likes or comments on your post, you'll see it here.</p>
              </motion.div>
            ) : (
              filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  whileHover={{ backgroundColor: COLORS.hover }}
                  className="notification-card"
                  style={{
                    borderLeft: !notif.isRead ? `4px solid ${COLORS.primary}` : `4px solid transparent`,
                    backgroundColor: !notif.isRead ? "#f0f7ff" : COLORS.white,
                  }}
                >
                  <div className="notification-content">
                    {/* Avatar or Icon */}
                    {notif.senderUser?.profileImg || notif.senderCompany?.profileImg ? (
                      <img
                        src={notif.senderUser?.profileImg || notif.senderCompany?.profileImg}
                        alt={notif.senderUser?.firstName || notif.senderCompany?.companyName}
                        width={48}
                        height={48}
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : notif.senderUser ? (
                      <div className="icon-box" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, #00a8e8)`, color: "#fff", fontWeight: 700, fontSize: "18px" }}>
                        {notif.senderUser.firstName?.[0]}{notif.senderUser.lastName?.[0]}
                      </div>
                    ) : notif.senderCompany ? (
                      <div className="icon-box" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, #00a8e8)`, color: "#fff", fontWeight: 700, fontSize: "18px" }}>
                        {notif.senderCompany.companyName?.[0]}
                      </div>
                    ) : (
                      <div className="icon-box">{ICON_MAP[notif.type] || <FiBell />}</div>
                    )}
                    <div style={{ marginLeft: "12px" }}>
                      {(notif.senderUser || notif.senderCompany) && (
                        <h6 style={{ margin: 0, color: COLORS.textDark, fontWeight: 600 }}>
                          {notif.senderUser ? `${notif.senderUser.firstName} ${notif.senderUser.lastName}` : notif.senderCompany?.companyName}
                        </h6>
                      )}
                      <p style={{ margin: 0, color: COLORS.textLight, fontSize: "14px" }}>{notif.content}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <small style={{ color: COLORS.textLight, whiteSpace: "nowrap" }}>
                      <FiClock style={{ marginRight: 4 }} />{timeAgo(notif.createdAt)}
                    </small>
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        title="Mark as read"
                        style={{ background: "transparent", border: "none", color: COLORS.primary, cursor: "pointer", padding: "4px" }}
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title="Delete"
                      style={{ background: "transparent", border: "none", color: COLORS.danger, cursor: "pointer", padding: "4px" }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .tabs-container {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 20px;
          border-bottom: 1px solid ${COLORS.border};
          gap: 4px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          font-size: 15px;
          padding: 10px 18px;
          cursor: pointer;
          color: ${COLORS.textLight};
          font-weight: 500;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 4px 4px 0 0;
        }
        .tab-btn:hover { background: ${COLORS.hover}; }
        .tab-btn.active {
          color: ${COLORS.primary};
          border-bottom: 3px solid ${COLORS.primary};
          font-weight: 600;
        }
        .badge {
          background: ${COLORS.primary};
          color: white;
          border-radius: 50px;
          padding: 2px 7px;
          font-size: 11px;
          margin-left: 4px;
        }
        .notification-card {
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: 0.2s;
          cursor: default;
        }
        .notification-content {
          display: flex;
          align-items: center;
        }
        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${COLORS.secondary};
          color: ${COLORS.primary};
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .skeleton { border-radius: 4px; background: #e0e0e0; }
        .skeleton-pulse { animation: pulse 1.5s ease-in-out infinite; }
        .skeleton-circle { border-radius: 50%; }
        .skeleton-title { height: 14px; margin-bottom: 6px; }
        .skeleton-text { height: 10px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Notification;
