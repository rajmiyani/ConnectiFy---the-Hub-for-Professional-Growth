import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaUsers,
  FaGlobe,
  FaBriefcase,
  FaCalendarAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaStar,
  FaCheckCircle,
  FaBullseye,
  FaHeart,
  FaIndustry,
  FaEdit,
  FaTimes,
  FaPlus,
  FaCamera,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";

/* ================= THEME ================= */
const COLORS = {
  primary: "#0073b1",
  secondary: "#e8f4fb",
  success: "#137333",
  border: "#dee2e6",
  bg: "#f8f9fb",
  white: "#ffffff",
  textDark: "#1f1f1f",
  textLight: "#6b7280",
};

/* ================= MAIN ================= */
export default function CompanyProfile({ mode = "own" }) {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const isOwnProfile = mode === "own";
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State for Editing
  const [editForm, setEditForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const companyData = user?.company || user || {};

  const openEdit = (section) => {
    setActiveSection(section);
    setEditForm({ ...companyData });
    setFormErrors({});
    setShowModal(true);
  };

  const validateEdit = () => {
    let errs = {};
    if (activeSection === "About Us" && !editForm.about?.trim()) errs.about = "About description is required";
    if (activeSection === "Company Information") {
      if (!editForm.companyName?.trim()) errs.companyName = "Company name is required";
      if (editForm.website && !/^https?:\/\/.+/.test(editForm.website)) errs.website = "Invalid URL";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    setLoading(true);
    try {
      // For now, convert to base64 or you can implement a separate upload endpoint
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;
        const response = await api.put(`/companies/profile/${companyData.id}`, { [type]: base64 });
        if (response.data.success) {
          showToast(`${type === "profileImg" ? "Profile Picture" : "Banner"} updated!`, "success");
          setUser(prev => ({ ...prev, ...response.data.data }));
        }
      };
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Failed to upload image", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateEdit()) return;

    setLoading(true);
    try {
      const response = await api.put(`/companies/profile/${companyData.id}`, editForm);

      if (response.data.success) {
        showToast("Profile updated successfully!", "success");
        setUser(prev => ({ ...prev, ...response.data.data }));
        setShowModal(false);
      } else {
        showToast(response.data.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("Server error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    if (!companyData.id) return;
    setJobsLoading(true);
    try {
      const response = await api.get(`/companies/jobs/my-jobs/${companyData.id}`);
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [companyData.id]);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      {/* ================= COVER ================= */}
      <div
        className="position-relative"
        style={{
          height: 220,
          background: companyData.coverPhoto ? `url(${companyData.coverPhoto}) center/cover` : `linear-gradient(135deg, ${COLORS.primary}, #004182)`,
        }}
      >
        {isOwnProfile && (
          <button
            className="btn btn-sm btn-light position-absolute bottom-0 end-0 m-3 shadow-sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => handleImageUpload(e.target.files[0], "coverPhoto");
              input.click();
            }}
          >
            <FaCamera className="me-1" /> Edit Banner
          </button>
        )}
      </div>

      <div className="container" style={{ marginTop: -90 }}>
        {/* ================= COMPANY CARD ================= */}
        <div className="bg-white rounded-4 shadow p-4 mb-4 position-relative">
          {isOwnProfile && <EditBtn onClick={() => openEdit("Company Information")} />}

          <div className="d-flex flex-wrap align-items-center gap-4">
            <div className="position-relative">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center shadow overflow-hidden"
                style={{
                  width: 100,
                  height: 100,
                  background: COLORS.primary,
                  color: "#fff",
                  fontSize: 38,
                  fontWeight: "bold",
                }}
              >
                {companyData.profileImg ? (
                  <img src={companyData.profileImg} alt="Logo" className="w-100 h-100 object-fit-cover" />
                ) : (
                  companyData.companyName?.charAt(0) || "C"
                )}
              </div>
              {isOwnProfile && (
                <div
                  className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, cursor: "pointer", border: `1px solid ${COLORS.border}` }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => handleImageUpload(e.target.files[0], "profileImg");
                    input.click();
                  }}
                >
                  <FaCamera size={14} className="text-primary" />
                </div>
              )}
            </div>

            <div className="flex-grow-1">
              <h3 className="fw-bold mb-1">{companyData.companyName || "ConnectiFy Business"}</h3>
              <div className="text-muted mb-2">
                {companyData.tagline || "Your professional business identity"}
              </div>

              <div className="d-flex flex-wrap gap-3 small text-muted">
                <span><FaBuilding /> {companyData.industry || "Industry"}</span>
                <span><FaMapMarkerAlt /> {companyData.city || "Location"}, {companyData.country || "Country"}</span>
                <span><FaCalendarAlt /> Est. {companyData.foundedYear || "N/A"}</span>
                <span><FaUsers /> {companyData.companySize || "Size"} Employees</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= HIGHLIGHTS ================= */}
        <div className="row g-4 mb-4">
          <Highlight icon={<FaBriefcase />} label="Projects Delivered" value="120+" />
          <Highlight icon={<FaGlobe />} label="Global Clients" value="10+" />
          <Highlight icon={<FaStar />} label="Client Satisfaction" value="4.8 / 5" />
          <Highlight icon={<FaUsers />} label="Team Strength" value="50+" />
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="row g-4">
          {/* LEFT */}
          <div className="col-lg-8">
            <Section title="About Us" onEdit={isOwnProfile ? openEdit : null}>
              <p className="text-muted">
                {companyData.about || "Describe your company's story, values, and impact here."}
              </p>
            </Section>

            <Section title="Mission & Vision">
              <div className="row g-3">
                <div className="col-md-6">
                  <Card
                    icon={<FaBullseye />}
                    title="Our Mission"
                    text={companyData.mission || "To empower businesses through reliable digital solutions."}
                  />
                </div>
                <div className="col-md-6">
                  <Card
                    icon={<FaHeart />}
                    title="Our Vision"
                    text={companyData.vision || "To become a trusted global technology partner."}
                  />
                </div>
              </div>
            </Section>

            <Section title="Services" onEdit={isOwnProfile ? openEdit : null}>
              <div className="row g-3">
                {(companyData.services
                  ? companyData.services.split(",").map((s) => s.trim())
                  : [
                    "Web & Mobile Development",
                    "Custom CRM / ERP Systems",
                    "Cloud & DevOps Solutions",
                    "UI/UX Design",
                  ]
                ).map((s) => (
                  <div key={s} className="col-md-6">
                    <FaCheckCircle style={{ color: COLORS.success }} /> {s}
                  </div>
                ))}
              </div>
            </Section>

            {/* ✅ Industries */}
            <Section title="Industries We Serve" onEdit={isOwnProfile ? null : null}>
              <div className="d-flex flex-wrap gap-2">
                {[
                  "E-Commerce",
                  "Healthcare",
                  "Education",
                  "Finance",
                  "Food Delivery",
                  "Startups",
                ].map((i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-pill small fw-semibold"
                    style={{
                      background: COLORS.secondary,
                      color: COLORS.primary,
                    }}
                  >
                    <FaIndustry className="me-1" /> {i}
                  </span>
                ))}
              </div>
            </Section>

            {/* ✅ Tech Stack */}
            <Section title="Technology Stack" onEdit={isOwnProfile ? openEdit : null}>
              <div className="d-flex flex-wrap gap-2">
                {(companyData.techStack
                  ? companyData.techStack.split(",").map((t) => t.trim())
                  : [
                    "React.js",
                    "Next.js",
                    "Node.js",
                    "MongoDB",
                    "TypeScript",
                    "AWS",
                    "Docker",
                    "Firebase",
                  ]
                ).map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-pill small fw-semibold"
                    style={{
                      background: COLORS.secondary,
                      color: COLORS.primary,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          </div>

          {/* RIGHT */}
          <div className="col-lg-4">
            {/* ✅ Open Positions */}
            <Section title="Open Positions">
              {jobsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary"></div>
                </div>
              ) : jobs.length > 0 ? (
                jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="border-bottom py-2">
                    <strong style={{ color: COLORS.textDark }}>{job.title}</strong>
                    <div className="small text-muted">
                      {job.type} • {job.location}
                    </div>
                  </div>
                ))
              ) : (
                <div className="small text-muted py-2">No open positions currently available.</div>
              )}
            </Section>

            <Section title="Contact Information" onEdit={isOwnProfile ? openEdit : null}>
              <div className="small text-muted mb-2">
                <FaEnvelope className="me-2" /> {companyData.email || "Email N/A"}
              </div>
              <div className="small text-muted mb-2">
                <FaPhoneAlt className="me-2" /> {companyData.phone || "Phone N/A"}
              </div>
              <div className="small text-muted">
                <FaGlobe className="me-2" /> {companyData.website || "Website N/A"}
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <EditModal
          title={activeSection}
          onClose={() => setShowModal(false)}
          onSave={handleUpdate}
          loading={loading}
          form={editForm}
          setForm={setEditForm}
          errors={formErrors}
        />
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

const EditBtn = ({ onClick }) => (
  <FaEdit
    onClick={onClick}
    title="Edit"
    style={{
      position: "absolute",
      top: 16,
      right: 16,
      cursor: "pointer",
      color: COLORS.primary,
    }}
  />
);

const Section = ({ title, children, onEdit }) => (
  <div className="bg-white rounded-4 shadow-sm p-4 mb-4 position-relative">
    {onEdit && <EditBtn onClick={() => onEdit(title)} />}
    <h6 className="fw-bold mb-3">{title}</h6>
    {children}
  </div>
);

const Highlight = ({ icon, label, value }) => (
  <div className="col-md-3 col-6">
    <div className="bg-white rounded-4 shadow-sm p-3 text-center">
      <div className="fs-4 mb-1" style={{ color: COLORS.primary }}>{icon}</div>
      <div className="fw-bold">{value}</div>
      <div className="small text-muted">{label}</div>
    </div>
  </div>
);

const Card = ({ icon, title, text }) => (
  <div className="border rounded-4 p-3 h-100">
    <div className="fs-4 mb-2" style={{ color: COLORS.primary }}>{icon}</div>
    <h6 className="fw-bold">{title}</h6>
    <p className="small text-muted mb-0">{text}</p>
  </div>
);

/* ================= MODAL ================= */

const EditModal = ({ title, onClose, onSave, loading, form, setForm, errors }) => {
  const renderFields = () => {
    switch (title) {
      case "Company Information":
        return (
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Company Name</label>
              <input
                className={`form-control ${errors.companyName && "is-invalid"}`}
                value={form.companyName || ""}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
              {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Industry</label>
              <input
                className="form-control"
                value={form.industry || ""}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </div>
            <div className="col-12 mb-3">
              <label className="form-label fw-semibold">Tagline</label>
              <input
                className="form-control"
                value={form.tagline || ""}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="A short punchy line about your company"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Company Size</label>
              <input
                className="form-control"
                value={form.companySize || ""}
                onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                placeholder="e.g. 50-100"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Founded Year</label>
              <input
                className="form-control"
                value={form.foundedYear || ""}
                onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
                placeholder="e.g. 2010"
              />
            </div>
          </div>
        );
      case "About Us":
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold">About Description</label>
            <textarea
              rows="5"
              className={`form-control ${errors.about && "is-invalid"}`}
              value={form.about || ""}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              placeholder="Tell us about your company..."
            />
            {errors.about && <div className="invalid-feedback">{errors.about}</div>}
          </div>
        );
      case "Mission & Vision":
        return (
          <div className="row">
            <div className="col-12 mb-3">
              <label className="form-label fw-semibold">Our Mission</label>
              <textarea
                rows="3"
                className="form-control"
                value={form.mission || ""}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
              />
            </div>
            <div className="col-12 mb-3">
              <label className="form-label fw-semibold">Our Vision</label>
              <textarea
                rows="3"
                className="form-control"
                value={form.vision || ""}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
              />
            </div>
          </div>
        );
      case "Contact Information":
        return (
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Phone</label>
              <input
                className="form-control"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Website URL</label>
              <input
                className="form-control"
                value={form.website || ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">City</label>
              <input
                className="form-control"
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">State</label>
              <input
                className="form-control"
                value={form.state || ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Country</label>
              <input
                className="form-control"
                value={form.country || ""}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>
        );
      case "Services":
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold">Services (comma separated)</label>
            <textarea
              rows="3"
              className="form-control"
              value={form.services || ""}
              onChange={(e) => setForm({ ...form, services: e.target.value })}
              placeholder="e.g. Web Development, Mobile Development, UI/UX"
            />
          </div>
        );
      case "Technology Stack":
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold">Tech Stack (comma separated)</label>
            <textarea
              rows="3"
              className="form-control"
              value={form.techStack || ""}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
              placeholder="e.g. React, Node.js, MongoDB"
            />
          </div>
        );
      default:
        return (
          <p className="text-center text-muted">This section is currently under development.</p>
        );
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ background: "rgba(0,0,0,0.6)", zIndex: 999 }}
    >
      <div className="bg-white rounded-4 shadow-lg p-4" style={{ width: 600 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Edit {title}</h5>
          <FaTimes style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        <div style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "hidden" }}>
          {renderFields()}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-light" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn text-white px-4"
            style={{ background: COLORS.primary, opacity: loading ? 0.7 : 1 }}
            onClick={onSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
