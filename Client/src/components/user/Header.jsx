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
    FaMapMarkerAlt,
    FaBuilding,
    FaPlus,
    FaFilter,
    FaChevronDown,
    FaSignOutAlt,
    FaCog,
    FaUserCircle,
    FaCrown
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

const Header = () => {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (socket && user?.id) {
            socket.emit("join", user.id);
            console.log(`📡 User ${user.id} joined personal real-time room`);
        }
    }, [socket, user?.id]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const searchData = {
        people: ["Top Mentors", "Hiring Managers", "Software Engineers"],
        jobs: ["Frontend Developer", "Node.js Developer", "UI/UX Designer"],
        companies: ["Google", "Microsoft", "TCS", "Infosys"],
        skills: ["React.js", "Node.js", "MongoDB", "UI/UX"],
    };

    const navItems = [
        { label: "Home", path: "/user/home", icon: <FaHome /> },
        { label: "Network", path: "/user/mynetwork", icon: <FaUsers /> },
        { label: "Jobs", path: "/user/jobs", icon: <FaBriefcase /> },
        { label: "Messages", path: "/user/messages", icon: <FaEnvelope /> },
        { label: "Notifications", path: "/user/notifications", icon: <FaBell /> },
        { label: "Premium", path: "/user/premium", icon: <FaCrown className="text-warning" /> },
    ];

    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const fetchUnreadCount = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/users/notifications/${user.id}`);
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
            people: searchData.people.filter(i => i.toLowerCase().includes(query.toLowerCase())),
            jobs: searchData.jobs.filter(i => i.toLowerCase().includes(query.toLowerCase())),
            companies: searchData.companies.filter(i => i.toLowerCase().includes(query.toLowerCase())),
        };
    };

    const results = getFilteredResults();

    return (
        <nav
            className={`navbar navbar-expand-lg sticky-top transition-all ${isScrolled ? "shadow-sm py-2" : "py-3"}`}
            style={{
                borderBottom: isScrolled ? "none" : "1px solid var(--border-color)",
                zIndex: 1000,
                backgroundColor: "rgb(0, 115, 177) !important",
                backdropFilter: "blur(10px)"
            }}
        >
            <div className="container-fluid px-lg-5">
                {/* BRAND */}
                <Link className="navbar-brand d-flex align-items-center" to="/user/home">
                    <img src="/ConnectiFy_logo.png" alt="Logo" style={{ height: "60px" }} />
                </Link>

                {/* SEARCH BAR - NEW DESIGN */}
                <div className="mx-auto d-none d-lg-block position-relative" style={{ width: "420px" }}>
                    <motion.div
                        initial={false}
                        animate={{
                            width: showResults ? "100%" : "100%",
                            scale: showResults ? 1.0 : 1
                        }}
                        className={`search-container d-flex align-items-center rounded-pill px-3 py-2 transition-all ${showResults ? "show-aurora" : ""}`}
                        style={{
                            backgroundColor: "#f3f4f6",
                            border: "1px solid transparent",
                            position: "relative",
                            zIndex: 1101
                        }}
                    >
                        <FaSearch className="text-secondary fs-6 me-3 ms-1" />
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
                            style={{ fontSize: "0.9rem", color: "#4b5563" }}
                        />
                        <div className="d-flex align-items-center gap-2 border-start ps-3 ms-2 text-primary cursor-pointer hover-opacity">
                            <FaPlus size={14} />
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
                                        <h6 className="text-muted small fw-bold mb-3 tracking-widest uppercase fs-xs">Trending Searches</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {searchData.skills.map(skill => (
                                                <span key={skill} className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 cursor-pointer hover-up">
                                                    {skill}
                                                </span>
                                            ))}
                                            {searchData.jobs.slice(0, 2).map(job => (
                                                <span key={job} className="badge rounded-pill bg-light text-dark border px-3 py-2 cursor-pointer hover-up">
                                                    {job}
                                                </span>
                                            ))}
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
                                                            to={category === 'people' ? `/user/profile/${item.toLowerCase().replace(/\s+/g, '-')}` : category === 'jobs' ? '/user/jobs' : '/user/mynetwork'}
                                                            className="search-result-item"
                                                            onClick={() => setShowResults(false)}
                                                        >
                                                            <div className="result-icon-wrapper">
                                                                {category === 'people' ? <FaUserCircle /> : category === 'jobs' ? <FaBriefcase /> : <FaBuilding />}
                                                            </div>
                                                            <div className="result-info">
                                                                <span className="result-name">{item}</span>
                                                                <span className="result-meta">View details</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="text-muted mb-2"><FaSearch size={24} opacity={0.3} /></div>
                                                <p className="small text-muted mb-0">No results found for "{query}"</p>
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
                    <ul className="navbar-nav ms-auto gap-1">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li className="nav-item" key={index}>
                                    <Link
                                        to={item.path}
                                        className={`nav-link px-3 py-2 rounded-pill d-flex align-items-center gap-2 transition-all fw-semibold ${isActive
                                            ? "text-white shadow-sm"
                                            : "text-secondary hover-bg"
                                            }`}
                                        style={{
                                            fontSize: "0.9rem",
                                            backgroundColor: isActive ? "rgb(0, 115, 177)" : "transparent"
                                        }}
                                    >
                                        <span className={`${isActive ? "text-white" : "text-secondary"}`} style={{ fontSize: "1rem", position: "relative" }}>
                                            {item.icon}
                                            {item.label === "Notifications" && unreadNotifications > 0 && (
                                                <span className="badge bg-danger rounded-circle position-absolute" style={{ top: -5, right: -8, fontSize: "8px" }}>
                                                    {unreadNotifications}
                                                </span>
                                            )}
                                        </span>
                                        <span className="d-none d-xxl-inline">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* USER PROFILE */}
                    <div className="d-flex align-items-center gap-3 ms-lg-3">
                        <div className="dropdown">
                            <button
                                className="btn p-1 ps-2 pe-3 border d-flex align-items-center gap-2 rounded-pill bg-white shadow-sm hover-bg"
                                data-bs-toggle="dropdown"
                                style={{ borderColor: "#e5e7eb" }}
                            >
                                <img
                                    src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                    alt="User"
                                    className="rounded-circle"
                                    width="32" height="32"
                                    style={{ objectFit: "cover" }}
                                />
                                <div className="d-flex flex-column align-items-start d-none d-xl-block me-1" style={{ lineHeight: "1.1" }}>
                                    <span className="fw-bold text-dark d-block text-truncate" style={{ fontSize: "0.85rem", maxWidth: "100px" }}>
                                        {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (user?.name || "User")}
                                    </span>
                                    <span className="text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.3px" }}>{user?.role || "Member"}</span>
                                </div>
                                <FaChevronDown size={10} className="text-secondary" />
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-3 p-2 rounded-4" style={{ minWidth: "220px" }}>
                                <div className="px-3 py-2 mb-2 border-bottom">
                                    <p className="fw-bold text-dark mb-0">My Account</p>
                                    <p className="text-muted small">{user?.email || ""}</p>
                                </div>
                                <li>
                                    <Link className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2" to="/user/profile">
                                        <FaUserCircle className="text-primary" /> Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2" to="/user/settings">
                                        <FaCog className="text-secondary" /> Settings
                                    </Link>
                                </li>
                                <hr className="dropdown-divider opacity-50" />
                                <li>
                                    <button
                                        className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2 text-danger"
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt /> Sign Out
                                    </button>
                                </li>
                            </ul>
                        </div>
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
            `}</style>
        </nav>
    );
};

export default Header;
