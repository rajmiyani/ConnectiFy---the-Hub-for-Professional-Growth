import React, { useState } from "react";
import {
  FaUserEdit,
  FaEnvelope,
  FaShieldAlt,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaSave,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import { useEffect } from "react";

/* ================= THEME ================= */
const COLORS = {
  primary: "rgb(0, 115, 177)",
  secondary: "#e8f4fb",
  textDark: "#1f1f1f",
  textLight: "#606770",
  border: "#e0e0e0",
  white: "#ffffff",
  hover: "#f7f9fa",
  success: "#137333",
};

export default function MyProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@connectify.com",
    role: "Administrator",
    phone: "",
    location: "Surat, India",
    bio: ""
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get("/admin/profile");
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await api.patch("/admin/profile", profile);
      if (response.data.success) {
        showToast("Profile updated successfully", "success");
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error("Error updating admin profile:", error);
      showToast("Failed to update profile", "error");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">My Profile</h4>
        <span className="text-muted">
          Manage your personal information & admin access
        </span>
      </div>

      {/* PROFILE CARD */}
      <div
        className="p-4 rounded-4 mb-4"
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div className="d-flex align-items-center gap-4">
          {/* AVATAR */}
          <img
            src="https://i.pravatar.cc/150"
            alt="admin"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: `3px solid ${COLORS.primary}`,
            }}
          />

          {/* BASIC INFO */}
          <div>
            <h5 className="fw-bold mb-1">{profile.name}</h5>
            <div className="d-flex align-items-center gap-2 text-muted">
              <FaShieldAlt color={COLORS.primary} />
              <span className="fw-semibold">{profile.role}</span>
            </div>

            <span
              className="badge mt-2"
              style={{
                background: COLORS.secondary,
                color: COLORS.primary,
                padding: "6px 14px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              Platform Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* PROFILE DETAILS */}
      <div
        className="p-4 rounded-4 mb-4"
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <h6 className="fw-bold mb-3">Personal Information</h6>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="fw-semibold mb-1">
              <FaUserEdit className="me-1" /> Full Name
            </label>
            <input
              className="form-control"
              name="name"
              value={profile.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="fw-semibold mb-1">
              <FaEnvelope className="me-1" /> Email
            </label>
            <input
              className="form-control"
              value={profile.email}
              disabled
            />
          </div>

          <div className="col-md-6">
            <label className="fw-semibold mb-1">
              <FaPhoneAlt className="me-1" /> Phone
            </label>
            <input
              className="form-control"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="fw-semibold mb-1">
              <FaMapMarkerAlt className="me-1" /> Location
            </label>
            <input
              className="form-control"
              name="location"
              value={profile.location}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* SECURITY & ROLE */}
      <div
        className="p-4 rounded-4 mb-4"
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <h6 className="fw-bold mb-3">Security & Access</h6>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-semibold">Role</span>
          <span
            className="badge"
            style={{
              background: COLORS.secondary,
              color: COLORS.primary,
              padding: "6px 14px",
              borderRadius: 20,
            }}
          >
            {profile.role}
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Last Login</span>
          <span className="text-muted">Today, 10:32 AM</span>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="text-end">
        <button
          className="btn"
          onClick={handleSave}
          style={{
            background: COLORS.primary,
            color: COLORS.white,
            padding: "10px 28px",
            fontWeight: 600,
          }}
        >
          <FaSave className="me-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
