import { useState } from "react";
import { FaGoogle, FaGithub, FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
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

export default function Login() {

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setUser, login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loginType, setLoginType] = useState("user"); // "user" or "company"
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async () => {
    let e = {};

    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";

    setErrors(e);

    if (Object.keys(e).length !== 0) return;

    try {
      const endpoint = loginType === "user"
        ? "/users/login"
        : "/companies/login";

      const response = await api.post(endpoint, {
        email: form.email,
        password: form.password,
      });

      const data = response.data;

      if (data.success) {
        showToast("Login Successful!", "success");

        // Save user info + both tokens to Context/LocalStorage
        login({ ...data.data, panel: loginType }, data.token, data.refreshToken);

        // Navigation logic
        if (loginType === "user") {
          navigate("/user/home");
        } else {
          navigate("/company/dashboard");
        }
      } else if (data.requiresVerification) {
        showToast(data.message, "info");
        navigate("/otp-verification", { state: { email: form.email, accountType: loginType } });
      } else {
        showToast(data.message || "Invalid email or password", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Something went wrong. Please try again later.";
      showToast(errorMessage, "error");
    }
  };

  return (
    <>
      {/* INLINE CSS (NO SEPARATE FILE) */}
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

          /* icon animation */
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
            gridTemplateColumns: "45% 55%",
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
              Welcome Back!
            </h2>

            <p style={{ maxWidth: 300, color: COLORS.textLight }}>
              Log in to continue your professional journey on ConnectiFY.
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
            {/* Account Type Toggle */}
            <div className="d-flex mb-4 p-1" style={{ backgroundColor: COLORS.bg, borderRadius: 10 }}>
              <button
                className="btn flex-grow-1"
                onClick={() => setLoginType("user")}
                style={{
                  backgroundColor: loginType === "user" ? COLORS.white : "transparent",
                  color: loginType === "user" ? COLORS.primary : COLORS.textLight,
                  boxShadow: loginType === "user" ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  border: "none"
                }}
              >
                Personal
              </button>
              <button
                className="btn flex-grow-1"
                onClick={() => setLoginType("company")}
                style={{
                  backgroundColor: loginType === "company" ? COLORS.white : "transparent",
                  color: loginType === "company" ? COLORS.primary : COLORS.textLight,
                  boxShadow: loginType === "company" ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  border: "none"
                }}
              >
                Company
              </button>
            </div>

            <h3 className="fw-bold mb-4" style={{ color: COLORS.primary }}>
              {loginType === "user" ? "Personal Login" : "Company Login"}
            </h3>

            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address *</label>
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

            {/* Password Field */}
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

              {/* Eye Toggle */}
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

            {/* Remember + Forgot */}
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
                <label
                  className="form-check-label"
                  htmlFor="rememberMe"
                  style={{ color: COLORS.textDark }}
                >
                  Remember Me
                </label>
              </div>

              <a
                href="/forgot-password"
                style={{
                  color: COLORS.primary,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </a>
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
                Login <FaLock className="ms-1" />
              </button>
            </div>

            {/* Divider */}
            <div
              className="text-center mb-3"
              style={{ color: COLORS.textLight }}
            >
              ─────── or continue with ───────
            </div>

            {/* SOCIAL BUTTONS */}
            <div className="d-flex gap-3 mb-3">
              {/* Google */}
              <button
                className="btn w-50 social-btn"
                style={{
                  backgroundColor: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  padding: "10px 0",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                }}
              >
                <FaGoogle className="social-icon" /> Google
              </button>

              {/* GitHub */}
              <button
                className="btn w-50 social-btn"
                style={{
                  backgroundColor: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  padding: "10px 0",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                }}
              >
                <FaGithub className="social-icon" /> GitHub
              </button>
            </div>

            {/* FOOTER */}
            <div className="text-center mt-3">
              <small style={{ color: COLORS.textDark }}>
                Don't have an account?
                <a
                  href="/register"
                  className="ms-1"
                  style={{ color: COLORS.primary, fontWeight: 600 }}
                >
                  Register now
                </a>
              </small>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
