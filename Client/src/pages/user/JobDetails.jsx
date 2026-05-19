import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  BiBriefcase,
  BiMap,
  BiRupee,
  BiTime,
  BiCheckCircle,
  BiUpload,
  BiArrowBack,
  BiBookmark,
  BiBookmarkHeart,
  BiBuildings,
  BiCalendar,
  BiLinkExternal
} from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";
import { FaRegClock, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";

/* ===================== THEME ===================== */
const COLORS = {
  primary: "#004E89",
  accent: "#0096C7",
  background: "#F4F7FB",
  card: "#FFFFFF",
  textDark: "#1E1E1E",
  textMuted: "#6c757d",
  border: "#E0E0E0",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
};

/* ===================== VALIDATION ===================== */
const validateApplyForm = (form) => {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (form.fullName.trim().length < 3) {
    errors.fullName = "Name must be at least 3 characters.";
  }

  if (!form.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(form.phone.trim().replace(/\s/g, ""))) {
    errors.phone = "Enter a valid 10-digit Indian phone number.";
  }

  if (!form.resumeBase64) {
    errors.resume = "Please upload your resume (PDF only).";
  }

  if (form.coverLetter && form.coverLetter.trim().length > 0 && form.coverLetter.trim().length < 50) {
    errors.coverLetter = "Cover letter should be at least 50 characters if provided.";
  }

  return errors;
};

/* ===================== COMPONENT ===================== */
const JobDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // ─── Job Data State ───
  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ─── Apply Modal State ───
  const [showModal, setShowModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeBase64: "",
    resumeName: "",
    coverLetter: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // ─── Toast State ───
  const [toast, setToast] = useState({ msg: "", type: "success" });

  /* ─── Fetch Job + Check Application Status ─── */
  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const [jobRes, appRes] = await Promise.all([
          api.get(`/users/jobs/${id}`),
          user?.id
            ? api.get(`/users/jobs/applications/${user.id}`)
            : Promise.resolve(null),
        ]);

        const jobData = jobRes.data;
        if (jobData.success) setJob(jobData.data);

        if (appRes) {
          const appData = appRes.data;
          if (appData.success) {
            const alreadyApplied = appData.data.some((app) => app.jobId === id);
            setHasApplied(alreadyApplied);
          }
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        showToast("Failed to load job details.", "danger");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id, user?.id]);

  /* ─── Pre-fill form with user data ─── */
  useEffect(() => {
    if (user) {
      setApplyForm((prev) => ({
        ...prev,
        fullName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user.name || ""),
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  /* ─── Auto-dismiss toast ─── */
  useEffect(() => {
    if (toast.msg) {
      const t = setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  /* ─── Resume Upload ─── */
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFormErrors((prev) => ({ ...prev, resume: "Only PDF files are accepted." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, resume: "File size must be under 5 MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setApplyForm((prev) => ({
        ...prev,
        resumeBase64: reader.result,
        resumeName: file.name,
      }));
      setFormErrors((prev) => ({ ...prev, resume: "" }));
    };
    reader.readAsDataURL(file);
  };

  /* ─── AI Cover Letter ─── */
  const handleGenerateCoverLetter = () => {
    if (!job) return;
    setIsGenerating(true);
    setTimeout(() => {
      const text = `Dear Hiring Team at ${job.company?.companyName || job.companyName || "your company"},

I am excited to apply for the ${job.title} position. With my background in ${job.skills || "the relevant domain"} and my experience, I am confident I can contribute effectively to your team.

I am particularly drawn to this opportunity because of the work mode (${job.workMode || "flexible"}) and the focus on ${job.description?.split(".")[0] || "impactful work"}.

Thank you for your time and consideration.

Best regards,
${applyForm.fullName || "Applicant"}`;
      setApplyForm((prev) => ({ ...prev, coverLetter: text }));
      setIsGenerating(false);
    }, 1800);
  };

  /* ─── Submit Application ─── */
  const handleApply = async () => {
    if (!user?.id) {
      showToast("Please login to apply for this job.", "danger");
      return;
    }

    const errors = validateApplyForm(applyForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsApplying(true);
    try {
      const res = await api.post("/users/jobs/apply", {
        jobId: id,
        userId: user.id,
        fullName: applyForm.fullName.trim(),
        email: applyForm.email.trim(),
        phone: applyForm.phone.trim(),
        resumeUrl: applyForm.resumeBase64,
        coverLetter: applyForm.coverLetter.trim(),
      });

      const data = res.data;
      if (data.success) {
        showToast("🎉 Application submitted successfully!", "success");
        setHasApplied(true);
        setShowModal(false);
      } else {
        showToast("❌ " + (data.message || "Failed to submit application."), "danger");
      }
    } catch (err) {
      console.error("Apply error:", err);
      showToast("❌ Network error. Please try again.", "danger");
    } finally {
      setIsApplying(false);
    }
  };

  /* ─── Save / Unsave Job ─── */
  const handleToggleSave = async () => {
    if (!user?.id) return showToast("Please login to save jobs.", "danger");
    try {
      const res = await api.post("/users/jobs/toggle-save", { jobId: id, userId: user.id });
      const data = res.data;
      if (data.success) {
        setIsSaved(data.saved);
        showToast(data.saved ? "Job saved!" : "Job removed from saved.", "success");
      }
    } catch (err) {
      showToast("Failed to update saved jobs.", "danger");
    }
  };

  const openModal = () => {
    setFormErrors({});
    setShowModal(true);
  };

  /* ─────────────────────────────── LOADING ─────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ background: COLORS.background, minHeight: "100vh" }}
        className="d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border" style={{ color: COLORS.primary, width: 48, height: 48 }} role="status" />
          <p className="mt-3 text-muted">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ background: COLORS.background, minHeight: "100vh" }}
        className="d-flex flex-column justify-content-center align-items-center gap-3">
        <p className="text-danger fw-semibold">Job not found or has been removed.</p>
        <button className="btn btn-outline-primary" onClick={() => navigate("/user/jobs")}>
          <BiArrowBack className="me-2" />Back to Jobs
        </button>
      </div>
    );
  }

  const companyName = job.company?.companyName || "Company";
  const logoUrl = job.company?.profileImg || null;
  const companyLocation = job.company
    ? [job.company.city, job.company.state, job.company.country].filter(Boolean).join(", ")
    : null;
  const skills = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];
  const perks = job.benefits ? job.benefits.split(",").map((p) => p.trim()) : [];

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{ background: COLORS.background, minHeight: "100vh" }}>
      <div className="container py-5">

        {/* Back Button */}
        <button
          className="btn btn-sm btn-outline-secondary mb-4 d-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <BiArrowBack /> Back
        </button>

        <div className="row g-4">
          {/* ─── Left Content ─── */}
          <div className="col-lg-8">

            {/* Job Header Card */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
              <div className="d-flex align-items-start gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "contain", background: "#f3f3f3", padding: 8 }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 12, background: COLORS.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BiBuildings size={32} color={COLORS.primary} />
                  </div>
                )}
                <div className="flex-grow-1">
                  <h4 className="fw-bold mb-1" style={{ color: COLORS.textDark }}>{job.title}</h4>
                  <p className="text-muted mb-1 fw-semibold">{companyName}</p>
                  <div className="d-flex flex-wrap gap-3 text-muted small mt-2">
                    <span><FaMapMarkerAlt className="me-1" />{job.location || "Location N/A"}</span>
                    <span><FaBriefcase className="me-1" />{job.type || "Full Time"}</span>
                    <span><FaRegClock className="me-1" />{job.workMode || "Onsite"}</span>
                    {job.salary && <span><BiRupee className="me-1" />{job.salary}</span>}
                    {job.experience && <span><BiTime className="me-1" />{job.experience}</span>}
                  </div>
                  {job.applyDeadline && (
                    <p className="small mt-2 mb-0" style={{ color: COLORS.danger }}>
                      <BiCalendar className="me-1" />
                      Apply by: {new Date(job.applyDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                <button
                  className="btn btn-sm"
                  style={{ color: isSaved ? COLORS.primary : COLORS.textMuted, background: "transparent", border: "none" }}
                  onClick={handleToggleSave}
                  title={isSaved ? "Unsave Job" : "Save Job"}
                >
                  {isSaved ? <BiBookmarkHeart size={26} /> : <BiBookmark size={26} />}
                </button>
              </div>

              {/* CTA Buttons */}
              <div className="mt-4 d-flex gap-3 flex-wrap">
                {hasApplied ? (
                  <div className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill"
                    style={{ background: "#d1fae5", color: COLORS.success, fontWeight: 600 }}>
                    <BiCheckCircle size={18} /> Applied Successfully
                  </div>
                ) : (
                  <button
                    className="btn px-4 py-2 rounded-pill fw-semibold"
                    style={{ background: COLORS.accent, color: "#fff", border: "none" }}
                    onClick={openModal}
                  >
                    Apply Now
                  </button>
                )}
                <button
                  className="btn px-4 py-2 rounded-pill fw-semibold"
                  style={{ border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, background: "transparent" }}
                  onClick={() => navigate("/user/messages", {
                    state: {
                      contact: {
                        id: job.company?.id,
                        name: job.company?.companyName || job.companyName,
                        avatar: job.company?.profileImg || null,
                        contactType: "company"
                      }
                    }
                  })}
                >
                  Message Recruiter
                </button>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-3" style={{ color: COLORS.primary }}>Job Description</h5>
                <p className="text-muted" style={{ lineHeight: 1.8 }}>{job.description}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-3" style={{ color: COLORS.primary }}>Required Skills</h5>
                <div className="d-flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="px-3 py-2 rounded-pill small fw-semibold"
                      style={{ background: COLORS.background, border: `1px solid ${COLORS.border}`, color: COLORS.textDark }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {perks.length > 0 && (
              <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-3" style={{ color: COLORS.primary }}>Perks & Benefits</h5>
                <div className="d-flex flex-wrap gap-2">
                  {perks.map((perk, i) => (
                    <span key={i} className="px-3 py-2 rounded-pill small"
                      style={{ background: "#f0fdf4", border: `1px solid #bbf7d0`, color: COLORS.success }}>
                      <BiCheckCircle className="me-1" />{perk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Sidebar ─── */}
          <div className="col-lg-4">
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
              <h6 className="fw-bold mb-3" style={{ color: COLORS.primary }}>Job Summary</h6>
              {[
                { label: "Posted", value: new Date(job.createdAt).toLocaleDateString("en-IN") },
                { label: "Job Type", value: job.type },
                { label: "Work Mode", value: job.workMode },
                { label: "Experience", value: job.experience },
                { label: "Salary", value: job.salary },
                { label: "Openings", value: job.openings },
              ].filter(r => r.value).map((row, i) => (
                <div key={i} className="d-flex justify-content-between border-bottom py-2 small">
                  <span className="text-muted">{row.label}</span>
                  <span className="fw-semibold" style={{ color: COLORS.textDark }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Company Card */}
            {job.company && (
              <div className="bg-white rounded-4 shadow-sm p-4">
                <h6 className="fw-bold mb-3" style={{ color: COLORS.primary }}>About the Company</h6>
                <div className="d-flex align-items-center gap-3 mb-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt="company" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "contain", background: "#f3f3f3" }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: COLORS.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BiBuildings size={22} color={COLORS.primary} />
                    </div>
                  )}
                  <div>
                    <p className="fw-semibold mb-0" style={{ color: COLORS.textDark }}>{companyName}</p>
                    {job.company?.industry && <p className="small text-muted mb-0">{job.company.industry}</p>}
                  </div>
                </div>
                {job.company?.website && (
                  <a href={job.company.website} target="_blank" rel="noreferrer"
                    className="small d-flex align-items-center gap-1 mt-2"
                    style={{ color: COLORS.accent, textDecoration: "none" }}>
                    <BiLinkExternal /> Visit Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════ APPLY MODAL ═══════════════════ */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.55)", zIndex: 2000 }}>
          <div className="bg-white rounded-4 shadow-lg d-flex flex-column"
            style={{ width: "min(95vw, 600px)", maxHeight: "90vh" }}>

            {/* Modal Header */}
            <div className="px-4 pt-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: COLORS.primary }}>Apply for Position</h5>
                <p className="text-muted small mb-0">{job.title} · {companyName}</p>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>

            {/* Modal Body */}
            <div className="px-4 py-3" style={{ overflowY: "auto", flex: 1 }}>

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name *</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.fullName ? "is-invalid" : ""}`}
                  placeholder="Your full name"
                  value={applyForm.fullName}
                  onChange={(e) => {
                    setApplyForm((p) => ({ ...p, fullName: e.target.value }));
                    if (formErrors.fullName) setFormErrors((p) => ({ ...p, fullName: "" }));
                  }}
                />
                {formErrors.fullName && <div className="invalid-feedback">{formErrors.fullName}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address *</label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                  placeholder="you@example.com"
                  value={applyForm.email}
                  onChange={(e) => {
                    setApplyForm((p) => ({ ...p, email: e.target.value }));
                    if (formErrors.email) setFormErrors((p) => ({ ...p, email: "" }));
                  }}
                />
                {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Phone Number *</label>
                <input
                  type="tel"
                  className={`form-control ${formErrors.phone ? "is-invalid" : ""}`}
                  placeholder="10-digit mobile number"
                  value={applyForm.phone}
                  maxLength={10}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setApplyForm((p) => ({ ...p, phone: val }));
                    if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: "" }));
                  }}
                />
                {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
              </div>

              {/* Resume Upload */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Resume (PDF, max 5 MB) *</label>
                <div className={`border rounded-3 p-3 d-flex align-items-center gap-3 ${formErrors.resume ? "border-danger" : ""}`}
                  style={{ background: COLORS.background, cursor: "pointer" }}
                  onClick={() => document.getElementById("resumeInput").click()}>
                  <BiUpload size={22} color={COLORS.primary} />
                  <div className="flex-grow-1">
                    {applyForm.resumeName
                      ? <><span className="fw-semibold text-success small">{applyForm.resumeName}</span></>
                      : <span className="text-muted small">Click to upload your resume (PDF only)</span>
                    }
                  </div>
                  {applyForm.resumeName && <BiCheckCircle color={COLORS.success} size={20} />}
                </div>
                <input id="resumeInput" type="file" accept=".pdf" className="d-none" onChange={handleResumeUpload} />
                {formErrors.resume && <div className="text-danger small mt-1">{formErrors.resume}</div>}
              </div>

              {/* Cover Letter */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold small mb-0">Cover Letter (optional)</label>
                  <button
                    className="btn btn-sm btn-link text-decoration-none p-0 d-flex align-items-center gap-1 fw-semibold"
                    style={{ color: COLORS.accent, fontSize: "0.8rem" }}
                    onClick={handleGenerateCoverLetter}
                    disabled={isGenerating}
                    type="button"
                  >
                    {isGenerating
                      ? <><div className="spinner-border spinner-border-sm" role="status" /> Generating...</>
                      : <><HiSparkles /> AI Generate</>
                    }
                  </button>
                </div>
                <textarea
                  rows={5}
                  className={`form-control ${isGenerating ? "text-muted" : ""} ${formErrors.coverLetter ? "is-invalid" : ""}`}
                  placeholder="Write a short cover letter..."
                  value={applyForm.coverLetter}
                  onChange={(e) => {
                    setApplyForm((p) => ({ ...p, coverLetter: e.target.value }));
                    if (formErrors.coverLetter) setFormErrors((p) => ({ ...p, coverLetter: "" }));
                  }}
                  disabled={isGenerating}
                />
                {formErrors.coverLetter && <div className="invalid-feedback">{formErrors.coverLetter}</div>}
                <div className="text-end small text-muted mt-1">{applyForm.coverLetter.length} chars</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-top d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary px-4" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="btn px-4 fw-semibold d-flex align-items-center gap-2"
                style={{ background: COLORS.accent, color: "#fff", border: "none" }}
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying
                  ? <><div className="spinner-border spinner-border-sm" role="status" /> Submitting...</>
                  : "Submit Application"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ TOAST ═══════════════════ */}
      {toast.msg && (
        <div
          className="position-fixed bottom-0 end-0 m-4 px-4 py-3 rounded-3 shadow-lg d-flex align-items-center gap-2"
          style={{
            background: toast.type === "success" ? COLORS.success : COLORS.danger,
            color: "#fff",
            fontWeight: 500,
            zIndex: 3000,
            animation: "fadeInUp 0.3s ease",
            maxWidth: 380,
          }}
        >
          {toast.type === "success" ? <BiCheckCircle size={20} /> : null}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default JobDetails;
