import React, { useState } from "react";
import { FaFileUpload } from "react-icons/fa";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setTimeout(() => {
        setAnalyzed(true);
      }, 1200); // simulate analysis
    }
  };

  return (
    <aside className="col-lg-12 right-col">
      <div
        className="card p-3 mb-3 border-0 shadow-sm"
        style={{ borderRadius: "15px", background: "#fff" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-semibold text-dark">AI Resume Analyzer</h6>
          <small className="text-muted">Preview</small>
        </div>

        <p className="small text-muted mb-3">
          Upload your resume to get a quick match score and improvement
          suggestions.
        </p>

        {/* Upload Section */}
        {!analyzed ? (
          <div
            className="p-4 text-center border rounded-3"
            style={{
              border: "2px dashed #b5cde8",
              background: "#f8fbff",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onClick={() => document.getElementById("resumeInput").click()}
          >
            <FaFileUpload size={36} color="#0b6fa8" className="mb-2" />
            <p className="mb-0 small text-muted">
              Drag & drop or{" "}
              <span className="text-primary fw-semibold">browse</span>
            </p>
            <input
              id="resumeInput"
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={handleFileChange}
            />
          </div>
        ) : (
          /* Result Section */
          <div className="mt-2" id="resumeResult">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#0b6fa8",
                }}
              >
                AI
              </div>
              <div>
                <div className="fw-bold" id="resumeScore">
                  Match: 82%
                </div>
                <div className="small text-muted" id="resumeHeadline">
                  Good skill match for Frontend roles
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="small text-muted mb-1">Top Suggestions</div>
              <ul className="small text-secondary ps-3 mb-3">
                <li>Highlight skills like React, TypeScript more clearly</li>
                <li>Include measurable achievements (e.g., “Increased speed 30%”)</li>
                <li>Keep the summary concise (1–2 lines)</li>
              </ul>
            </div>

            <button
              className="btn btn-sm btn-outline-primary w-100"
              onClick={() => alert("Report downloading...")}
            >
              Download Report
            </button>
          </div>
        )}

        {/* Uploaded File Info */}
        {file && !analyzed && (
          <div className="mt-3 text-center small text-muted">
            <strong>{file.name}</strong> — analyzing...
          </div>
        )}
      </div>
    </aside>
  );
};

export default ResumeAnalyzer;
