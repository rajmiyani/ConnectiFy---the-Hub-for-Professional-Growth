import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBriefcase,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { LuUsers } from "react-icons/lu";

const COLORS = {
  primary: "#0073b1",
  secondary: "#e8f4fb",
  border: "#e0e0e0",
  white: "#ffffff",
  textLight: "#606770",
  bg: "#f3f2ef",
  successStrong: "#0a66c2", // for Hired
};

export default function JobManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/companies/jobs/my-jobs/${user.id}`);
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showToast("❌ Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user?.id]);

  const [showModal, setShowModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  const initialForm = {
    jobTitle: "",
    jobType: "Full Time",
    workMode: "Onsite",
    experience: "",
    skills: "",
    description: "",
    salary: "",
    location: "",
    openings: 1,
    applyDeadline: "",
    benefits: "",
    status: "Active"
  };

  const [form, setForm] = useState(initialForm);

  /* ---------------- TOAST ---------------- */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  /* ---------------- CREATE / UPDATE ---------------- */
  const submitJob = async () => {
    if (!validate()) return;

    try {
      const url = editingJobId
        ? `/companies/jobs/${editingJobId}`
        : `/companies/jobs`;

      const method = editingJobId ? "put" : "post";
      const payload = { ...form, companyId: user.id };

      const res = await api[method](url, payload);

      if (res.data.success) {
        showToast(editingJobId ? "✅ Job updated" : "🎉 Job published");
        fetchJobs();
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      showToast("❌ " + (error.response?.data?.message || "Failed to save job"));
    }
  };

  /* ---------------- EDIT ---------------- */
  const editJob = (job) => {
    setForm({
      jobTitle: job.title,
      jobType: job.type,
      workMode: job.workMode || "Onsite",
      skills: job.skills || "",
      location: job.location || "",
      salary: job.salary || "",
      openings: job.openings || 1,
      experience: job.experience || "",
      description: job.description || "",
      applyDeadline: job.applyDeadline ? job.applyDeadline.split('T')[0] : "",
      benefits: job.benefits || "",
      status: job.status || "Active"
    });
    setEditingJobId(job.id);
    setShowModal(true);
  };

  /* ---------------- DELETE ---------------- */
  const deleteJob = async (jobId) => {
    if (!window.confirm("Permanent delete this job posting?")) return;

    try {
      const res = await api.delete(`/companies/jobs/${jobId}`);
      if (res.data.success) {
        showToast("🗑 Job deleted successfully");
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      showToast("❌ Delete failed");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJobId(null);
    setForm(initialForm);
    setErrors({});
  };

  const validate = () => {
    let e = {};

    if (!form.jobTitle.trim()) e.jobTitle = "Job title is required";
    if (!form.jobType) e.jobType = "Please select job type";
    if (!form.workMode) e.workMode = "Please select work mode";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.experience.trim()) e.experience = "Experience is required";
    if (!form.salary.trim()) e.salary = "Salary range is required";
    if (!form.openings || form.openings <= 0)
      e.openings = "Openings must be greater than 0";
    if (!form.skills.trim()) e.skills = "Skills are required";
    if (!form.description.trim())
      e.description = "Job description is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };


  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", padding: "30px 40px" }}>

      {/* ===== PAGE HEADER ===== */}
      <div
        className="bg-white rounded-3 shadow-sm mb-4 p-4 d-flex justify-content-between align-items-center"
        style={{ borderLeft: `6px solid ${COLORS.primary}` }}
      >
        <div>
          <h4 className="fw-bold mb-1" style={{ color: COLORS.textDark }}>
            Job Posting
          </h4>
          <p className="mb-0 small" style={{ color: COLORS.textLight }}>
            Create, manage & optimize job postings professionally
          </p>
        </div>

        <button
          className="btn px-4 py-2 d-flex align-items-center gap-2"
          style={{
            background: COLORS.primary,
            color: COLORS.white,
            fontWeight: 600,
            borderRadius: 8,
          }}
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Post New Job
        </button>
      </div>

      {/* ===== JOB TABLE CARD ===== */}
      <div className="bg-white rounded-3 shadow-sm overflow-hidden">
        <table className="table align-middle mb-0">
          <thead style={{ background: COLORS.secondary }}>
            <tr className="small text-muted">
              <th className="ps-4">Job Role</th>
              <th>Type</th>
              <th>Status</th>
              <th>Applicants</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: 40, height: 40 }}></div>
                      <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "150px" }}></div>
                    </div>
                  </td>
                  <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "80px" }}></div></td>
                  <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "70px", height: "10px" }}></div></td>
                  <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "30px" }}></div></td>
                  <td className="text-end pe-4">
                    <div className="skeleton skeleton-pulse skeleton-btn ms-2" style={{ width: "32px", height: "32px" }}></div>
                    <div className="skeleton skeleton-pulse skeleton-btn ms-2" style={{ width: "32px", height: "32px" }}></div>
                  </td>
                </tr>
              ))
            ) : (
              jobs.map((job, i) => (
                <tr
                  key={i}
                  style={{ transition: "0.25s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* JOB */}
                  <td className="ps-4 fw-semibold d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: COLORS.secondary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.primary,
                      }}
                    >
                      <FaBriefcase />
                    </div>
                    {job.title}
                  </td>

                  {/* TYPE */}
                  <td>{job.type}</td>

                  {/* STATUS */}
                  <td>
                    <span
                      className="px-3 py-1 rounded-pill small fw-semibold"
                      style={{
                        background:
                          job.status === "Active"
                            ? "#e6f4ea"
                            : job.status === "Draft"
                              ? "#fff4e5"
                              : "#fdecea",
                        color:
                          job.status === "Active"
                            ? "#137333"
                            : job.status === "Draft"
                              ? "#b06000"
                              : "#b3261e",
                      }}
                    >
                      {job.status}
                    </span>
                  </td>

                  {/* APPLICANTS */}
                  <td className="fw-semibold">{job.applicants}</td>

                  {/* ACTIONS */}
                  <td className="text-end pe-4">
                    <Link
                      to={`/company/view-applicants/${job.id}`}
                      className="btn btn-sm me-2"
                      style={{ background: COLORS.secondary }}
                      title="View Applicants"
                    >
                      <LuUsers color={COLORS.primary} />
                    </Link>

                    <button
                      className="btn btn-sm me-2"
                      style={{ background: COLORS.secondary }}
                      onClick={() => editJob(job)}
                    >
                      <FaEdit color={COLORS.primary} />
                    </button>

                    <button
                      className="btn btn-sm"
                      style={{ background: "#fdecea" }}
                      onClick={() => deleteJob(job.id)}
                    >
                      <FaTrash color="#b3261e" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.65)", zIndex: 2000 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg d-flex flex-column"
            style={{
              width: 650,
              height: 650,
            }}
          >
            {/* MODAL HEADER */}
            <div
              className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center"
              style={{ background: COLORS.secondary }}
            >
              <h6 className="fw-bold mb-0">
                {editingJobId !== null ? "Update Job Details" : "Create New Job"}
              </h6>

              <FaTimes
                style={{ cursor: "pointer", fontSize: 14 }}
                onClick={closeModal}
              />
            </div>

            {/* MODAL BODY */}
            <div
              className="p-4"
              style={{
                overflowY: "auto",
                flex: 1,
              }}
            >
              <div className="row g-4">

                {/* ===== BASIC DETAILS ===== */}
                <div className="col-12">
                  <h6 className="fw-bold text-primary">Basic Job Information</h6>
                </div>

                {/* Job Title */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Job Title *</label>
                  <input
                    className={`form-control ${errors.jobTitle ? "is-invalid" : ""}`}
                    placeholder="e.g. Frontend Developer"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  />
                  {errors.jobTitle && (
                    <div className="invalid-feedback">{errors.jobTitle}</div>
                  )}
                </div>

                {/* Job Type */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Job Type *</label>
                  <select
                    className={`form-control ${errors.jobType ? "is-invalid" : ""}`}
                    value={form.jobType}
                    onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                  {errors.jobType && (
                    <div className="invalid-feedback">{errors.jobType}</div>
                  )}
                </div>

                {/* Work Mode */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Work Mode *</label>
                  <select
                    className={`form-control ${errors.workMode ? "is-invalid" : ""}`}
                    value={form.workMode}
                    onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option>Onsite</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                  {errors.workMode && (
                    <div className="invalid-feedback">{errors.workMode}</div>
                  )}
                </div>

                {/* Location */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Location *</label>
                  <input
                    className={`form-control ${errors.location ? "is-invalid" : ""}`}
                    placeholder="City, State, Country"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                  {errors.location && (
                    <div className="invalid-feedback">{errors.location}</div>
                  )}
                </div>

                {/* ===== EXPERIENCE & SALARY ===== */}
                <div className="col-12 mt-3">
                  <h6 className="fw-bold text-primary">Experience & Compensation</h6>
                </div>

                {/* Experience */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Experience Required *</label>
                  <input
                    className={`form-control ${errors.experience ? "is-invalid" : ""}`}
                    placeholder="e.g. 2–5 Years"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                  {errors.experience && (
                    <div className="invalid-feedback">{errors.experience}</div>
                  )}
                </div>

                {/* Salary */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Salary Range *</label>
                  <input
                    className={`form-control ${errors.salary ? "is-invalid" : ""}`}
                    placeholder="₹8–12 LPA / $60k–80k"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                  {errors.salary && (
                    <div className="invalid-feedback">{errors.salary}</div>
                  )}
                </div>

                {/* Openings */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Number of Openings *</label>
                  <input
                    type="number"
                    className={`form-control ${errors.openings ? "is-invalid" : ""}`}
                    value={form.openings}
                    onChange={(e) => setForm({ ...form, openings: e.target.value })}
                  />
                  {errors.openings && (
                    <div className="invalid-feedback">{errors.openings}</div>
                  )}
                </div>

                {/* Apply Deadline */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Apply Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.applyDeadline}
                    onChange={(e) => setForm({ ...form, applyDeadline: e.target.value })}
                  />
                </div>

                {/* ===== SKILLS ===== */}
                <div className="col-12 mt-3">
                  <h6 className="fw-bold text-primary">Skills & Requirements</h6>
                </div>

                {/* Skills */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Required Skills *</label>
                  <input
                    className={`form-control ${errors.skills ? "is-invalid" : ""}`}
                    placeholder="React, Node.js, MongoDB, TypeScript"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  />
                  {errors.skills && (
                    <div className="invalid-feedback">{errors.skills}</div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Job Description *</label>
                  <textarea
                    rows={4}
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    placeholder="Describe role responsibilities, expectations, and growth opportunities"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                {/* ===== BENEFITS ===== */}
                <div className="col-12 mt-3">
                  <h6 className="fw-bold text-primary">Benefits & Perks</h6>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Benefits</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Health insurance, PF, remote flexibility, paid leaves"
                    value={form.benefits}
                    onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  />
                </div>

                {/* ===== STATUS ===== */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Job Status</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Closed</option>
                  </select>
                </div>

              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-top text-end">
              <button
                className="btn px-4 py-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.white,
                  fontWeight: 600,
                }}
                onClick={submitJob}
              >
                {editingJobId !== null ? "Update Job" : "Publish Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div
          className="position-fixed bottom-0 end-0 m-4 px-4 py-2 rounded-3 shadow"
          style={{
            background: COLORS.primary,
            color: COLORS.white,
            fontWeight: 500,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );

}
