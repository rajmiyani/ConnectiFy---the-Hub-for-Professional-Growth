import { useState } from "react";
import { FaEnvelope, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("user"); // "user" or "company"
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const submitHandler = async () => {
    let e = {};
    if (!email) e.email = "Email is required";
    setErrors(e);

    if (Object.keys(e).length === 0) {
      setLoading(true);
      try {
        const endpoint = accountType === "user"
          ? "/users/forgot-password"
          : "/companies/forgot-password";

        const response = await api.post(endpoint, { email });

        const data = response.data;

        if (data.success) {
          showToast(data.message || "Reset link sent to your email!", "success");
        } else {
          showToast(data.message || "Something went wrong.", "error");
        }
      } catch (err) {
        console.error("Forgot password error:", err);
        showToast("Server error. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      <div
        className="w-100"
        style={{
          minHeight: "100vh",
          backgroundColor: COLORS.white,
          display: "grid",
          gridTemplateColumns: "50% 50%",
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
            textAlign: "center",
            borderRight: `1px solid ${COLORS.border}`,
          }}
        >
          <img
            src="/ConnectiFy_logo.png"
            alt="logo"
            style={{ width: 160 }}
          />

          <h2 className="fw-bold" style={{ color: COLORS.primary }}>
            Forgot Your Password?
          </h2>

          <p style={{ color: COLORS.textLight, maxWidth: 300 }}>
            Don’t worry! Enter your email and we’ll send you a link to reset
            your password.
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
              onClick={() => setAccountType("user")}
              style={{
                backgroundColor: accountType === "user" ? COLORS.white : "transparent",
                color: accountType === "user" ? COLORS.primary : COLORS.textLight,
                boxShadow: accountType === "user" ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
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
              onClick={() => setAccountType("company")}
              style={{
                backgroundColor: accountType === "company" ? COLORS.white : "transparent",
                color: accountType === "company" ? COLORS.primary : COLORS.textLight,
                boxShadow: accountType === "company" ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
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
            {accountType === "user" ? "User Forgot Password" : "Company Forgot Password"}
          </h3>

          {/* Email Field */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Email Address *</label>
            <input
              type="email"
              className={`form-control ${errors.email && "is-invalid"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "10px" }}
            />
            {errors.email && (
              <div className="text-danger small">{errors.email}</div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="d-flex justify-content-center">
            <button
              className="btn w-50 mb-3"
              onClick={submitHandler}
              disabled={loading}
              style={{
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontWeight: 600,
                borderRadius: 8,
                padding: "10px 0",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"} <FaPaperPlane className="ms-2" />
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-3">
            <small style={{ color: COLORS.textDark }}>
              Remember your password?
              <Link
                to="/login"
                className="ms-1"
                style={{ color: COLORS.primary, fontWeight: 600, textDecoration: "none" }}
              >
                Login
              </Link>
            </small>
          </div>
        </div>
      </div>

      {/* Toast is now handled by Context */}
    </div>
  );
}
