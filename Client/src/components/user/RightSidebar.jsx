import React from "react";
import { FaBuilding, FaMapMarkerAlt, FaBriefcase, FaClock } from "react-icons/fa";

const RightSidebar = () => {
  const [jobs, setJobs] = React.useState([]);

  return (
    <aside className="col-lg-12 right-col">
      <div
        className="card border-0 shadow-sm mb-3"
        style={{
          borderRadius: "15px",
          background: "linear-gradient(180deg, #ffffff, #f6faff)", // subtle light gradient
          color: "#222",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="fw-semibold mb-0" style={{ color: "#0b6fa8" }}>
            Job Recommendations
          </h6>
        </div>

        <p className="small text-muted px-3 mt-2 mb-3">
          Based on your profile preview and recent activity
        </p>

        {/* Jobs List */}
        <div id="jobsList" className="d-grid gap-3 px-3 pb-3">
          {jobs.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              No new recommendations at the moment.
            </div>
          ) : (
            jobs.map((job, index) => (
              <div
                key={index}
                className="p-3 rounded-3 border"
                style={{
                  background: "#fff",
                  borderColor: "#e3e6ea",
                  transition: "0.3s",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f7fb";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                }}
              >
                <h6 className="fw-semibold mb-1" style={{ color: "#0b6fa8" }}>
                  {job.title}
                </h6>
                <div className="small text-muted mb-1 d-flex align-items-center gap-2">
                  <FaBuilding style={{ color: "#0b6fa8" }} /> {job.company}
                </div>
                <div className="small text-secondary d-flex flex-wrap gap-3 align-items-center">
                  <span className="d-flex align-items-center gap-1">
                    <FaMapMarkerAlt style={{ color: "#f05454" }} /> {job.location}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <FaBriefcase style={{ color: "#04aa6d" }} /> {job.type}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <FaClock style={{ color: "#ffc107" }} /> {job.posted}
                  </span>
                </div>
                <button
                  className="btn btn-sm mt-3 fw-semibold"
                  style={{
                    borderRadius: "20px",
                    fontSize: "13px",
                    color: "#0b6fa8",
                    border: "1px solid #0b6fa8",
                    background: "transparent",
                    transition: "0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#0b6fa8";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#0b6fa8";
                  }}
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 text-center border-top p-2">
          <a
            href="#"
            className="small fw-semibold text-decoration-none"
            style={{ color: "#0b6fa8" }}
          >
            See more jobs →
          </a>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
