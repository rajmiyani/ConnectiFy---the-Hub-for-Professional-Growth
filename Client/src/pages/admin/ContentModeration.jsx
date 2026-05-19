import React, { useState, useMemo, useEffect } from "react";
import {
    FaSearch,
    FaUserSlash,
    FaTrash,
    FaEye,
} from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

/* ================= THEME ================= */
const COLORS = {
    primary: "rgb(0, 115, 177)",
    secondary: "#f4f9fd",
    white: "#ffffff",
    border: "#e4ecf4",
    textDark: "#1f1f1f",
    textLight: "#606770",
    warning: "#b06000",
    danger: "#b3261e",
    success: "#137333",
};

const USER_ROLE = "ADMIN";
const ITEMS_PER_PAGE = 10;

export default function ContentModeration() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewReport, setViewReport] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reports, setReports] = useState([]);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/admin/moderation/posts");
            const data = response.data;
            if (data.success) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            showToast("Failed to load moderation reports", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const autoBlockRule = (severity) => severity === 0;

    const filteredReports = useMemo(() => {
        return (reports || []).filter(
            (r) =>
                r.entity.toLowerCase().includes(search.toLowerCase()) ||
                r.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, reports]);

    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleConfirmAction = async () => {
        const { type, report } = confirmAction;
        const action = type.toLowerCase(); // "block", "delete", "warn"

        try {
            const response = await api.patch(`/admin/moderation/posts/${report.id}`, { action });
            const data = response.data;

            if (data.success) {
                showToast(`Action: ${type} executed successfully on ${report.entity}`, type === "Warn" ? "warning" : "success");
                fetchReports(); // Refresh list
            } else {
                showToast(data.message || "Action failed", "error");
            }
        } catch (error) {
            console.error("Moderation action error:", error);
            showToast("Network error. Please try again.", "error");
        } finally {
            setConfirmAction(null);
        }
    };

    /* ================= UI ================= */
    return (
        <div style={{ padding: "10px 20px" }}>
            {/* ##### HEADER ##### */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-4 border shadow-sm">
                <div>
                    <h4 className="fw-bold mb-1">Content Moderation</h4>
                    <p className="text-muted small mb-0">Review reported entities, manage community standards, and enforce policies.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm" style={{ fontSize: "14px" }}>
                        View Rules & Guidelines
                    </button>
                </div>
            </div>

            {/* ##### SEARCH & FILTER ##### */}
            <div className="mb-4 p-4 rounded-4 bg-white border shadow-sm">
                <div className="row g-3 align-items-end">
                    <div className="col-md-5">
                        <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Global Moderate Filter</label>
                        <div className="position-relative">
                            <FaSearch
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 16,
                                    transform: "translateY(-50%)",
                                    color: COLORS.textLight,
                                }}
                            />
                            <input
                                className="form-control ps-5 rounded-pill border-2"
                                style={{ height: "45px", fontSize: "14px" }}
                                placeholder="Search by entity, type or report category..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ##### TABLE ##### */}
            <div className="table-responsive bg-white rounded-4 border shadow-sm overflow-hidden">
                <table className="table align-middle mb-0">
                    <thead style={{ background: "rgb(0, 115, 177)" }}>
                        <tr>
                            <th className="ps-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Model Type</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Reported Entity</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Issue Category</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Risk Scale</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Control Status</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Timestamp</th>
                            <th className="text-end pe-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    <td className="ps-4 py-3"><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "60px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "120px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "150px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "100px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "80px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "90px" }}></div></td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <div className="skeleton skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "8px" }}></div>
                                            <div className="skeleton skeleton-pulse" style={{ width: 120, height: 32, borderRadius: "8px" }}></div>
                                            <div className="skeleton skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "8px" }}></div>
                                            <div className="skeleton skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "8px" }}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            paginatedReports.map((r) => (
                                <tr key={r.id} className="transition-all table-row-hover">
                                    <td className="ps-4 py-3"><span className="badge bg-light text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 fw-bold" style={{ fontSize: "10px" }}>{r.type}</span></td>
                                    <td className="fw-bold text-dark small">{r.entity}</td>
                                    <td className="text-muted small fw-medium">{r.category}</td>

                                    <td>
                                        <span
                                            className="px-3 py-1 rounded-pill fw-bold"
                                            style={{
                                                background: r.severity === 0 ? "#fdecea" : r.severity >= 3 ? "#fff4e5" : "#e6f4ea",
                                                color: r.severity === 0 ? COLORS.danger : r.severity >= 3 ? COLORS.warning : COLORS.success,
                                                fontSize: "11px"
                                            }}
                                        >
                                            LEVEL {r.severity}/5
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className="px-3 py-1 rounded-pill fw-bold"
                                            style={{
                                                background: r.status === "Pending" ? "#fff4e5" : r.status === "Resolved" ? "#e6f4ea" : r.status === "Warned" ? "#fff4e5" : "#fdecea",
                                                color: r.status === "Pending" ? COLORS.warning : r.status === "Resolved" ? COLORS.success : r.status === "Warned" ? COLORS.warning : COLORS.danger,
                                                fontSize: "10px"
                                            }}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="text-muted small fw-medium">{r.date}</td>

                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setViewReport(r)} title="Investigate Content"><FaEye size={14} className="text-primary" /></button>

                                            {USER_ROLE === "ADMIN" && (
                                                <>
                                                    <button className="btn btn-sm btn-light border rounded-3 px-3 fw-bold shadow-sm" style={{ fontSize: "11px", color: COLORS.warning }} onClick={() => setConfirmAction({ type: "Warn", report: r })}>ISSUE WARNING</button>
                                                    <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setConfirmAction({ type: "Block", report: r })} title="Ban User"><FaUserSlash size={14} className="text-danger" /></button>
                                                    <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setConfirmAction({ type: "Delete", report: r })} title="Expunge Content"><FaTrash size={14} className="text-danger" /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ##### MODALS ##### */}
            {viewReport && (
                <Modal title="Content Investigation" close={() => setViewReport(null)}>
                    <div className="p-2">
                        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4 border">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 50, height: 50, fontSize: "20px" }}>
                                {viewReport.entity.charAt(0)}
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">{viewReport.entity}</h6>
                                <span className="small text-muted">REPORT TYPE: {viewReport.type}</span>
                            </div>
                        </div>

                        <div className="d-grid gap-2 mb-4">
                            {[
                                { label: "Complaint Category", value: viewReport.category },
                                { label: "Severity Index", value: `${viewReport.severity}/5` },
                                { label: "Filing Date", value: viewReport.date },
                            ].map((item, index) => (
                                <div key={index} className="d-flex justify-content-between p-3 rounded-3 bg-white border">
                                    <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: "10px" }}>{item.label}</span>
                                    <span className="small fw-bold text-dark">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {autoBlockRule(viewReport.severity) && (
                            <div className="p-3 rounded-4 border border-danger bg-danger bg-opacity-10 d-flex gap-3 align-items-center">
                                <span style={{ fontSize: "24px" }}>🚨</span>
                                <div>
                                    <label className="small fw-bold text-danger text-uppercase mb-0" style={{ fontSize: "10px" }}>Policy Enforcement Suggestion</label>
                                    <p className="mb-0 small fw-bold">System suggests an automatic block based on critical severity level.</p>
                                </div>
                            </div>
                        )}
                        <button className="btn btn-light border w-100 mt-4 rounded-4 py-2 fw-bold" onClick={() => setViewReport(null)}>CLOSE INVESTIGATION</button>
                    </div>
                </Modal>
            )}

            {confirmAction && (
                <Modal title="Policy Action Authorization" close={() => setConfirmAction(null)}>
                    <div className="p-2">
                        <p className="mb-4 text-center fw-medium text-dark">
                            Confirm the mandate to <strong>{confirmAction.type}</strong> this community content?
                        </p>
                        <div className="d-flex gap-3">
                            <button className="btn btn-primary w-100 rounded-4 py-3 fw-bold shadow-sm" onClick={handleConfirmAction}>AUTHORIZE</button>
                            <button className="btn btn-light border w-100 rounded-4 py-3 fw-bold" onClick={() => setConfirmAction(null)}>CANCEL</button>
                        </div>
                    </div>
                </Modal>
            )}

            <style>{`
                .table-row-hover:hover { background-color: #f8fbff !important; transform: scale(1.002); cursor: pointer; }
                .transition-all { transition: all 0.2s ease; }
            `}</style>
        </div>
    );
}

/* ================= MODAL ================= */
const Modal = ({ title, children, close }) => (
    <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
        style={{ background: "rgba(0,10,25,0.7)", zIndex: 3000, backdropFilter: "blur(5px)" }}
    >
        <div className="bg-white rounded-5 p-4 shadow-lg border-0 animate-fade-up" style={{ width: "100%", maxWidth: "480px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h6 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: "1px", fontSize: "14px", color: COLORS.primary }}>{title}</h6>
                <button className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }} onClick={close}>✕</button>
            </div>
            {children}
        </div>
        <style>{`
            .animate-fade-up { animation: fadeUp 0.3s ease-out; }
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
    </div>
);
