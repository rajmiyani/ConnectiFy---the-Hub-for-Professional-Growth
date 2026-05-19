import { useState, useRef, useEffect } from "react";
import { FaKey, FaCheckCircle, FaPaperPlane } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
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
  bg: "#f3f2ef",
};

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { setUser, login } = useAuth();
  const inputRefs = useRef([]);

  const email = location.state?.email || "";
  const accountType = location.state?.accountType || "user";

  useEffect(() => {
    if (!email) {
      showToast("Session expired or missing email.", "error");
      navigate("/login");
    }
  }, [email, navigate, showToast]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const submitHandler = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    try {
      const endpoint = accountType === "user"
        ? "/users/verify-otp"
        : "/companies/verify-otp";

      const response = await api.post(endpoint, { email, otp: otpValue });

      const data = response.data;

      if (data.success) {
        showToast("Account Verified Successfully! Welcome to Connectify.", "success");

        // Use login helper to persist session correctly
        login(data.data, data.token, data.refreshToken);

        setTimeout(() => {
          const type = data.data?.accountType || accountType;
          if (type === "admin") {
            navigate("/admin/dashboard");
          } else if (type === "company") {
            navigate("/company/dashboard");
          } else {
            navigate("/user/home");
          }
        }, 1500);
      } else {
        showToast(data.message || "Invalid OTP. Please try again.", "error");
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (timer > 0) return;

    try {
      const endpoint = accountType === "user"
        ? "/users/resend-otp"
        : "/companies/resend-otp";

      const response = await api.post(endpoint, { email });
      const data = response.data;
      if (data.success) {
        showToast("A new OTP has been sent to your email.", "success");
        setTimer(60);
      } else {
        showToast(data.message || "Failed to resend OTP.", "error");
      }
    } catch (error) {
      showToast("Error resending OTP.", "error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${COLORS.bg} 0%, #e0eafc 100%)`,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: COLORS.white,
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            flex: "1",
            backgroundColor: COLORS.secondary,
            padding: "60px 40px",
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
            style={{ width: 140, marginBottom: 30 }}
          />
          <div style={{ backgroundColor: COLORS.white, padding: 20, borderRadius: "50%", marginBottom: 20 }}>
            <FaKey size={40} color={COLORS.primary} />
          </div>
          <h2 className="fw-bold" style={{ color: COLORS.primary }}>
            Secure Verification
          </h2>
          <p style={{ color: COLORS.textLight, marginTop: 15, lineHeight: "1.6" }}>
            We've sent a 6-digit confirmation code to: <br />
            <strong style={{ color: COLORS.textDark }}>{email}</strong>
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            flex: "1.2",
            padding: "60px 80px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h3 className="fw-bold mb-2" style={{ color: COLORS.primary, fontSize: "28px" }}>
            Enter OTP
          </h3>
          <p style={{ color: COLORS.textLight, marginBottom: 40 }}>
            Please enter the code to verify your account.
          </p>

          {/* OTP BOXES */}
          <div className="d-flex gap-2 justify-content-between mb-5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value.replace(/\D/, ""), idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                style={{
                  width: "50px",
                  height: "60px",
                  textAlign: "center",
                  fontSize: "24px",
                  fontWeight: "700",
                  borderRadius: "12px",
                  border: `2px solid ${digit ? COLORS.primary : COLORS.border}`,
                  backgroundColor: digit ? COLORS.secondary : COLORS.white,
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxShadow: digit ? `0 0 10px ${COLORS.primary}22` : "none",
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                onBlur={(e) => e.target.style.borderColor = digit ? COLORS.primary : COLORS.border}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={submitHandler}
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              fontWeight: 700,
              fontSize: "18px",
              borderRadius: "12px",
              padding: "14px 0",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              boxShadow: "0 10px 20px rgba(0, 115, 177, 0.2)",
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
            <FaCheckCircle />
          </button>

          {/* RESEND OTP */}
          <div className="text-center mt-5">
            <p style={{ color: COLORS.textLight, fontSize: "15px" }}>
              Didn’t receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={timer > 0}
              style={{
                background: "none",
                border: "none",
                color: timer > 0 ? COLORS.textLight : COLORS.primary,
                fontWeight: 700,
                cursor: timer > 0 ? "default" : "pointer",
                padding: "5px 10px",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {timer > 0 ? `Resend code in ${timer}s` : "Resend OTP"}
              {timer === 0 && <FaPaperPlane fontSize={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
