import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiBookmark,
  FiTrash2,
  FiExternalLink,
  FiBriefcase,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";

const COLORS = {
  primary: "#0073b1",
  accent: "#00a0dc",
  background: "#f3f2ef",
  cardBg: "#ffffff",
  text: "#1c1e21",
  border: "#e1e4e8",
  gradient: "linear-gradient(90deg, #0073b1, #00a0dc)",
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

const SavedItems = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [savedData, setSavedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const savedJobs = savedData.filter((item) => item.type === "Job");

  const fetchSavedItems = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/users/interaction/saved/${user.id}`);
      const data = res.data;
      if (data.success) {
        setSavedData(data.data);
      }
    } catch (err) {
      console.error("Error fetching saved items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, [user?.id]);

  const handleRemove = async (item) => {
    if (!user?.id) return;
    const type = item.type === "Job" ? "job" : "post";
    const bodyKey = item.type === "Job" ? "jobId" : "postId";

    try {
      const res = await api.post(`/users/interaction/save-${type}`, { [bodyKey]: item.id, userId: user.id });
      const data = res.data;
      if (data.success && !data.saved) {
        setSavedData(prev => prev.filter((i) => i.savedItemId !== item.savedItemId));
        showToast("🗑️ Item removed from saved", "success");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      showToast("❌ Failed to remove item", "error");
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div
      style={{
        minHeight: "91vh",
        backgroundColor: COLORS.background,
        padding: "20px 30px 50px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FiBookmark size={32} color={COLORS.primary} />
          <h2 style={{ color: COLORS.text, fontWeight: "700", margin: 0 }}>
            Saved Items
          </h2>
        </div>
        <span
          style={{
            background: COLORS.gradient,
            color: COLORS.cardBg,
            padding: "10px 20px",
            borderRadius: "12px",
            fontWeight: 500,
            fontSize: "0.95rem",
          }}
        >
          {savedData.length} Saved
        </span>
      </motion.div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "28px",
          width: "100%",
        }}
      >
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{ backgroundColor: COLORS.cardBg, borderRadius: "18px", padding: "24px", height: "250px", border: `1px solid ${COLORS.border}` }}>
              <div className="skeleton skeleton-pulse skeleton-title mb-3" style={{ width: "40%" }}></div>
              <div className="skeleton skeleton-pulse skeleton-text mb-2" style={{ width: "100%" }}></div>
              <div className="skeleton skeleton-pulse skeleton-text mb-4" style={{ width: "80%" }}></div>
              <div className="d-flex justify-content-between">
                <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "30%" }}></div>
                <div className="skeleton skeleton-pulse skeleton-rect" style={{ width: "60px", height: "30px", borderRadius: "8px" }}></div>
              </div>
            </div>
          ))
        ) : savedData.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "100px 20px", color: "#666" }}>
            <FiBookmark size={60} style={{ opacity: 0.2, marginBottom: "20px" }} />
            <h4>No saved items yet</h4>
            <p>Items you save will appear here for easy access.</p>
          </div>
        ) : savedData.map((item, index) => (
          <motion.div
            key={item.savedItemId}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: "18px",
              padding: "24px 22px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              border: `1px solid ${COLORS.border}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "250px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: COLORS.primary,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {item.type === "Job" ? <FiBriefcase /> : <FiFileText />}
                  {item.type}
                </span>
                <FiTrash2
                  color="#dc3545"
                  size={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemove(item)}
                />
              </div>

              <h5
                style={{
                  fontWeight: "600",
                  fontSize: "1.05rem",
                  color: COLORS.text,
                  marginBottom: "8px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: "1.4"
                }}
              >
                {item.type === "Job" ? item.title : (item.content || "Post Content")}
              </h5>
              <p
                style={{
                  color: "#5f6368",
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                  marginBottom: "12px",
                  maxHeight: "65px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.type === "Job" ? `${item.company} • ${item.location}` : (item.content ? "" : "No description available.")}
                {item.type === "Post" && item.user && `by ${item.user.firstName} ${item.user.lastName}`}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#888", fontSize: "0.8rem" }}>
                Saved {timeAgo(item.savedTime)}
              </span>
              <button
                onClick={() => handleView(item)}
                style={{
                  background: COLORS.gradient,
                  color: COLORS.cardBg,
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <FiExternalLink size={16} /> View
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            {/* Backdrop */}
            <motion.div
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(6px)",
              }}
            />
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              style={{
                background: COLORS.cardBg,
                borderRadius: "28px",
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflow: "hidden",
                boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
                position: "relative",
                zIndex: 2100,
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "28px 36px",
                  borderBottom: `1px solid ${COLORS.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    padding: "10px",
                    background: selectedItem.type === "Job" ? "#eef3f8" : "#f0f4f8",
                    borderRadius: "12px",
                    color: COLORS.primary
                  }}>
                    {selectedItem.type === "Job" ? <FiBriefcase size={22} /> : <FiFileText size={22} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: "1.2rem", color: COLORS.text, letterSpacing: "-0.3px" }}>
                      {selectedItem.type === "Job" ? "Job Opportunities" : "Post Details"}
                    </h4>
                    <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 500 }}>
                      Saved {timeAgo(selectedItem.savedTime)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  style={{
                    background: "#f5f5f7",
                    border: "none",
                    padding: "10px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    color: "#444"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#eeeeee";
                    e.currentTarget.style.transform = "rotate(90deg)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#f5f5f7";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div
                style={{
                  padding: "36px",
                  overflowY: "auto",
                  flexGrow: 1,
                  background: "#fff",
                }}
              >
                {selectedItem.type === "Job" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                    {/* Job Hero */}
                    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                      <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "18px",
                        border: `1px solid ${COLORS.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fff",
                        flexShrink: 0,
                        overflow: "hidden"
                      }}>
                        <img
                          src={selectedItem.logoUrl || "https://cdn-icons-png.flaticon.com/512/2836/2836511.png"}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
                        />
                      </div>
                      <div>
                        <h2 style={{ margin: "0 0 6px 0", fontWeight: 800, fontSize: "1.6rem", color: COLORS.text, letterSpacing: "-0.5px" }}>{selectedItem.title}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ margin: 0, color: COLORS.primary, fontWeight: 600, fontSize: "1.1rem" }}>
                            {selectedItem.companyName || selectedItem.company}
                          </p>
                          <span style={{ color: "#ccc" }}>•</span>
                          <span style={{ color: "#666", fontSize: "0.95rem" }}>{selectedItem.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Job Badges */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.85rem", background: "#f3f2ef", padding: "6px 14px", borderRadius: "10px", color: "#444", fontWeight: 500 }}>{selectedItem.type}</span>
                      <span style={{ fontSize: "0.85rem", background: "#e1f5fe", padding: "6px 14px", borderRadius: "10px", color: "#0288d1", fontWeight: 500 }}>{selectedItem.location}</span>
                      <span style={{ fontSize: "0.85rem", background: "#e8f5e9", padding: "6px 14px", borderRadius: "10px", color: "#2e7d32", fontWeight: 500 }}>{selectedItem.salary}</span>
                    </div>

                    {/* Description Section */}
                    <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: "28px" }}>
                      <h6 style={{ fontWeight: 800, marginBottom: "14px", color: COLORS.text, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>About the role</h6>
                      <div style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        lineHeight: "1.7",
                        color: "#444",
                        background: "#fafafa",
                        padding: "24px",
                        borderRadius: "18px",
                        border: `1px solid #f0f0f0`
                      }}>
                        {selectedItem.description || "No description provided for this job listing. Please check the main jobs page for more details."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {/* Post Author */}
                    {selectedItem.user && (
                      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <div style={{ position: "relative" }}>
                          <img
                            src={selectedItem.user.profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedItem.user.firstName}`}
                            alt=""
                            style={{ width: "60px", height: "60px", borderRadius: "18px", objectFit: "cover", border: `2px solid ${COLORS.border}` }}
                          />
                          <div style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "16px", height: "16px", background: "#2ecc71", borderRadius: "50%", border: "3px solid #fff" }}></div>
                        </div>
                        <div>
                          <h5 style={{ margin: "0 0 2px 0", fontWeight: 800, fontSize: "1.15rem", color: COLORS.text }}>{selectedItem.user.firstName} {selectedItem.user.lastName}</h5>
                          <p style={{ margin: 0, fontSize: "0.9rem", color: "#777", fontWeight: 500 }}>{selectedItem.user.headline}</p>
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div style={{
                      fontSize: "1.15rem",
                      lineHeight: "1.8",
                      color: COLORS.text,
                      whiteSpace: "pre-wrap"
                    }}>
                      {selectedItem.content}
                    </div>

                    {/* Post Media */}
                    {selectedItem.mediaUrls && selectedItem.mediaUrls.length > 0 && (
                      <div style={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: `1px solid ${COLORS.border}`,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                      }}>
                        <img
                          src={selectedItem.mediaUrls[0]}
                          alt=""
                          style={{ width: "100%", height: "auto", display: "block" }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "24px 36px",
                  borderTop: `1px solid ${COLORS.border}`,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "16px",
                  background: "#fbfbfc",
                }}
              >
                <button
                  onClick={closeModal}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "14px",
                    border: `1px solid ${COLORS.border}`,
                    background: "#fff",
                    color: "#555",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f5f7"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    if (selectedItem.type === "Post") navigate("/user/posts");
                    else navigate("/user/jobs");
                  }}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "14px",
                    border: "none",
                    background: COLORS.gradient,
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 10px 25px rgba(0, 115, 177, 0.3)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <FiExternalLink size={18} /> Visit {selectedItem.type}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedItems;
