import { useState } from "react";
import { FaGoogle, FaGithub, FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

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

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setUser, login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const submitHandler = async () => {
    let e = {};

    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";

    setErrors(e);
    if (Object.keys(e).length !== 0) return;

    try {
      const response = await api.post("/admin/login", { email: form.email, password: form.password });
      const data = response.data;

      if (!data.success) {
        showToast(data.message || "Invalid admin credentials");
        return;
      }

      // Store admin token and info in AuthContext/LocalStorage
      login({ ...data.data, panel: "admin" }, data.token, data.refreshToken);

      showToast("Admin Login Successful!", "success");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Admin Login error:", err);
      const errorMessage = err.response?.data?.message || "Server error. Please try again.";
      showToast(errorMessage);
    }
  };

  return (
    <>
      {/* INLINE CSS */}
      <style>
        {`
          .social-btn {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .social-btn:hover {
            background-color: ${COLORS.secondary};
            transform: translateY(-2px);
            box-shadow: 0px 6px 15px rgba(0, 115, 177, 0.15);
          }

          .social-btn:active {
            transform: scale(0.97);
          }

          .social-icon {
            transition: all 0.3s ease;
          }

          .social-btn:hover .social-icon {
            transform: translateX(-3px);
          }
        `}
      </style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: COLORS.bg,
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        <div
          className="w-100"
          style={{
            display: "grid",
            gridTemplateColumns: "50% 50%",
            backgroundColor: COLORS.white,
          }}
        >
          {/* LEFT PANEL */}
          <div
            style={{
              backgroundColor: COLORS.secondary,
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRight: `1px solid ${COLORS.border}`,
              textAlign: "center",
            }}
          >
            <img
              src="/ConnectiFy_logo.png"
              alt="logo"
              style={{ width: 160, marginBottom: 30 }}
            />

            <h2 className="fw-bold" style={{ color: COLORS.primary }}>
              Welcome Back
            </h2>

            <p style={{ maxWidth: 300, color: COLORS.textLight }}>
              Secure admin access to manage the platform.
            </p>
          </div>

          {/* RIGHT PANEL */}
          <div
            style={{
              padding: "70px 80px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h3 className="fw-bold mb-4" style={{ color: COLORS.primary }}>
              Admin Login
            </h3>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Admin Email *</label>
              <input
                type="email"
                className={`form-control ${errors.email && "is-invalid"}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ padding: "10px" }}
              />
              {errors.email && (
                <div className="text-danger small">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-2" style={{ position: "relative" }}>
              <label className="form-label fw-semibold">Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${errors.password && "is-invalid"}`}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                style={{ padding: "10px 40px 10px 10px" }}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 40,
                  cursor: "pointer",
                  color: COLORS.textLight,
                  fontSize: 18,
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>

              {errors.password && (
                <div className="text-danger small">{errors.password}</div>
              )}
            </div>

            {/* Remember + Disabled Forgot */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  onChange={(e) =>
                    setForm({ ...form, remember: e.target.checked })
                  }
                />
                <label className="form-check-label">Remember Me</label>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <div className="d-flex justify-content-center">
              <button
                className="btn w-50 mb-3"
                onClick={submitHandler}
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  fontWeight: 600,
                  borderRadius: 8,
                  padding: "10px 0",
                }}
              >
                Admin Login <FaLock className="ms-1" />
              </button>
            </div>
          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div
            style={{
              position: "fixed",
              right: 20,
              bottom: 20,
              backgroundColor: COLORS.white,
              border: `1px solid ${toast.type === "success" ? COLORS.primary : "red"
                }`,
              padding: "12px 18px",
              borderRadius: 8,
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
