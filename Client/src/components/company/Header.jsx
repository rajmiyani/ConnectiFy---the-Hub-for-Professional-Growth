import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaHome,
    FaUsers,
    FaBriefcase,
    FaEnvelope,
    FaBell,
    FaRobot,
    FaSearch,
    FaBuilding,
    FaChevronDown,
    FaSignOutAlt,
    FaCog,
    FaPlus,
    FaCrown
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

const Header = () => {
    const { user, logout, company } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (socket && company?.id) {
            socket.emit("join_company", company.id);
            console.log(`📡 Company ${company.id} joined real-time room`);
        }
    }, [socket, company?.id]);

    const handleSignOut = () => {
        logout();
        navigate("/login");
    };
    const [isScrolled, setIsScrolled] = useState(false);
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const searchData = {
        candidates: ["Rohit Malhotra", "Priya Sharma", "Amit Patel", "Sneha Gupta"],
        skills: ["React.js", "Node.js", "Docker", "AWS"],
        jobs: ["Senior DevOps Engineer", "Product Manager", "Frontend Developer"],
    };

    const navItems = [
        { label: "Dashboard", path: "/company/dashboard", icon: <FaHome /> },
        { label: "Applicants", path: "/company/view-applicants", icon: <FaUsers /> },
        { label: "Jobs", path: "/company/job-posting", icon: <FaBriefcase /> },
        { label: "Messages", path: "/company/messages", icon: <FaEnvelope /> },
        { label: "Notifications", path: "/company/notifications", icon: <FaBell /> },
        { label: "Premium", path: "/company/premium", icon: <FaCrown className="text-warning" /> },
    ];

    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const fetchUnreadCount = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/companies/notifications/${user.id}`);
            const data = res.data;
            if (data.success) {
                setUnreadNotifications(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        if (socket && user?.id) {
            socket.on("new_notification", (notification) => {
                if (!notification.isRead) {
                    setUnreadNotifications(prev => prev + 1);
                }
            });
        }
        return () => {
            if (socket) socket.off("new_notification");
        };
    }, [socket, user?.id]);

    const getFilteredResults = () => {
        if (!query) return null;
        return {
            candidates: searchData.candidates.filter(i => i.toLowerCase().includes(query.toLowerCase())),
            jobs: searchData.jobs.filter(i => i.toLowerCase().includes(query.toLowerCase())),
            skills: searchData.skills.filter(i => i.toLowerCase().includes(query.toLowerCase())),
        };
    };

    const results = getFilteredResults();

    return (
        <nav
            className={`navbar navbar-expand-lg sticky-top transition-all ${isScrolled ? "shadow-sm py-2" : "py-3"}`}
            style={{
                borderBottom: isScrolled ? "none" : "1px solid #eef2f6",
                zIndex: 1000,
                backgroundColor: "rgb(0, 115, 177) !important",
                backdropFilter: "blur(10px)"
            }}
        >
            <div className="container-fluid px-lg-5">
                {/* BRAND */}
                <Link className="navbar-brand d-flex align-items-center" to="/company/dashboard">
                    <img src="/ConnectiFy_logo.png" alt="Logo" style={{ height: "60px" }} />
                </Link>

                {/* SEARCH BAR - UNIQUE LUMINOUS DESIGN */}
                <div className="mx-auto d-none d-lg-block position-relative" style={{ width: "40%", maxWidth: "600px" }}>
                    <motion.div
                        initial={false}
                        animate={{
                            width: showResults ? "100%" : "90%",
                            scale: showResults ? 1.02 : 1
                        }}
                        className={`search-container d-flex align-items-center rounded-pill px-4 py-2 transition-all ${showResults ? "show-aurora" : ""}`}
                        style={{
                            backgroundColor: "#f3f6f9",
                            border: "2px solid transparent",
                            position: "relative",
                            zIndex: 1101
                        }}
                    >
                        <FaSearch className="text-muted fs-5 me-2" />
                        <input
                            type="text"
                            className="form-control bg-transparent border-0 shadow-none py-1 fw-medium"
                            placeholder="Find talent, skills or job posts..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)}
                            style={{ fontSize: "0.95rem" }}
                        />
                        <div className="d-flex align-items-center gap-2 border-start ps-3 ms-2 text-muted small fw-bold">
                            <FaPlus className="text-primary pointer" title="Post new job" onClick={() => (window.location.href = '/company/job-posting')} />
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {showResults && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="position-absolute w-100 glass-dropdown rounded-4 mt-3 shadow-2xl overflow-hidden"
                                style={{ zIndex: 1100 }}
                            >
                                {!query ? (
                                    <div className="p-4">
                                        <h6 className="text-muted small fw-bold mb-3 tracking-widest uppercase fs-xs">Recent Talent Searches</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {searchData.skills.map(skill => (
                                                <span key={skill} className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 cursor-pointer hover-up">
                                                    {skill}
                                                </span>
                                            ))}
                                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2 cursor-pointer hover-up">Full Stack</span>
                                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2 cursor-pointer hover-up">Remote</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3">
                                        {Object.entries(results).some(([_, items]) => items.length > 0) ? (
                                            Object.entries(results).map(([category, items]) => items.length > 0 && (
                                                <div key={category} className="mb-3 last-mb-0">
                                                    <h6 className="dropdown-category-title">{category}</h6>
                                                    {items.map((item, i) => (
                                                        <Link
                                                            key={i}
                                                            to={category === 'candidates' ? '/company/view-applicants' : category === 'jobs' ? '/company/job-posting' : '/company/view-applicants'}
                                                            className="search-result-item"
                                                            onClick={() => setShowResults(false)}
                                                        >
                                                            <div className="result-icon-wrapper">
                                                                {category === 'candidates' ? <FaUsers /> : category === 'jobs' ? <FaBriefcase /> : <FaPlus />}
                                                            </div>
                                                            <div className="result-info">
                                                                <span className="result-name">{item}</span>
                                                                <span className="result-meta">{category === 'candidates' ? 'View Profile' : 'Manage Job'}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="text-muted mb-2"><FaSearch size={24} opacity={0.3} /></div>
                                                <p className="small text-muted mb-0">No talent found for "{query}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* NAV LINKS */}
                <div className="collapse navbar-collapse" id="navMenu">
                    <ul className="navbar-nav ms-auto gap-2">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li className="nav-item" key={index}>
                                    <Link
                                        to={item.path}
                                        className={`nav-link px-3 py-2 rounded-pill d-flex align-items-center gap-2 transition-all ${isActive ? "text-white shadow-lg fw-bold" : "text-secondary hover-primary"
                                            }`}
                                        style={{
                                            fontSize: "0.9rem",
                                            backgroundColor: isActive ? "rgb(0, 115, 177)" : "transparent"
                                        }}
                                    >
                                        <span className="fs-5">{item.icon}</span>
                                        <span className="d-none d-xl-inline">{item.label}</span>
                                        {item.label === "Notifications" && unreadNotifications > 0 && (
                                            <span className="badge bg-danger rounded-circle position-absolute" style={{ top: 0, right: 0, fontSize: "8px" }}>
                                                {unreadNotifications}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* COMPANY PROFILE - LUMINOUS DROPDOWN */}
                    <div className="dropdown ms-lg-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn d-flex align-items-center gap-2 p-1 pe-3 rounded-pill bg-white border shadow-sm hover-shadow-md transition-all"
                            data-bs-toggle="dropdown"
                            style={{ border: "1px solid #eef2f6 !important" }}
                        >
                            <div className="position-relative">
                                <img
                                    src={user?.company?.profileImg || user?.profileImg || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                    alt="Company"
                                    className="rounded-circle border-2 border-white shadow-sm"
                                    width="38" height="38"
                                    style={{ objectFit: "cover" }}
                                />
                                <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" style={{ width: 10, height: 10 }}></div>
                            </div>
                            <div className="text-start d-none d-md-block">
                                <p className="mb-0 fw-bold small text-dark leading-tight" style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {user?.companyName || user?.company?.companyName || "Organization"}
                                </p>
                                <span className="text-primary fw-bold" style={{ fontSize: "9px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Premium Partner</span>
                            </div>
                            <FaChevronDown size={10} className="text-muted ms-1 opacity-50" />
                        </motion.button>

                        <ul className="dropdown-menu dropdown-menu-end border-0 shadow-2xl mt-3 p-2 rounded-4 animate-scale-in" style={{ minWidth: "240px", background: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(10px)" }}>
                            <div className="px-3 py-3 mb-2 bg-light rounded-3 shadow-none">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                                        <FaBuilding className="text-primary" />
                                    </div>
                                    <p className="fw-bold text-dark mb-0 small">Account Overview</p>
                                </div>
                                <p className="text-muted small mb-0 opacity-75">{user?.email || "organization@connectify.com"}</p>
                            </div>
                            <li>
                                <Link className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 fs-7 transition-all" to="/company/profile">
                                    <div className="bg-info bg-opacity-10 p-2 rounded-2 text-info"><FaBuilding size={14} /></div>
                                    <span className="fw-semibold">Organization Profile</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 fs-7 transition-all" to="/company/settings">
                                    <div className="bg-secondary bg-opacity-10 p-2 rounded-2 text-secondary"><FaCog size={14} /></div>
                                    <span className="fw-semibold">Portal Settings</span>
                                </Link>
                            </li>
                            <hr className="dropdown-divider opacity-10 mx-2" />
                            <li>
                                <button
                                    className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-danger transition-all fw-bold"
                                    onClick={handleSignOut}
                                >
                                    <div className="bg-danger bg-opacity-10 p-2 rounded-2"><FaSignOutAlt size={14} /></div>
                                    <span>Sign Out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-bg:hover { background-color: #f8f9fa; }
                .hover-primary:hover { color: rgb(0, 115, 177) !important; background-color: #f0f7ff; }
                .leading-tight { line-height: 1.25; }

                /* Unique Luminous Search Styles */
                .search-container.show-aurora {
                    background-color: white !important;
                    box-shadow: 0 10px 30px -5px rgba(0, 115, 177, 0.15), 0 0 0 2px rgb(0, 115, 177);
                }
                .glass-dropdown {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.125);
                }
                .dropdown-category-title {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: #94a3b8;
                    letter-spacing: 0.1em;
                    padding: 0 12px;
                    margin-bottom: 8px;
                }
                .search-result-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: #1e293b;
                    transition: all 0.2s ease;
                }
                .search-result-item:hover {
                    background: rgba(0, 115, 177, 0.05);
                    transform: translateX(5px);
                }
                .result-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f1f5f9;
                    border-radius: 10px;
                    color: rgb(0, 115, 177);
                    font-size: 1.1rem;
                }
                .search-result-item:hover .result-icon-wrapper {
                    background: rgb(0, 115, 177);
                    color: white;
                }
                .result-info {
                    display: flex;
                    flex-direction: column;
                }
                .result-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .result-meta {
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .last-mb-0:last-child { margin-bottom: 0 !important; }
                .uppercase { text-transform: uppercase; }
                .fs-xs { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.1em; }
                .cursor-pointer { cursor: pointer; }
                .hover-up:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
                .pointer { cursor: pointer; }
            `}</style>
        </nav >
    );
};

export default Header;
