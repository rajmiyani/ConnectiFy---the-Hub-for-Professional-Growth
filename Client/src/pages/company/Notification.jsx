import React, { useState, useEffect } from "react";
import {
  FiMessageSquare,
  FiUserPlus,
  FiCheck,
  FiX,
  FiClock,
  FiBell,
  FiAtSign,
  FiCpu,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
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
};

const Notification = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("alerts");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/companies/notifications/${user.id}`);
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/companies/notifications/read/${id}`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/companies/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const tabs = [
    { key: "alerts", label: "Alerts", icon: <FiBell />, types: ["ALERT", "SYSTEM"] },
    { key: "requests", label: "Requests", icon: <FiUserPlus />, types: ["REQUEST"] },
    { key: "mentions", label: "Mentions", icon: <FiAtSign />, types: ["MENTION", "COMMENT"] },
    { key: "messages", label: "Messages", icon: <FiMessageSquare />, types: ["MESSAGE"] },
  ];

  const filteredNotifications = notifications.filter(n => {
    const activeTabData = tabs.find(t => t.key === activeTab);
    return activeTabData?.types.includes(n.type);
  });

  const getIcon = (type) => {
    switch (type) {
      case "ALERT": return <FiBell />;
      case "SYSTEM": return <FiCpu />;
      case "REQUEST": return <FiUserPlus />;
      case "MENTION": return <FiAtSign />;
      case "COMMENT": return <FiAtSign />;
      case "MESSAGE": return <FiMessageSquare />;
      default: return <FiBell />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.bg,
        minHeight: "100vh",
        padding: "50px 80px",
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          border: `1px solid ${COLORS.border}`,
          padding: "30px 40px",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <h3 className="mb-0 fw-bold">Notifications</h3>
          <button
            className="btn btn-sm text-primary fw-bold"
            onClick={fetchNotifications}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="tabs-container">
          {tabs.map((tab) => {
            const count = notifications.filter(n => !n.isRead && tab.types.includes(n.type)).length;
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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FiBell size={40} className="mb-3 opacity-25" />
                <p>No notifications in this category.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                >
                  <div className="notification-content">
                    <div className="icon-box">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <h6 className="mb-1">{n.senderUser?.firstName ? `${n.senderUser.firstName} ${n.senderUser.lastName}` : (n.senderCompany?.companyName || "System")}</h6>
                      <p className="small mb-1">{n.content}</p>
                      <small className="text-muted"><FiClock /> {formatTime(n.createdAt)}</small>
                    </div>
                  </div>
                  <div className="action-buttons">
                    {!n.isRead && (
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} title="Mark as read">
                        <FiCheck />
                      </button>
                    )}
                    <button className="btn-icon text-danger" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} title="Delete">
                      <FiX />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .tabs-container { display: flex; gap: 20px; margin-bottom: 25px; border-bottom: 1px solid ${COLORS.border}; }
        .tab-btn { background: transparent; border: none; padding: 12px 10px; cursor: pointer; color: ${COLORS.textLight}; font-weight: 500; transition: 0.3s; display: flex; align-items: center; gap: 8px; position: relative; }
        .tab-btn.active { color: ${COLORS.primary}; border-bottom: 3px solid ${COLORS.primary}; font-weight: 600; }
        .badge { background: ${COLORS.primary}; color: white; border-radius: 50%; padding: 2px 6px; font-size: 10px; }
        .notification-card { background: white; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 15px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
        .notification-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .notification-card.unread { border-left: 4px solid ${COLORS.primary}; background: #f0f7ff; }
        .notification-content { display: flex; align-items: center; gap: 15px; }
        .icon-box { width: 45px; height: 45px; border-radius: 50%; background: ${COLORS.secondary}; color: ${COLORS.primary}; display: flex; justify-content: center; align-items: center; font-size: 18px; }
        .action-buttons { display: flex; gap: 10px; }
        .btn-icon { background: transparent; border: none; color: ${COLORS.textLight}; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; transition: 0.2s; }
        .btn-icon:hover { background: rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
};

export default Notification;
