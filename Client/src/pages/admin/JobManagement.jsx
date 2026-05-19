import React, { useState, useMemo, useEffect } from "react";
import api from "../../utils/api";
import { FaBan, FaCheckCircle, FaEye, FaSearch, FaTrash, FaSyncAlt, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaUserAlt, FaCalendarAlt, FaTools, FaGift } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

/* ================= THEME ================= */
const COLORS = {
  primary: "rgb(0, 115, 177)",
  secondary: "#f4f9fd",
  white: "#ffffff",
  border: "#e4ecf4",
  textDark: "#1f1f1f",
  textLight: "#606770",
  success: "#137333",
  danger: "#b3261e",
  warning: "#b06000",
  muted: "#e8eaed",
};

/* ================= MAIN ================= */
export default function JobManagement() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewJob, setViewJob] = useState(null);

  const [rejectJob, setRejectJob] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const ITEMS_PER_PAGE = 10;
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/jobs");
      if (response.data.success) {
        const mapped = response.data.jobs.map(j => ({
          id: j.id,
          title: j.title || "Untitled Job",
          company: j.company?.companyName || j.companyName || "Unknown Company",
          email: j.company?.email || "N/A",
          location: j.location || "Remote",
          type: j.type || "Full Time",
          workMode: j.workMode || "Onsite",
          experience: j.experience || "Entry Level",
          salary: j.salary || "Not Disclosed",
          openings: j.openings || 1,
          skills: j.skills || "N/A",
          benefits: j.benefits || "N/A",
          applyDeadline: j.applyDeadline ? new Date(j.applyDeadline).toLocaleDateString('en-GB') : "No Deadline",
          status: j.status,
          postedAt: new Date(j.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          description: j.description || "No description provided.",
          raw: j
        }));
        setJobs(mapped);
      }
    } catch (error) {
      showToast("Failed to fetch jobs", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  /* ================= FILTER ================= */
  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        (statusFilter === "All" || j.status === statusFilter) &&
        ((j.title?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (j.company?.toLowerCase().includes(search.toLowerCase()) ?? false))
    );
  }, [jobs, search, statusFilter]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= ACTION HANDLERS ================= */
  const confirmStatusChange = async () => {
    const { job, status } = confirmAction;
    try {
      const response = await api.patch(`/admin/jobs/${job.id}/status`, { status });
      if (response.data.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status } : j))
        );
        showToast(`Job listing is now ${status}`, "success");
      }
    } catch (error) {
      showToast("Failed to update job status", "error");
    } finally {
      setConfirmAction(null);
    }
  };

  const confirmRejection = async () => {
    try {
      const response = await api.patch(`/admin/jobs/${rejectJob.id}/status`, { status: "Rejected", reason: rejectReason });
      if (response.data.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === rejectJob.id ? { ...j, status: "Rejected" } : j))
        );
        showToast(`Job posting rejected`, "error");
        setRejectJob(null);
      }
    } catch (error) {
      showToast("Failed to reject job", "error");
    }
  };

  const removeSpam = async () => {
    try {
      const response = await api.delete(`/admin/jobs/${deleteJob.id}`);
      if (response.data.success) {
        setJobs((prev) => prev.filter((j) => j.id !== deleteJob.id));
        showToast("Listing permanently removed", "success");
      }
    } catch (error) {
      showToast("Failed to delete listing", "error");
    } finally {
      setDeleteJob(null);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div style={{ padding: "10px 20px" }}>
        {/* ##### HEADER ##### */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-4 border shadow-sm">
          <div>
            <h4 className="fw-bold mb-1">Job Management</h4>
            <p className="text-muted small mb-0">Oversee job postings, verify details, and manage listings.</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" style={{ fontSize: "14px" }} onClick={fetchJobs}>
            <FaSyncAlt className={isLoading ? "fa-spin" : ""} /> Refresh
          </button>
        </div>

        {/* ##### SEARCH & FILTER ##### */}
        <div className="mb-4 p-4 rounded-4 bg-white border shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Job Search</label>
              <div className="position-relative">
                <FaSearch style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", color: COLORS.textLight }} />
                <input
                  className="form-control ps-5 rounded-pill border-2"
                  style={{ height: "45px", fontSize: "14px" }}
                  placeholder="Search by title, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Display Category</label>
              <select className="form-select rounded-pill border-2" style={{ height: "45px", fontSize: "14px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Postings</option>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Live Listings</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Archived / Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* ##### TABLE ##### */}
        <div className="table-responsive rounded-4 border bg-white shadow-sm overflow-hidden">
          <table className="table align-middle mb-0">
            <thead style={{ background: "rgb(0, 115, 177)" }}>
              <tr>
                <th className="ps-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Job Opportunity</th>
                <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Partner Company</th>
                <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Status</th>
                <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Publication Date</th>
                <th className="text-end pe-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="ps-4 py-3"><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "150px" }}></div></td>
                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "120px" }}></div></td>
                    <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "100px" }}></div></td>
                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "80px" }}></div></td>
                    <td className="text-end pe-4"><div className="skeleton skeleton-pulse" style={{ width: 120, height: 32, borderRadius: "8px" }}></div></td>
                  </tr>
                ))
              ) : filteredJobs.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5">No job postings found.</td></tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="transition-all table-row-hover">
                    <td className="ps-4 py-3">
                      <div className="fw-bold text-dark">{job.title}</div>
                      <div className="small text-muted fw-medium" style={{ fontSize: "11px" }}>{job.type} • {job.location}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{job.company}</div>
                      <div className="small text-muted" style={{ fontSize: "11px" }}>{job.email}</div>
                    </td>
                    <td>
                      <span className="px-3 py-1 rounded-pill small fw-bold" style={{
                        background: job.status === "Approved" ? "#e6f4ea" : job.status === "Pending" ? "#fff4e5" : job.status === "Expired" ? "#f1f3f4" : "#fdecea",
                        color: job.status === "Approved" ? COLORS.success : job.status === "Pending" ? COLORS.warning : job.status === "Expired" ? COLORS.textLight : COLORS.danger,
                        fontSize: "10px"
                      }}>
                        {job.status}
                      </span>
                    </td>
                    <td className="text-muted small fw-medium">{job.postedAt}</td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setViewJob(job)} title="View Listing"><FaEye size={14} className="text-primary" /></button>

                        {job.status === "Pending" && (
                          <>
                            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setConfirmAction({ job, status: "Approved" })} title="Approve Post"><FaCheckCircle size={14} className="text-success" /></button>
                            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setRejectJob(job)} title="Decline Post"><FaBan size={14} className="text-danger" /></button>
                          </>
                        )}

                        <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setDeleteJob(job)} title="Flag Spam"><FaTrash size={14} className="text-muted" /></button>

                        <select className="form-select form-select-sm d-inline-block rounded-3 border-2 fw-bold" style={{ width: 120, fontSize: "11px" }} value={job.status} onChange={(e) => setConfirmAction({ job, status: e.target.value })}>
                          <option value="Pending">Status</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ##### PAGINATION ##### */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4 px-3">
            <span className="text-muted small fw-bold">Showing {paginatedJobs.length} of {filteredJobs.length} Postings</span>
            <div className="d-flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`btn btn-sm rounded-3 fw-bold p-0 ${currentPage === i + 1 ? 'btn-primary shadow-sm' : 'btn-light border'}`} style={{ width: 32, height: 32, fontSize: "12px" }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ##### MODALS ##### */}
        {viewJob && (
          <Modal title="Detailed Job Overview" close={() => setViewJob(null)}>
            <div className="p-0">
              {/* --- HEADER --- */}
              <div className="d-flex align-items-center gap-4 mb-4 p-4 rounded-top-5" style={{ background: "rgb(0, 115, 177)", margin: "-24px -24px 24px -24px" }}>
                <div className="rounded-4 bg-white p-3 shadow-lg d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, minWidth: 80 }}>
                  <span className="fw-bold text-primary display-6">{viewJob.company.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="fw-bold text-white mb-1">{viewJob.title}</h4>
                  <div className="d-flex align-items-center gap-2 text-white text-opacity-75 small fw-medium">
                    <FaMapMarkerAlt /> {viewJob.company} • {viewJob.location}
                  </div>
                </div>
              </div>

              {/* --- KEY INFO GRID --- */}
              <div className="row g-3 mb-4">
                {[
                  { label: "Salary", value: viewJob.salary, icon: <FaMoneyBillWave />, color: "#e8f5e9", iconColor: "#2e7d32" },
                  { label: "Experience", value: viewJob.experience, icon: <FaUserAlt />, color: "#e3f2fd", iconColor: "#1565c0" },
                  { label: "Work Type", value: `${viewJob.type} (${viewJob.workMode})`, icon: <FaClock />, color: "#fff3e0", iconColor: "#ef6c00" },
                  { label: "Openings", value: `${viewJob.openings} Positions`, icon: <FaUserAlt />, color: "#f3e5f5", iconColor: "#7b1fa2" },
                ].map((item, idx) => (
                  <div key={idx} className="col-6">
                    <div className="p-3 rounded-4 border d-flex flex-column gap-1" style={{ background: item.color }}>
                      <div className="d-flex align-items-center gap-2 mb-1" style={{ color: item.iconColor }}>
                        {item.icon} <span className="small fw-bold text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>{item.label}</span>
                      </div>
                      <span className="fw-bold text-dark small">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- CONTENT SECTION --- */}
              <div className="d-grid gap-4">
                <section>
                  <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                    <FaCalendarAlt size={14} />
                    <h6 className="fw-bold mb-0 small text-uppercase" style={{ letterSpacing: "1px" }}>Timeline</h6>
                  </div>
                  <div className="p-3 rounded-4 border bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted small d-block" style={{ fontSize: "10px" }}>POSTED ON</span>
                      <span className="fw-bold small">{viewJob.postedAt}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-muted small d-block" style={{ fontSize: "10px" }}>APPLICATION DEADLINE</span>
                      <span className="fw-bold small text-danger">{viewJob.applyDeadline}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                    <FaTools size={14} />
                    <h6 className="fw-bold mb-0 small text-uppercase" style={{ letterSpacing: "1px" }}>Skills Required</h6>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {viewJob.skills.split(',').map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-pill bg-white border small fw-bold text-muted shadow-sm" style={{ fontSize: "11px" }}>{skill.trim()}</span>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                    <FaGift size={14} />
                    <h6 className="fw-bold mb-0 small text-uppercase" style={{ letterSpacing: "1px" }}>Benefits</h6>
                  </div>
                  <p className="mb-0 small fw-medium text-dark bg-light p-3 rounded-4 border" style={{ lineHeight: "1.6" }}>{viewJob.benefits}</p>
                </section>

                <section className="mb-2">
                  <h6 className="fw-bold mb-2 small text-uppercase text-primary" style={{ letterSpacing: "1px" }}>Job Description</h6>
                  <div className="p-4 rounded-4 border bg-white shadow-sm" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    <p className="mb-0 small fw-medium text-dark" style={{ lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{viewJob.description}</p>
                  </div>
                </section>
              </div>

              <button className="btn btn-primary w-100 mt-4 rounded-pill py-3 fw-bold shadow-lg" onClick={() => setViewJob(null)}>CLOSE ANALYSIS</button>
            </div>
          </Modal>
        )}

        {rejectJob && (
          <Modal title="Listing Denial" close={() => setRejectJob(null)}>
            <div className="p-2">
              <label className="small fw-bold text-muted text-uppercase mb-2" style={{ fontSize: "10px" }}>Reason for Denial</label>
              <textarea className="form-control border-2 rounded-4 mb-4 p-3" rows={4} placeholder="Rationale for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              <button className="btn btn-danger w-100 rounded-4 py-3 fw-bold shadow-sm" disabled={!rejectReason.trim()} onClick={confirmRejection}>
                CONFIRM REJECTION
              </button>
            </div>
          </Modal>
        )}

        {confirmAction && (
          <Modal title="Confirm Action" close={() => setConfirmAction(null)}>
            <div className="p-2">
              <p className="mb-4 text-center fw-medium text-dark">Change status to <strong>{confirmAction.status}</strong>?</p>
              <div className="d-flex gap-3">
                <button className="btn btn-primary w-100 rounded-4 py-3 fw-bold shadow-sm" onClick={confirmStatusChange}>EXECUTE</button>
                <button className="btn btn-light border w-100 rounded-4 py-3 fw-bold" onClick={() => setConfirmAction(null)}>ABORT</button>
              </div>
            </div>
          </Modal>
        )}

        {deleteJob && (
          <Modal title="Irreversible Action" close={() => setDeleteJob(null)}>
            <div className="text-center p-3">
              <div className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 70, height: 70 }}>
                <FaTrash size={30} />
              </div>
              <h5 className="fw-bold mb-2">Remove Listing?</h5>
              <p className="text-muted small mb-4">
                You are about to permanently remove <br />
                <strong className="text-danger">{deleteJob.title}</strong> from the feed.
                <br /><br />
                <span className="fw-bold text-dark">This action cannot be undone.</span>
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-danger rounded-4 py-3 fw-bold shadow-sm" onClick={removeSpam}>
                  REMOVE PERMANENTLY
                </button>
                <button className="btn btn-light border rounded-4 py-3 fw-bold" onClick={() => setDeleteJob(null)}>
                  CANCEL
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
      <style>{`
      /* Custom Scrollbar */
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: ${COLORS.primary}; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: "rgb(0, 115, 177)"; }
    `}</style>
    </>
  );
}

const Modal = ({ title, children, close }) => (
  <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ background: "rgba(0,10,25,0.7)", zIndex: 2000, backdropFilter: "blur(5px)" }}>
    <div className="bg-white rounded-5 p-4 shadow-lg border-0 animate-fade-up custom-scrollbar" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h6 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: "1px", fontSize: "14px", color: COLORS.primary }}>{title}</h6>
        <button className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }} onClick={close}>✕</button>
      </div>
      {children}
    </div>
  </div>
);
