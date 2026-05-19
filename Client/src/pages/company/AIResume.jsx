import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiCheckCircle,
  FiTrendingUp,
  FiUser,
  FiFileText,
} from "react-icons/fi";

const COLORS = {
  primary: "#0073b1",
  secondary: "#f5f7fa",
  text: "#1c1e21",
  border: "#e0e0e0",
  white: "#ffffff",
  gradient: "linear-gradient(90deg, #0073b1, #00a0dc)",
};

const AIResume = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = () => {
    if (!file) return alert("Please upload a resume first.");
    setAnalyzing(true);

    // Simulated AI response
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysis({
        name: "Anonymous Candidate",
        role: "MERN Stack Developer",
        score: 91,
        strengths: [
          "Strong React & Node.js knowledge",
          "Clean UI/UX implementation",
          "REST API & backend integration",
          "MongoDB & database design",
          "Problem-solving mindset",
        ],
        improvements: [
          "Add CI/CD & DevOps projects",
          "Highlight measurable achievements",
        ],
        insights:
          "Your profile is highly competitive. Emphasizing impact-driven results and leadership experience can significantly improve recruiter engagement.",
      });
    }, 2200);
  };

  return (
    <div
      style={{
        minHeight: "90vh",
        backgroundColor: COLORS.secondary,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        className="p-5"
        style={{
          background: COLORS.white,
          width: "100%",
          height: "100%",
        }}
      >
        <AnimatePresence mode="wait">
          {/* ================= UPLOAD SECTION ================= */}
          {!analysis && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-4">
                <h3 style={{ fontWeight: 700, color: COLORS.text }}>
                  AI Resume Analyzer
                </h3>
                <p className="text-muted mx-auto" style={{ maxWidth: 520 }}>
                  Upload your resume to receive AI-powered insights, ATS score,
                  and career improvement suggestions.
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="text-center p-5 rounded-4"
                style={{
                  border: `2px dashed ${COLORS.primary}`,
                  backgroundColor: "#f8fbff",
                }}
              >
                <FiUploadCloud size={60} color={COLORS.primary} className="mb-3" />

                <h6 style={{ fontWeight: 600 }}>
                  Drag & drop your resume here
                </h6>
                <p className="text-muted small">
                  PDF, DOC, DOCX • Max 5MB
                </p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="form-control mt-2"
                  style={{ maxWidth: 360, margin: "0 auto" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />

                {file && (
                  <p className="small mt-3 text-success">
                    ✔ Selected: <b>{file.name}</b>
                  </p>
                )}
              </motion.div>

              <div className="row text-center mt-4">
                {[
                  "ATS Score",
                  "Skill Gap Analysis",
                  "Role Fit",
                  "Career Guidance",
                ].map((item, i) => (
                  <div className="col-6 col-md-3" key={i}>
                    <FiCheckCircle color={COLORS.primary} />
                    <p className="small mt-2">{item}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn text-white px-5 py-2"
                  style={{
                    background: COLORS.gradient,
                    borderRadius: 12,
                    border: "none",
                  }}
                  onClick={handleAnalyze}
                >
                  {analyzing ? "Analyzing Resume..." : "Analyze Resume"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ================= RESULT SECTION ================= */}
          {analysis && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-4">
                <FiUser
                  size={64}
                  color={COLORS.primary}
                  style={{
                    background: "#e8f5fd",
                    padding: 18,
                    borderRadius: "50%",
                  }}
                />
                <h4 className="mt-3">{analysis.name}</h4>
                <p className="text-muted">{analysis.role}</p>
              </div>

              <div
                className="mb-4"
                style={{
                  height: 24,
                  background: "#e9ecef",
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ duration: 1 }}
                  style={{
                    height: "100%",
                    background: COLORS.gradient,
                    color: "#fff",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Resume Score: {analysis.score}%
                </motion.div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="fw-semibold text-primary mb-2">
                    <FiCheckCircle className="me-2" /> Strengths
                  </h6>
                  <ul className="list-unstyled">
                    {analysis.strengths.map((s, i) => (
                      <li key={i}>✅ {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-semibold text-danger mb-2">
                    <FiTrendingUp className="me-2" /> Improvements
                  </h6>
                  <ul className="list-unstyled">
                    {analysis.improvements.map((i, idx) => (
                      <li key={idx}>⚙️ {i}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                className="mt-4 p-4 rounded-4"
                style={{
                  backgroundColor: COLORS.secondary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <h6 className="fw-semibold text-primary mb-2">
                  <FiFileText className="me-2" /> AI Insights
                </h6>
                <p className="mb-0">{analysis.insights}</p>
              </div>

              <div className="text-center mt-4">
                <button
                  className="btn btn-outline-primary px-4"
                  onClick={() => {
                    setAnalysis(null);
                    setFile(null);
                  }}
                >
                  Analyze Another Resume
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIResume;
