import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import {
    FaEye,
    FaBriefcase,
    FaCheckCircle,
    FaFileAlt,
    FaSearch,
    FaRedo,
    FaSyncAlt,
    FaBuilding,
    FaEnvelope,
    FaGlobe,
    FaIndustry,
    FaMapMarkerAlt,
    FaCalendarPlus,
    FaClock
} from "react-icons/fa";

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
};

/* ================= MAIN ================= */
export default function CompanyManagement() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [viewCompany, setViewCompany] = useState(null);
    const [viewJobs, setViewJobs] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [rejectCompany, setRejectCompany] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    const ITEMS_PER_PAGE = 10;
    const [companies, setCompanies] = useState([]);

    const fetchCompanies = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/admin/companies");
            if (response.data.success) {
                const mapped = response.data.companies.map(c => ({
                    id: c.id,
                    name: c.companyName || "Unknown Company",
                    email: c.email || "N/A",
                    status: c.isVerified ? "Approved" : (c.isActive ? "Pending" : "Rejected"),
                    verified: c.isVerified,
                    createdAt: new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    jobs: c.jobs || [], // Assuming backend populates jobs count or array
                    documents: {
                        industry: c.industry || "N/A",
                        location: `${c.city || ""}, ${c.state || ""}`.trim() || "N/A",
                        pincode: c.pincode || "N/A",
                        founded: c.foundedYear || "N/A"
                    },
                    raw: c
                }));
                setCompanies(mapped);
            }
        } catch (error) {
            showToast("Failed to fetch companies", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    /* ================= FILTER ================= */
    const filteredCompanies = useMemo(() => {
        return companies.filter(
            (c) =>
                (statusFilter === "All" || c.status === statusFilter) &&
                ((c.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                    (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false))
        );
    }, [companies, search, statusFilter]);

    const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
    const paginatedCompanies = filteredCompanies.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    /* ================= STATUS UPDATE ================= */
    const updateStatus = async (company, status) => {
        if (status === "Rejected") {
            setRejectCompany(company);
            setRejectReason("");
            return;
        }

        if (status === "Approved") {
            try {
                const response = await api.patch(`/admin/companies/${company.id}/approve`);
                if (response.data.success) {
                    setCompanies((prev) =>
                        prev.map((c) =>
                            c.id === company.id ? { ...c, status: "Approved", verified: true } : c
                        )
                    );
                    showToast(`${company.name} has been approved`, "success");
                }
            } catch (error) {
                showToast("Failed to approve company", "error");
            }
        }
    };

    /* ================= REJECT CONFIRM ================= */
    const confirmRejection = async () => {
        try {
            const response = await api.patch(`/admin/companies/${rejectCompany.id}/reject`, { reason: rejectReason });
            if (response.data.success) {
                setCompanies((prev) =>
                    prev.map((c) =>
                        c.id === rejectCompany.id ? { ...c, status: "Rejected", verified: false } : c
                    )
                );
                showToast(`${rejectCompany.name} application has been rejected`, "error");
                setRejectCompany(null);
            }
        } catch (error) {
            showToast("Failed to reject company", "error");
        }
    };

    /* ================= UI ================= */
    return (
        <div style={{ padding: "10px 20px" }}>
            {/* ##### HEADER ##### */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-4 border shadow-sm">
                <div>
                    <h4 className="fw-bold mb-1">Company Management</h4>
                    <p className="text-muted small mb-0">Approve, verify, and moderate company registrations.</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" style={{ fontSize: "14px" }} onClick={fetchCompanies}>
                    <FaSyncAlt className={isLoading ? "fa-spin" : ""} /> Refresh
                </button>
            </div>

            {/* ##### SEARCH & FILTER ##### */}
            <div className="mb-4 p-4 rounded-4 bg-white border shadow-sm">
                <div className="row g-3 align-items-end">
                    <div className="col-md-5">
                        <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Company Search</label>
                        <div className="position-relative">
                            <FaSearch style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", color: COLORS.textLight }} />
                            <input
                                className="form-control ps-5 rounded-pill border-2"
                                style={{ height: "45px", fontSize: "14px" }}
                                placeholder="Search by name, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-3">
                        <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Verification Status</label>
                        <select className="form-select rounded-pill border-2" style={{ height: "45px", fontSize: "14px" }} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Entities</option>
                            <option value="Pending">Pending Review</option>
                            <option value="Approved">Verified Partners</option>
                            <option value="Rejected">Flagged / Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ##### TABLE ##### */}
            <div className="table-responsive rounded-4 border bg-white shadow-sm overflow-hidden">
                <table className="table align-middle mb-0">
                    <thead style={{ background: "rgb(0, 115, 177)" }}>
                        <tr>
                            <th className="ps-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Partner Entity</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Email</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Approval</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Job Feed</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Registered</th>
                            <th className="text-end pe-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={`skeleton-${i}`} className="border-bottom">
                                    <td className="ps-4 py-3"><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "120px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "150px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "100px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "80px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "90px" }}></div></td>
                                    <td className="text-end pe-4"><div className="skeleton skeleton-pulse" style={{ width: 120, height: 32, borderRadius: "8px" }}></div></td>
                                </tr>
                            ))
                        ) : filteredCompanies.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-5">No companies found matching criteria.</td></tr>
                        ) : (
                            paginatedCompanies.map((c) => (
                                <tr key={c.id} className="transition-all table-row-hover border-bottom">
                                    <td className="ps-4 py-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="fw-bold text-dark">{c.name}</div>
                                            {c.verified && <FaCheckCircle className="text-primary" />}
                                        </div>
                                    </td>
                                    <td className="text-muted small fw-medium">{c.email}</td>
                                    <td>
                                        <span className={`badge ${c.verified ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${c.verified ? 'text-success' : 'text-warning'} rounded-pill px-3 py-2 fw-bold`} style={{ fontSize: "10px" }}>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-light border-2 rounded-pill px-3 fw-bold d-flex align-items-center gap-2" style={{ color: COLORS.primary, fontSize: "11px" }} onClick={() => setViewJobs(c)}>
                                            <FaBriefcase /> {c.jobs.length} Active
                                        </button>
                                    </td>
                                    <td className="text-muted small fw-medium">{c.createdAt}</td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setViewCompany(c)} title="View Detail"><FaEye size={14} className="text-primary" /></button>
                                            {!c.verified && (
                                                <select className="form-select form-select-sm d-inline-block rounded-3 border-2 fw-bold" style={{ width: 120, fontSize: "11px" }} value={c.status} onChange={(e) => updateStatus(c, e.target.value)}>
                                                    <option value="Pending">Process</option>
                                                    <option value="Approved">Approve</option>
                                                    <option value="Rejected">Reject</option>
                                                </select>
                                            )}
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
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <span className="text-muted small fw-bold">Showing {paginatedCompanies.length} of {filteredCompanies.length} Partners</span>
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
            {viewCompany && (
                <Modal title="Entity Profile Analysis" close={() => setViewCompany(null)}>
                    <div className="p-0">
                        {/* --- COMPANY HEADER --- */}
                        <div className="d-flex align-items-center gap-4 mb-4 p-4 rounded-top-5" style={{ background: "rgb(0, 115, 177)", margin: "-24px -24px 24px -24px" }}>
                            <div className="rounded-4 bg-white p-3 shadow-lg d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, minWidth: 80 }}>
                                <span className="fw-bold text-primary display-6">{viewCompany.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h4 className="fw-bold text-white mb-1">{viewCompany.name}</h4>
                                <div className="d-flex align-items-center gap-2 text-white text-opacity-75 small fw-medium">
                                    <FaEnvelope /> {viewCompany.email}
                                </div>
                            </div>
                        </div>

                        {/* --- INFO GRID --- */}
                        <div className="d-grid gap-3">
                            {[
                                { label: "Industry Sector", value: viewCompany.documents.industry, icon: <FaIndustry />, color: "#e8f4fb" },
                                { label: "Physical Location", value: viewCompany.documents.location, icon: <FaMapMarkerAlt />, color: "#f0f4f8" },
                                { label: "Zip / Pincode", value: viewCompany.documents.pincode, icon: <FaBuilding />, color: "#e8f5e9" },
                                { label: "Foundation Year", value: viewCompany.documents.founded, icon: <FaCalendarPlus />, color: "#fff8e1" },
                                { label: "Verification Status", value: viewCompany.status, icon: <FaCheckCircle />, color: viewCompany.verified ? "#e8f5e9" : "#fff3e0" },
                            ].map((item, index) => (
                                <div key={index} className="d-flex align-items-center justify-content-between p-3 rounded-4 border bg-white shadow-sm transition-all hover-translate">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ background: item.color, color: COLORS.primary, width: 40, height: 40 }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <span className="text-muted small d-block fw-bold text-uppercase" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>{item.label}</span>
                                            <span className="fw-bold text-dark small">{item.value}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-primary w-100 mt-4 rounded-pill py-3 fw-bold shadow-lg" onClick={() => setViewCompany(null)}>DISMISS PROFILE</button>
                    </div>
                </Modal>
            )}

            {rejectCompany && (
                <Modal title="Decline Partnership" close={() => setRejectCompany(null)}>
                    <div className="p-2">
                        <label className="small fw-bold text-muted text-uppercase mb-2" style={{ fontSize: "10px" }}>Specify Reason for Rejection</label>
                        <textarea className="form-control border-2 rounded-4 mb-4 p-3" rows={4} placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                        <button className="btn btn-danger w-100 rounded-4 py-3 fw-bold shadow-sm" disabled={!rejectReason.trim()} onClick={confirmRejection}>
                            CONFIRM REJECTION
                        </button>
                    </div>
                </Modal>
            )}

            {viewJobs && (
                <Modal title="Live Job Inventory" close={() => setViewJobs(null)}>
                    <div className="p-0">
                        <div className="d-flex align-items-center gap-3 mb-4 p-4 rounded-top-5" style={{ background: "linear-gradient(135deg, #137333 0%, #0b5123 100%)", margin: "-24px -24px 24px -24px" }}>
                            <FaBriefcase className="text-white" size={30} />
                            <div>
                                <h5 className="fw-bold text-white mb-0">{viewJobs.name}</h5>
                                <small className="text-white text-opacity-75">{viewJobs.jobs.length} Active Opportunities</small>
                            </div>
                        </div>
                        <div className="d-grid gap-3" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                            {viewJobs.jobs.length > 0 ? viewJobs.jobs.map((job, i) => (
                                <div key={i} className="p-3 rounded-4 border bg-white shadow-sm transition-all hover-translate">
                                    <div className="fw-bold text-dark small mb-1">{job.jobTitle || job.title}</div>
                                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '10px' }}>
                                        <FaMapMarkerAlt /> {job.location} • <FaClock /> {job.jobType || job.type}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-5 opacity-50">
                                    <FaBriefcase size={40} className="mb-3" />
                                    <p className="fw-bold small">No active vacancies found.</p>
                                </div>
                            )}
                        </div>
                        <button className="btn btn-primary w-100 mt-4 rounded-pill py-3 fw-bold shadow-lg" onClick={() => setViewJobs(null)}>CLOSE INVENTORY</button>
                    </div>
                </Modal>
            )}

            <style>{`
                .table-row-hover:hover { background-color: #f8fbff !important; transform: scale(1.002); cursor: pointer; }
                .transition-all { transition: all 0.2s ease; }
                .hover-translate:hover { transform: translateY(-2px); border-color: ${COLORS.primary} !important; }

                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${COLORS.primary}; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: "rgb(0, 115, 177)"; }
            `}</style>
        </div>
    );
}

const Modal = ({ title, children, close }) => (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ background: "rgba(0,10,25,0.7)", zIndex: 2000, backdropFilter: "blur(5px)" }}>
        <div className="bg-white rounded-5 p-4 shadow-lg border-0 animate-fade-up custom-scrollbar" style={{ width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h6 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: "1px", fontSize: "14px", color: COLORS.primary }}>{title}</h6>
                <button className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }} onClick={close}>✕</button>
            </div>
            {children}
        </div>
    </div>
);
