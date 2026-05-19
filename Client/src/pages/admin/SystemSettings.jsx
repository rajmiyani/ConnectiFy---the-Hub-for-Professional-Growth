import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import {
  FaCog,
  FaEnvelope,
  FaBell,
  FaToggleOn,
  FaToggleOff,
  FaUpload,
  FaUserShield,
  FaInfoCircle,
  FaSyncAlt
} from "react-icons/fa";

/* ================= THEME ================= */
const COLORS = {
  primary: "rgb(0, 115, 177)",
  secondary: "#f4f9fd",
  white: "#ffffff",
  border: "#e4ecf4",
  textDark: "#1f1f1f",
  textLight: "#606770",
  danger: "#b3261e",
  success: "#137333",
};

/* ================= PAGE ================= */
export default function SystemSettings() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [platformName, setPlatformName] = useState("Connectify");

  const [notifications, setNotifications] = useState({
    email: true,
    adminAlerts: true,
  });

  const [features, setFeatures] = useState({
    messaging: true,
    jobPosting: true,
    analytics: true,
    aiModeration: false,
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We are currently under maintenance. Please check back soon."
  );

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/settings");
      if (response.data.success && response.data.settings) {
        const s = response.data.settings;
        setPlatformName(s.platformName || "Connectify");
        setNotifications(s.notifications || { email: true, adminAlerts: true });
        setFeatures(s.features || { messaging: true, jobPosting: true, analytics: true, aiModeration: false });
        setMaintenanceMode(s.maintenanceMode || false);
        setMaintenanceMessage(s.maintenanceMessage || "We are currently under maintenance.");
      }
    } catch (error) {
      console.warn("Failed to fetch settings, using defaults.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const settings = {
        platformName,
        notifications,
        features,
        maintenanceMode,
        maintenanceMessage
      };
      const response = await api.patch("/admin/settings", { settings });
      if (response.data.success) {
        showToast("System settings updated successfully", "success");
      }
    } catch (error) {
      showToast("Failed to save settings", "error");
    }
  };

  const toggleFeature = (key) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "400px" }}>
        <FaSyncAlt className="fa-spin text-primary" size={30} />
        <span className="ms-3 fw-bold">Synchronizing System Config...</span>
      </div>
    );
  }

  return (
    <div className="pb-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">System Settings</h4>
          <span className="text-muted">Platform configuration & administrative controls</span>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleSave}>
          Save All Changes
        </button>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          {/* PLATFORM SETTINGS */}
          <Section title="Platform Identity" icon={<FaCog />}>
            <div className="row g-3">
              <div className="col-md-12 mb-3">
                <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px" }}>Platform Name</label>
                <input
                  className="form-control rounded-3 border-2"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* MAINTENANCE MODE */}
          <Section title="Operational Status" icon={<FaToggleOn />}>
            <div className="mb-3">
              <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px" }}>Global Maintenance Message</label>
              <textarea
                className="form-control rounded-4 border-2"
                rows={3}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center p-3 rounded-4 border bg-light">
              <div>
                <span className="fw-bold d-block">Maintenance Mode</span>
                <small className="text-muted">Prevents non-admin access to the platform</small>
              </div>
              <button
                className={`btn rounded-pill px-4 fw-bold ${maintenanceMode ? 'btn-danger shadow-sm' : 'btn-outline-secondary'}`}
                onClick={() => setMaintenanceMode(!maintenanceMode)}
              >
                {maintenanceMode ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>
          </Section>

          {/* EMAIL TEMPLATES */}
          <Section title="System Emails" icon={<FaEnvelope />}>
            <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px" }}>Default Greeting Template</label>
            <textarea
              className="form-control mb-3 rounded-4 border-2"
              rows={4}
              placeholder="Hello {{user_name}}, welcome to {{platform_name}}..."
            />
            <div className="small p-3 rounded-3" style={{ background: COLORS.secondary }}>
              <FaInfoCircle className="me-2" /> Available: <b>{"{{user_name}}, {{platform_name}}, {{action_link}}"}</b>
            </div>
          </Section>
        </div>

        <div className="col-md-4">
          {/* NOTIFICATIONS */}
          <Section title="Alert Preferences" icon={<FaBell />}>
            <Toggle
              label="Email Notifications"
              enabled={notifications.email}
              onToggle={() => setNotifications((p) => ({ ...p, email: !p.email }))}
            />
            <Toggle
              label="Admin Activity Alerts"
              enabled={notifications.adminAlerts}
              onToggle={() => setNotifications((p) => ({ ...p, adminAlerts: !p.adminAlerts }))}
            />
          </Section>

          {/* FEATURE TOGGLES */}
          <Section title="Service Controls" icon={<FaToggleOff />}>
            {Object.entries(features).map(([key, value]) => (
              <Toggle
                key={key}
                label={key.replace(/([A-Z])/g, " $1").toUpperCase()}
                enabled={value}
                onToggle={() => toggleFeature(key)}
              />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, icon, children }) => (
  <div className="mb-4 p-4 rounded-4 bg-white border shadow-sm">
    <div className="d-flex align-items-center gap-2 mb-3">
      <span className="text-primary">{icon}</span>
      <h6 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: "1px", fontSize: "13px" }}>{title}</h6>
    </div>
    {children}
  </div>
);

const Toggle = ({ label, enabled, onToggle }) => (
  <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3 hover-bg">
    <span className="small fw-bold text-muted" style={{ fontSize: "11px" }}>{label}</span>
    <button
      className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${enabled ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`}
      onClick={onToggle}
      style={{ fontSize: "10px" }}
    >
      {enabled ? "ON" : "OFF"}
    </button>
  </div>
);
