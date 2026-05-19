import React, { useState, useMemo, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { FaSearch, FaSyncAlt, FaTrashAlt, FaCheckCircle, FaBan, FaEnvelope, FaUserTag, FaShieldAlt, FaCheckDouble, FaCalendarDay } from "react-icons/fa";

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
};

/* ================= MAIN ================= */
export default function UserManagement() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);

    const [statusUser, setStatusUser] = useState(null);
    const [viewUser, setViewUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);

    const PAGE_SIZE = 10;

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/admin/users");
            if (response.data.success) {
                // Map backend user to frontend format
                const mappedUsers = response.data.users.map(u => ({
                    id: u.id,
                    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username,
                    email: u.email,
                    role: u.accountType === "user" ? "User" : u.accountType === "company" ? "Recruiter" : "Admin",
                    status: u.isActive ? "Active" : "Blocked",
                    verified: u.isVerified,
                    joined: new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    raw: u // Keep original for details
                }));
                setUsers(mappedUsers);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast("Failed to fetch users", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    /* ================= FILTER ================= */
    const filteredUsers = useMemo(() => {
        return users.filter(
            (u) =>
                (roleFilter === "All" || u.role === roleFilter) &&
                (statusFilter === "All" || u.status === statusFilter) &&
                ((u.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                    (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false))
        );
    }, [users, search, roleFilter, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    /* ================= VERIFICATION ================= */
    const sendVerificationLink = (user) => {
        // Mocking for now as backend doesn't have a specific "re-verify" endpoint yet besides OTP
        showToast(`Verification logic would reach out to ${user.email}`, "info");
    };

    /* ================= STATUS UPDATE ================= */
    const updateStatus = async (newStatus) => {
        try {
            const apiStatus = newStatus === "Active" ? "Active" : "Blocked";
            const response = await api.patch(`/admin/users/${statusUser.id}/status`, { status: apiStatus });

            if (response.data.success) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === statusUser.id ? { ...u, status: newStatus } : u
                    )
                );
                showToast(`Account status for ${statusUser.name} updated to ${newStatus}`, "success");
            }
        } catch (error) {
            showToast("Failed to update user status", "error");
        } finally {
            setStatusUser(null);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async () => {
        try {
            const response = await api.delete(`/admin/users/${deleteUser.id}`);
            if (response.data.success) {
                setUsers((prev) => prev.filter(u => u.id !== deleteUser.id));
                showToast(`User ${deleteUser.name} has been removed from platform`, "success");
            }
        } catch (error) {
            showToast("Failed to delete user", "error");
        } finally {
            setDeleteUser(null);
        }
    };

    /* ================= UI ================= */
    return (
        <div style={{ padding: "10px 20px" }}>
            {/* ##### HEADER ##### */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-4 border shadow-sm">
                <div>
                    <h4 className="fw-bold mb-1">User Management</h4>
                    <p className="text-muted small mb-0">Manage platform users, roles, and verification status.</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" style={{ fontSize: "14px" }} onClick={fetchUsers}>
                    <FaSyncAlt className={isLoading ? "fa-spin" : ""} /> Refresh
                </button>
            </div>

            {/* ##### SEARCH & FILTER ##### */}
            <div className="mb-4 p-4 rounded-4 bg-white border shadow-sm">
                <div className="row g-3 align-items-end">
                    <div className="col-md-5">
                        <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Search Directory</label>
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
                        <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Filter by Role</label>
                        <select className="form-select rounded-pill border-2" style={{ height: "45px", fontSize: "14px" }} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option>All</option>
                            <option>User</option>
                            <option>Recruiter</option>
                            <option>Admin</option>
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>Account Status</label>
                        <select className="form-select rounded-pill border-2" style={{ height: "45px", fontSize: "14px" }} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option>All</option>
                            <option>Active</option>
                            <option>Blocked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ##### TABLE ##### */}
            <div className="table-responsive rounded-4 border bg-white shadow-sm overflow-hidden">
                <table className="table align-middle mb-0">
                    <thead style={{ background: "rgb(0, 115, 177)" }}>
                        <tr>
                            <th className="ps-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>User Info</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Privileges</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Status</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Verification</th>
                            <th className="py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Joined</th>
                            <th className="text-end pe-4 py-3 text-white border-0 fw-bold small text-uppercase" style={{ letterSpacing: "1px" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    <td className="ps-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: 40, height: 40 }}></div>
                                            <div className="flex-grow-1">
                                                <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "120px" }}></div>
                                                <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "160px", height: "10px" }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><div className="skeleton skeleton-pulse skeleton-btn"></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "60px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "100px" }}></div></td>
                                    <td><div className="skeleton skeleton-pulse skeleton-text" style={{ width: "80px" }}></div></td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <div className="skeleton skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "8px" }}></div>
                                            <div className="skeleton skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "8px" }}></div>
                                            <div className="skeleton skeleton-pulse" style={{ width: 32, height: 32, borderRadius: "8px" }}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-5">
                                    <p className="text-muted mb-0">No users found matching your criteria.</p>
                                </td>
                            </tr>
                        ) : (
                            paginatedUsers.map((u) => (
                                <tr key={u.id} className="transition-all table-row-hover">
                                    <td className="ps-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark mb-0">{u.name}</div>
                                                <div className="text-muted small">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-3 py-1 rounded-pill small fw-bold" style={{
                                            background: u.role === "Admin" ? "#ede7f6" : u.role === "Recruiter" ? "#e3f2fd" : "#f1f8e9",
                                            color: u.role === "Admin" ? "#5e35b1" : u.role === "Recruiter" ? COLORS.primary : COLORS.success,
                                            fontSize: "11px"
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.status === "Active" ? COLORS.success : COLORS.danger }} />
                                            <span className="small fw-bold">{u.status}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {u.verified ? (
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold" style={{ fontSize: "10px" }}>
                                                <FaCheckCircle className="me-1" /> VERIFIED
                                            </span>
                                        ) : (
                                            <button className="btn btn-sm btn-outline-warning border-2 rounded-pill fw-bold" onClick={() => sendVerificationLink(u)} style={{ fontSize: "10px" }}>
                                                UNVERIFIED
                                            </button>
                                        )}
                                    </td>
                                    <td className="text-muted small fw-medium">{u.joined}</td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setViewUser(u)} title="View Detail"><FaSearch size={14} className="text-primary" /></button>
                                            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setStatusUser(u)} title="Update Status"><FaSyncAlt size={14} className="text-primary" /></button>
                                            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" onClick={() => setDeleteUser(u)} title="Delete User"><FaTrashAlt size={14} className="text-danger" /></button>
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
                    <span className="text-muted small fw-bold">Showing {paginatedUsers.length} of {filteredUsers.length} Users</span>
                    <div className="d-flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} className={`btn btn-sm rounded-3 fw-bold p-0 ${page === i + 1 ? 'btn-primary shadow-sm' : 'btn-light border'}`} style={{ width: 32, height: 32, fontSize: "12px" }}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ##### MODALS ##### */}
            {statusUser && (
                <Modal title="Account Management" close={() => setStatusUser(null)}>
                    <div className="text-center p-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center fw-bold mb-3" style={{ width: 60, height: 60, fontSize: "24px" }}>
                            {statusUser.name.charAt(0)}
                        </div>
                        <h5 className="fw-bold mb-1">{statusUser.name}</h5>
                        <p className="text-muted small mb-4">Select new status for this user account</p>
                        <div className="d-grid gap-3">
                            <button className="btn btn-success rounded-4 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={() => updateStatus("Active")}>
                                <FaCheckCircle /> RE-ACTIVATE ACCOUNT
                            </button>
                            <button className="btn btn-danger rounded-4 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={() => updateStatus("Blocked")}>
                                <FaBan /> SUSPEND ACCOUNT
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {viewUser && (
                <Modal title="System Profile Analysis" close={() => setViewUser(null)}>
                    <div className="p-0">
                        {/* --- USER HEADER --- */}
                        <div className="d-flex align-items-center gap-4 mb-4 p-4 rounded-top-5" style={{ background: "rgb(0, 115, 177)", margin: "-24px -24px 24px -24px" }}>
                            <div className="rounded-4 bg-white p-3 shadow-lg d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, minWidth: 80 }}>
                                <span className="fw-bold text-primary display-6">{viewUser.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h4 className="fw-bold text-white mb-1">{viewUser.name}</h4>
                                <span className="badge bg-white bg-opacity-25 text-white border border-white border-opacity-25 px-3 py-2 rounded-pill small fw-bold" style={{ fontSize: "10px", letterSpacing: "1px" }}>{viewUser.role.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* --- INFO GRID --- */}
                        <div className="d-grid gap-3">
                            {[
                                { label: "Contact Email", value: viewUser.email, icon: <FaEnvelope />, color: "#e8f4fb" },
                                { label: "Permission Level", value: viewUser.role, icon: <FaUserTag />, color: "#f0f4f8" },
                                { label: "Account Activity", value: viewUser.status, icon: <FaShieldAlt />, color: viewUser.status === 'Active' ? "#e8f5e9" : "#fbe9e7" },
                                { label: "Identity Verified", value: viewUser.verified ? "Verified Member" : "Non-Verified", icon: <FaCheckDouble />, color: "#fff8e1" },
                                { label: "Member Since", value: viewUser.joined, icon: <FaCalendarDay />, color: "#f3e5f5" },
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

                        <button className="btn btn-primary w-100 mt-4 rounded-pill py-3 fw-bold shadow-lg" onClick={() => setViewUser(null)}>DISMISS PROFILE</button>
                    </div>
                </Modal>
            )}

            {deleteUser && (
                <Modal title="Irreversible Action" close={() => setDeleteUser(null)}>
                    <div className="text-center p-3">
                        <div className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 70, height: 70 }}>
                            <FaTrashAlt size={30} />
                        </div>
                        <h5 className="fw-bold mb-2">Delete Account?</h5>
                        <p className="text-muted small mb-4">
                            You are about to permanently remove <br />
                            <strong className="text-danger">{deleteUser.name}</strong> from the platform.
                            <br /><br />
                            <span className="fw-bold text-dark">This action cannot be undone.</span>
                        </p>
                        <div className="d-grid gap-2">
                            <button className="btn btn-danger rounded-4 py-3 fw-bold shadow-sm" onClick={handleDelete}>
                                DELETE PERMANENTLY
                            </button>
                            <button className="btn btn-light border rounded-4 py-3 fw-bold" onClick={() => setDeleteUser(null)}>
                                CANCEL
                            </button>
                        </div>
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
        <div className="bg-white rounded-5 p-4 shadow-lg border-0 animate-fade-up custom-scrollbar" style={{ width: "100%", maxWidth: "450px", maxHeight: "90vh", overflowY: "auto" }}>
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
