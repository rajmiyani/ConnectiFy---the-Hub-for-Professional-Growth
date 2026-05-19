import React, { useState, useEffect } from "react";
import api from "../../utils/api";
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

const Notification = () => {
  const [activeTab, setActiveTab] = useState("alerts");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/notifications");
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  const tabs = [
    { key: "alerts", label: "Alerts", icon: <FiBell />, types: ["ALERT", "LIKE", "COMMENT"] },
    { key: "requests", label: "Requests", icon: <FiUserPlus />, types: ["REQUEST", "ACCEPT"] },
    { key: "mentions", label: "Mentions", icon: <FiAtSign />, types: ["MENTION"] },
    { key: "system", label: "System", icon: <FiCpu />, types: ["SYSTEM"] },
  ];

  const filteredNotifications = notifications.filter((n) =>
    tabs.find((t) => t.key === activeTab)?.types.includes(n.type)
  );

  const renderContent = () => {
    if (isLoading) {
      return [...Array(3)].map((_, i) => (
        <div key={i} className="notification-card skeleton-card">
          <div className="skeleton-circle"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-text" style={{ width: "150px" }}></div>
            <div className="skeleton-text" style={{ width: "250px" }}></div>
          </div>
        </div>
      ));
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="empty-state">
          <FiBell size={48} />
          <p>No notifications in this category.</p>
        </div>
      );
    }

    return filteredNotifications.map((n) => (
      <motion.div
        key={n.id}
        whileHover={{ backgroundColor: COLORS.hover }}
        className={`notification-card ${n.isRead ? "read" : "unread"}`}
        onClick={() => !n.isRead && handleMarkAsRead(n.id)}
      >
        <div className="notification-content">
          <div className="icon-box">
            {n.type === "REQUEST" || n.type === "ACCEPT" ? <FiUserPlus /> :
              n.type === "MENTION" ? <FiAtSign /> :
                n.type === "SYSTEM" ? <FiCpu /> : <FiBell />}
          </div>
          <div>
            <h6>
              {n.senderUser ? `${n.senderUser.firstName} ${n.senderUser.lastName}` :
                n.senderCompany ? n.senderCompany.companyName : "System"}
            </h6>
            <p>{n.content}</p>
          </div>
        </div>
        <div className="notification-meta">
          <small><FiClock /> {getTimeAgo(n.createdAt)}</small>
          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}>
            <FiX />
          </button>
        </div>
      </motion.div>
    ));
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
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h3 className="fw-bold mb-0" style={{ color: COLORS.textDark }}>Notifications</h3>
          <button className="btn btn-link text-decoration-none p-0" style={{ color: COLORS.primary }} onClick={fetchNotifications}>
            <FiBell className="me-2" /> Refresh
          </button>
        </div>

        <div className="tabs-container">
          {tabs.map((tab) => {
            const count = notifications.filter(n => tab.types.includes(n.type) && !n.isRead).length;
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
            className="mt-3"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .tabs-container {
          display: flex;
          gap: 20px;
          margin-bottom: 25px;
          border-bottom: 1px solid ${COLORS.border};
        }
        .tab-btn {
          background: transparent;
          border: none;
          font-size: 15px;
          padding: 12px 10px;
          cursor: pointer;
          color: ${COLORS.textLight};
          font-weight: 500;
          transition: 0.2s;
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-btn.active {
          color: ${COLORS.primary};
          border-bottom: 3px solid ${COLORS.primary};
          font-weight: 600;
        }
        .badge {
          background: #ff4d4f;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          line-height: 1;
        }
        .notification-card {
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .notification-card.unread {
          border-left: 4px solid ${COLORS.primary};
          background-color: #f0f7ff;
        }
        .notification-content {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .icon-box {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          background: ${COLORS.border};
          color: ${COLORS.textLight};
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 18px;
        }
        .unread .icon-box {
          background: ${COLORS.secondary};
          color: ${COLORS.primary};
        }
        .notification-card h6 {
          margin: 0;
          font-size: 15px;
          color: ${COLORS.textDark};
        }
        .notification-card p {
          margin: 4px 0 0;
          font-size: 14px;
          color: ${COLORS.textLight};
        }
        .notification-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        .delete-btn {
          background: transparent;
          border: none;
          color: #ff4d4f;
          opacity: 0;
          transition: 0.2s;
          cursor: pointer;
        }
        .notification-card:hover .delete-btn {
          opacity: 1;
        }
        .empty-state {
          text-align: center;
          padding: 60px 0;
          color: ${COLORS.textLight};
        }
        .empty-state p {
          margin-top: 15px;
          font-size: 16px;
        }
        
        .skeleton-card { pointer-events: none; }
        .skeleton-circle { width: 45px; height: 45px; border-radius: 10px; background: #eee; }
        .skeleton-text-group { display: flex; flex-direction: column; gap: 8px; }
        .skeleton-text { height: 12px; background: #eee; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Notification;
