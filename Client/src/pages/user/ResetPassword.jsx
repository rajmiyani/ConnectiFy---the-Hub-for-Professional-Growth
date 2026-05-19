import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaLock, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation, Link } from "react-router-dom";
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [token, setToken] = useState("");
  const [accountType, setAccountType] = useState("user"); // "user" or "company"

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    const type = params.get("type"); // Detect if it's a company reset

    if (t) {
      setToken(t);
    } else {
      showToast("Reset token is missing from the URL.", "error");
    }

    if (type === "company") {
      setAccountType("company");
    } else {
      setAccountType("user");
    }
  }, [location, showToast]);

  const submitHandler = async () => {
    let e = {};

    if (!form.newPassword) e.newPassword = "New password is required";
    if (!form.confirmPassword) e.confirmPassword = "Confirm password is required";
    if (form.newPassword && form.newPassword.length < 8) e.newPassword = "Password must be at least 8 characters";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);

    if (Object.keys(e).length === 0) {
      if (!token) {
        showToast("Invalid or missing token.", "error");
        return;
      }

      setLoading(true);
      try {
        const endpoint = accountType === "user"
          ? "http://localhost:8000/users/reset-password"
          : "http://localhost:8000/companies/reset-password";

        const response = await api.post(endpoint, {
          token,
          newPassword: form.newPassword,
        });

        const data = response.data;

        if (data.success) {
          showToast("Password Reset Successfully!", "success");
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        } else {
          showToast(data.message || "Failed to reset password.", "error");
        }
      } catch (err) {
        console.error("Reset password error:", err);
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
            Reset Your Password
          </h2>

          <p style={{ color: COLORS.textLight, maxWidth: 300 }}>
            Set a new password to regain access to your ConnectiFY account.
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
            Reset Password
          </h3>

          {/* New Password */}
          <div className="mb-3" style={{ position: "relative" }}>
            <label className="form-label fw-semibold">New Password *</label>

            <input
              type={show1 ? "text" : "password"}
              className={`form-control ${errors.newPassword && "is-invalid"}`}
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              style={{ padding: "10px 40px 10px 10px" }}
            />

            <span
              onClick={() => setShow1(!show1)}
              style={{
                position: "absolute",
                right: 12,
                top: 40,
                cursor: "pointer",
                color: COLORS.textLight,
                fontSize: 18,
              }}
            >
              {show1 ? <FaEyeSlash /> : <FaEye />}
            </span>

            {errors.newPassword && (
              <div className="text-danger small">{errors.newPassword}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4" style={{ position: "relative" }}>
            <label className="form-label fw-semibold">Confirm Password *</label>

            <input
              type={show2 ? "text" : "password"}
              className={`form-control ${errors.confirmPassword && "is-invalid"}`}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              style={{ padding: "10px 40px 10px 10px" }}
            />

            <span
              onClick={() => setShow2(!show2)}
              style={{
                position: "absolute",
                right: 12,
                top: 40,
                cursor: "pointer",
                color: COLORS.textLight,
                fontSize: 18,
              }}
            >
              {show2 ? <FaEyeSlash /> : <FaEye />}
            </span>

            {errors.confirmPassword && (
              <div className="text-danger small">{errors.confirmPassword}</div>
            )}
          </div>

          {/* RESET BUTTON */}
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
              {loading ? "Resetting..." : "Reset Password"} <FaLock className="ms-1" />
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

      {/* Toast removed as it's now handled by context */}
    </div>
  );
}
