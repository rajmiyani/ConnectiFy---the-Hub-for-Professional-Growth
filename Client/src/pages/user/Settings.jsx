import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
    FaUser,
    FaLock,
    FaBell,
    FaGlobe,
    FaShieldAlt,
    FaMoon,
    FaChevronRight,
    FaSignOutAlt,
    FaCalendarAlt,
    FaVideo
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const COLORS = {
    primary: "#2563EB",
    bg: "#F8FAFC",
    card: "#FFFFFF",
    text: "#1E293B",
    border: "#E2E8F0"
};

const Settings = ({ role: roleProp }) => {
    const { user, company, refreshUserData } = useAuth();
    const role = roleProp || user?.userRole || "user";
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("account");
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        industry: "",
        companySize: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        notifications: {
            email: true,
            push: true,
            marketing: false
        },
        privacy: {
            profileVisibility: "public",
            showStatus: true
        }
    });

    React.useEffect(() => {
        if (role === "company" && company) {
            setFormData(prev => ({
                ...prev,
                companyName: company.companyName || "",
                email: company.email || "",
                phone: company.phone || "",
                website: company.website || "",
                address: company.address || "",
                industry: company.industry || "",
                companySize: company.companySize || "10-50 Employees",
                notifications: company.notificationPrefs || prev.notifications,
                privacy: company.privacySettings || prev.privacy
            }));
        } else if (role === "user" && user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                notifications: user.notificationPrefs || prev.notifications,
                privacy: user.privacySettings || prev.privacy
            }));
        }
    }, [user, company, role]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const endpoint = role === "company" ? "/companies/settings" : "/users/profile/settings";
            const payload = role === "company" ? {
                companyId: company?.id,
                notificationPrefs: formData.notifications,
                privacySettings: formData.privacy,
                // Add other company fields if needed
            } : {
                userId: user?.id,
                notificationPrefs: formData.notifications,
                privacySettings: formData.privacy,
                // Bio/Headline updates are usually in Profile, but we can sync basic info here
            };

            const response = await api.put(endpoint, payload);
            const result = response.data;

            if (result.success) {
                showToast("Account settings updated successfully", "success");
                if (refreshUserData) refreshUserData();
            } else {
                showToast(result.message || "Update failed", "error");
            }
        } catch (error) {
            showToast("Network error. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            return showToast("New passwords do not match", "error");
        }
        if (formData.newPassword.length < 8) {
            return showToast("Password must be at least 8 characters", "error");
        }

        try {
            setIsLoading(true);
            const endpoint = role === "company" ? "/companies/settings/change-password" : "/users/profile/change-password";
            const payload = role === "company" ? {
                companyId: company?.id,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            } : {
                userId: user?.id,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            };

            const response = await api.put(endpoint, payload);
            const result = response.data;

            if (result.success) {
                showToast("Password updated successfully", "success");
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            } else {
                showToast(result.message || "Password update failed", "error");
            }
        } catch (error) {
            showToast("Network error. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (category, key) => {
        setFormData({
            ...formData,
            [category]: { ...formData[category], [key]: !formData[category][key] }
        });
    };

    /* ================= SUB-COMPONENTS ================= */
    const SectionHeader = ({ title, icon: Icon, desc }) => (
        <div className="mb-4">
            <div className="d-flex align-items-center gap-3 mb-1">
                <div className="p-2 rounded-3 bg-light text-primary">
                    <Icon size={20} />
                </div>
                <h5 className="fw-bold mb-0 text-dark">{title}</h5>
            </div>
            <p className="text-muted small ms-5 ps-1">{desc}</p>
        </div>
    );

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
            <div className="row g-4 justify-content-center">

                {/* SIDEBAR NAVIGATION */}
                <div className="col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden sticky-top" style={{ top: "20px" }}>
                        <div className="p-4 bg-white border-bottom text-center">
                            {isLoading ? (
                                <>
                                    <div className="skeleton skeleton-pulse mb-3" style={{ width: "80px", height: "80px", borderRadius: "50%" }}></div>
                                    <div className="skeleton skeleton-pulse skeleton-title mx-auto" style={{ width: "100px" }}></div>
                                    <div className="skeleton skeleton-pulse skeleton-text mx-auto" style={{ width: "120px" }}></div>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={role === "company" ? (company?.logo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png") : (user?.profileImg || "https://randomuser.me/api/portraits/men/32.jpg")}
                                        className="rounded-circle mb-3 border border-4 border-light shadow-sm"
                                        width="80" height="80"
                                        alt="Profile"
                                    />
                                    <h6 className="fw-bold mb-0">{role === "company" ? (company?.name || "Company Name") : (user?.name || "User Name")}</h6>
                                    <small className="text-muted text-uppercase">{role === "company" ? "Enterprise Account" : "Premium Member"}</small>
                                </>
                            )}
                        </div>

                        <div className="list-group list-group-flush py-2">
                            {[
                                { id: "account", label: "Account Settings", icon: FaUser },
                                { id: "security", label: "Login & Security", icon: FaLock },
                                { id: "notifications", label: "Notifications", icon: FaBell },
                                { id: "privacy", label: "Privacy & Data", icon: FaShieldAlt },
                                { id: "integrations", label: "Integrations", icon: FaCalendarAlt },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`list-group-item list-group-item-action border-0 px-4 py-3 d-flex align-items-center justify-content-between ${activeTab === tab.id ? "bg-light text-primary fw-semibold" : "text-secondary"}`}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </div>
                                    {activeTab === tab.id && <FaChevronRight size={12} />}
                                </button>
                            ))}
                        </div>

                        <div className="p-3 border-top mt-2">
                            <button className="btn btn-danger w-100 rounded-pill py-2" onClick={() => showToast("Logging out of account...", "info")}>
                                <FaSignOutAlt className="me-2" /> Log Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5" style={{ minHeight: "600px" }}>

                        {/* --- ACCOUNT TAB --- */}
                        {activeTab === "account" && (
                            <div className="animate-fade-in">
                                <SectionHeader title="Account Settings" icon={FaUser} desc="Update your profile information and contact details." />

                                {isLoading ? (
                                    <div className="row g-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="col-md-6 mb-3">
                                                <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "80px" }}></div>
                                                <div className="skeleton skeleton-pulse skeleton-rect" style={{ height: "48px", borderRadius: "8px" }}></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {role === "company" ? (
                                            <>
                                                <div className="col-12">
                                                    <label className="form-label small fw-bold text-muted">Company Name</label>
                                                    <input type="text" className="form-control form-control-lg bg-light border-0" defaultValue={company?.name || "TechNova Inc."} />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label small fw-bold text-muted">Web Address</label>
                                                    <input type="url" className="form-control form-control-lg bg-light border-0" defaultValue="https://technova.io" />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label small fw-bold text-muted">Office Location</label>
                                                    <textarea
                                                        className="form-control form-control-lg bg-light border-0"
                                                        rows="2"
                                                        placeholder="Enter company address..."
                                                        defaultValue="TechNova HQ, Cyber City, Pune, Maharashtra"
                                                    ></textarea>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">Industry</label>
                                                    <select className="form-select form-select-lg bg-light border-0">
                                                        <option>Technology</option>
                                                        <option>Finance</option>
                                                        <option>Healthcare</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">Team Size</label>
                                                    <select className="form-select form-select-lg bg-light border-0">
                                                        <option>10-50 Employees</option>
                                                        <option>50-200 Employees</option>
                                                        <option>200+ Employees</option>
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">First Name</label>
                                                    <input type="text" className="form-control form-control-lg bg-light border-0" value={formData.firstName} onChange={handleChange} name="firstName" />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">Last Name</label>
                                                    <input type="text" className="form-control form-control-lg bg-light border-0" value={formData.lastName} onChange={handleChange} name="lastName" />
                                                </div>
                                            </>
                                        )}

                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">Email Address</label>
                                            <input type="email" className="form-control form-control-lg bg-light border-0" value={formData.email} onChange={handleChange} name="email" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">Phone Number</label>
                                            <input type="tel" className="form-control form-control-lg bg-light border-0" value={formData.phone} onChange={handleChange} name="phone" />
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                                    <button className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm" onClick={handleSave} disabled={isLoading}>Save Changes</button>
                                </div>
                            </div>
                        )}
                        {/* --- SECURITY TAB --- */}
                        {activeTab === "security" && (
                            <div className="animate-fade-in">
                                <SectionHeader title="Login & Security" icon={FaLock} desc="Update your password and secure your account." />

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted">Current Password</label>
                                    <input type="password" className="form-control form-control-lg bg-light border-0" placeholder="••••••••" />
                                </div>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">New Password</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0" placeholder="New password" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">Confirm Password</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0" placeholder="Confirm new password" />
                                    </div>
                                </div>

                                <div className="alert alert-info border-0 d-flex gap-3 align-items-center rounded-3">
                                    <FaShieldAlt size={24} />
                                    <div>
                                        <h6 className="fw-bold mb-0">Two-Factor Authentication</h6>
                                        <p className="small mb-0">Add an extra layer of security to your account.</p>
                                    </div>
                                    <div className="form-check form-switch ms-auto">
                                        <input className="form-check-input" type="checkbox" role="switch" style={{ width: "3em", height: "1.5em" }} />
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end mt-4">
                                    <button className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm" onClick={handlePasswordUpdate}>Update Password</button>
                                </div>
                            </div>
                        )}

                        {/* --- NOTIFICATIONS TAB --- */}
                        {activeTab === "notifications" && (
                            <div className="animate-fade-in">
                                <SectionHeader title="Notification Settings" icon={FaBell} desc="Choose how you want to be contacted." />

                                <div className="list-group list-group-flush">
                                    {[
                                        { key: "email", label: "Email Notifications", desc: "Receive emails about your account activity." },
                                        { key: "push", label: "Push Notifications", desc: "Receive push notifications on your device." },
                                        { key: "marketing", label: "Marketing Emails", desc: "Receive emails about new features and offers." },
                                    ].map(item => (
                                        <div key={item.key} className="list-group-item border-0 px-0 py-3 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="fw-bold mb-1">{item.label}</h6>
                                                <p className="small text-muted mb-0">{item.desc}</p>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    style={{ width: "3em", height: "1.5em", cursor: "pointer" }}
                                                    checked={formData.notifications[item.key]}
                                                    onChange={() => handleToggle("notifications", item.key)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- PRIVACY TAB --- */}
                        {activeTab === "privacy" && (
                            <div className="animate-fade-in">
                                <SectionHeader title="Privacy & Visibility" icon={FaGlobe} desc="Control who can see your profile and activity." />

                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">Profile Visibility</h6>
                                    {["Public", "Connections Only", "Private"].map(option => (
                                        <div key={option} className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="visibility"
                                                checked={formData.privacy.profileVisibility === option}
                                                onChange={() => setFormData({ ...formData, privacy: { ...formData.privacy, profileVisibility: option } })}
                                            />
                                            <label className="form-check-label">{option}</label>
                                        </div>
                                    ))}
                                </div>

                                <hr className="text-muted opacity-25" />

                                <div className="d-flex justify-content-between align-items-center py-2">
                                    <div>
                                        <h6 className="fw-bold mb-1">Activity Status</h6>
                                        <p className="small text-muted mb-0">Show when you are active to your connections.</p>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            style={{ width: "3em", height: "1.5em", cursor: "pointer" }}
                                            checked={formData.privacy.showStatus}
                                            onChange={() => handleToggle("privacy", "showStatus")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- INTEGRATIONS TAB --- */}
                        {activeTab === "integrations" && (
                            <div className="animate-fade-in">
                                <SectionHeader title="Integrations" icon={FaCalendarAlt} desc="Connect third-party tools to enhance your workflow." />

                                <div className="card border p-4 mb-3 rounded-3 shadow-sm">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-3 bg-light rounded-circle">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png" width="32" alt="Google Calendar" />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-0">Google Calendar</h6>
                                            <p className="small text-muted mb-0">Sync interviews directly to your calendar.</p>
                                        </div>
                                        <button className="btn btn-outline-primary rounded-pill fw-semibold btn-sm px-4">
                                            Connect
                                        </button>
                                    </div>
                                </div>

                                <div className="card border p-4 mb-3 rounded-3 shadow-sm opacity-50">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-3 bg-light rounded-circle">
                                            <FaVideo size={24} className="text-primary" />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-0">Zoom Integration</h6>
                                            <p className="small text-muted mb-0">Auto-generate Zoom links (Coming Soon).</p>
                                        </div>
                                        <span className="badge bg-light text-muted">Soon</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Inline styles for animation */}
            <style>
                {`
            .animate-fade-in {
                animation: fadeIn 0.4s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}
            </style>
        </div>
    );
};

export default Settings;
