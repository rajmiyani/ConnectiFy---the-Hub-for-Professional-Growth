import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import {
    FaCamera,
    FaEdit,
    FaPlus,
    FaTrash,
    FaDownload,
    FaShareAlt,
    FaMapMarkerAlt,
    FaBriefcase,
    FaGraduationCap,
    FaMedal,
    FaCertificate,
    FaSave,
    FaTimes,
    FaFileUpload,
    FaLinkedin,
    FaLink,
    FaGlobe,
    FaMagic
} from "react-icons/fa";
import "./Profile.css";
import ProfileAnalytics from "./ProfileAnalytics";
import EngagementOverview from "./EngagementOverview";
import { Modal, Button, Form } from "react-bootstrap";

const COLORS = {
    brandCorporate: "rgb(0, 115, 177)",
    accent: "#005582",
    light: "#f5f6f8",
    text: "#333333",
    success: "#057642",
    danger: "#d93025",
};

export default function ProfilePremium({ mode = "own" }) {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const isOwnProfile = mode === "own";
    const [isLoading, setIsLoading] = useState(!isOwnProfile); // Start loading for view mode
    const [showPerformance, setShowPerformance] = useState(false); // Legacy inline toggle
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);

    const [profile, setProfile] = useState({
        coverPhoto: isOwnProfile ? user?.coverPhoto || "" : "",
        profilePhoto: isOwnProfile ? user?.profileImg || user?.avatar : "",
        name: isOwnProfile ? (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (user?.name || "Member")) : "Loading...",
        headline: isOwnProfile ? (user?.headline || "") : "",
        location: isOwnProfile ? [user?.city, user?.state, user?.country].filter(Boolean).join(", ") || "Location" : "",
        linkedin: isOwnProfile ? (user?.linkedin || "#") : "#",
        portfolio: isOwnProfile ? (user?.portfolio || "#") : "#",
        about: isOwnProfile ? (user?.bio || "") : "",
        skills: isOwnProfile ? (typeof user?.skills === 'string' ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : user?.skills || []) : [],
        experiences: isOwnProfile ? (user?.experiences || []) : [],
        education: isOwnProfile ? (user?.education?.length > 0 ? user.education : (user?.university ? [{
            id: 'reg-edu',
            school: user.university,
            degree: user.courseName,
            field: user.interest || "",
            startYear: user.startYear,
            endYear: user.passingYear,
            grade: user.cgpa,
            description: user.currentEducation ? "Currently Studying" : ""
        }] : [])) : [],
        certificates: isOwnProfile ? (user?.certificates || []) : [],
        awards: isOwnProfile ? (user?.awards || []) : [],
        resume: isOwnProfile ? (user?.resume || "") : "",
        posts: isOwnProfile ? (user?.posts?.length || 0) : 0,
        connections: isOwnProfile ? (user?.connections || 0) : 0,
        profileViews: isOwnProfile ? (user?.profileViews || 0) : 0,
    });

    // 🔹 Fetch profile data when viewing another user's profile
    useEffect(() => {
        if (!isOwnProfile && username) {
            setIsLoading(true);
            api.get(`/users/profile/by-username/${encodeURIComponent(username)}`)
                .then(res => {
                    const data = res.data;
                    if (data.success) {
                        const u = data.data;
                        setProfile({
                            coverPhoto: u.coverPhoto || "",
                            profilePhoto: u.profileImg || "",
                            name: `${u.firstName} ${u.lastName || ""}`.trim(),
                            headline: u.headline || "",
                            location: [u.city, u.state, u.country].filter(Boolean).join(", ") || "",
                            linkedin: u.linkedin || "#",
                            portfolio: u.portfolio || "#",
                            about: u.bio || "",
                            skills: typeof u.skills === 'string'
                                ? u.skills.split(',').map(s => s.trim()).filter(Boolean)
                                : (u.skills || []),
                            experiences: u.experiences || [],
                            education: u.education?.length > 0 ? u.education : (u.university ? [{
                                id: 'view-edu',
                                school: u.university,
                                degree: u.courseName,
                                field: u.interest || "",
                                startYear: u.startYear,
                                endYear: u.passingYear,
                                grade: u.cgpa,
                                description: u.currentEducation ? "Currently Studying" : ""
                            }] : []),
                            certificates: u.certificates || [],
                            awards: u.awards || [],
                            resume: u.resume || "",
                            connections: u.connections || 0,
                            profileViews: u.profileViews || 0,
                            posts: u.posts?.length || 0,
                        });
                    } else {
                        showToast("User not found", "danger");
                        navigate(-1);
                    }
                })
                .catch(() => {
                    showToast("Failed to load profile", "danger");
                })
                .finally(() => setIsLoading(false));
        }
    }, [username, isOwnProfile]);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        section: "", // e.g. "about", "experience", "education", "skill"
        mode: "add", // "add" or "edit"
        data: {}, // current item being edited or new item data
    });

    // AI Generation Logic
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAIBio = () => {
        setIsGenerating(true);
        const { headline, location, skills, experiences } = profile;

        // Construct a bio based on available data
        let generatedBio = `I am a ${headline || "professional"} based in ${location}.`;

        if (experiences && experiences.length > 0) {
            const latest = experiences[0];
            generatedBio += ` Currently, I work as a ${latest.role} at ${latest.company}, where I focus on ${latest.headline || "delivering high-quality solutions"}.`;
        }

        if (skills && skills.length > 0) {
            const topSkills = skills.slice(0, 5).join(", ");
            generatedBio += ` My technical expertise includes ${topSkills}.`;
        }

        generatedBio += " I am passionate about leveraging technology to solve complex problems and build scalable products.";

        setProfile(prev => ({
            ...prev,
            about: generatedBio
        }));
        setModal(prev => ({
            ...prev,
            data: { ...prev.data, about: generatedBio }
        }));
        setIsGenerating(false);
    };

    const [suggestions, setSuggestions] = useState([]);

    // Open modal with initial data
    const openModal = (section, data = {}, mode = "add") => {
        setModal({
            isOpen: true,
            section,
            mode,
            data: { ...data },
        });
    };

    const closeModal = () => {
        setModal({ isOpen: false, section: "", mode: "add", data: {} });
        setSuggestions([]);
    };

    // Save modal data
    const handleSave = async () => {
        const { section, mode, data } = modal;
        if (!section) return closeModal();

        // Prepare data for backend
        let updatePayload = { email: user?.email }; // Identify user for now

        if (section === "about") {
            updatePayload.bio = data.about || "";
        } else if (section === "profilePhoto") {
            updatePayload.profileImg = data.url || "";
        } else if (section === "coverPhoto") {
            updatePayload.coverPhoto = data.url || "";
        } else if (section === "skills") {
            updatePayload.skills = data.skill ? [...profile.skills, data.skill].join(', ') : profile.skills.join(', ');
        } else if (section === "profile") {
            updatePayload.headline = data.headline || "";
            updatePayload.linkedin = data.linkedin || "";
        } else if (section === "education") {
            // New logic: Send the whole education list
            const newEdu = mode === "edit"
                ? profile.education.map(ed => ed.id === data.id ? data : ed)
                : [...profile.education, data];
            updatePayload.education = newEdu;
        } else if (section === "experience") {
            const newExp = mode === "edit"
                ? profile.experiences.map(ex => ex.id === data.id ? data : ex)
                : [...profile.experiences, data];
            updatePayload.experience = newExp;
        } else if (section === "certificates") {
            const newCert = mode === "edit"
                ? profile.certificates.map(c => c.id === data.id ? data : c)
                : [...profile.certificates, data];
            updatePayload.certificates = newCert;
        } else if (section === "awards") {
            const newAwards = mode === "edit"
                ? profile.awards.map(a => a.id === data.id ? data : a)
                : [...profile.awards, data];
            updatePayload.awards = newAwards;
        } else if (section === "resume") {
            updatePayload.resume = data.url || "";
        }

        try {
            const response = await api.put("/users/profile", updatePayload);
            const result = response.data;

            if (result.success) {
                showToast("Profile updated successfully!", "success");

                // Update Global State
                updateUser(result.data);

                // Update Local State for UI consistency
                setProfile((p) => {
                    const clone = { ...p };

                    if (section === "about") {
                        clone.about = data.about || "";
                    } else if (section === "profilePhoto" || section === "coverPhoto") {
                        clone[section] = data.url || "";
                    } else if (section === "skills") {
                        if (data.skill && !clone.skills.includes(data.skill)) {
                            clone.skills = [...clone.skills, data.skill];
                        }
                    } else if (section === "profile") {
                        clone.name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
                        clone.headline = data.headline || "";
                        clone.location = data.location || "";
                        clone.linkedin = data.linkedin || "";
                    } else {
                        const listKey = section === "experience" ? "experiences" : section;
                        if (!clone[listKey]) clone[listKey] = [];

                        if (mode === "edit") {
                            clone[listKey] = clone[listKey].map(item => item.id === data.id ? data : item);
                        } else {
                            const newItem = { ...data, id: Date.now() };
                            clone[listKey] = [newItem, ...clone[listKey]];
                        }
                    }
                    return clone;
                });
            } else {
                showToast(result.message || "Failed to update profile", "error");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            showToast("Something went wrong while updating profile", "error");
        }

        closeModal();
    };

    const removeSkill = (skill) =>
        setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

    const removeItem = (section, id) =>
        setProfile((p) => {
            const clone = { ...p };
            clone[section] = clone[section].filter((item) => item.id !== id);
            return clone;
        });

    // File upload -> convert to dataURL for immediate preview
    const handleFile = (e, targetField) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setModal(m => ({ ...m, data: { ...m.data, url: reader.result } }));
        };
        reader.readAsDataURL(file);
    };

    // Small utility for export (download profile as JSON)
    const downloadProfile = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${profile.name}_profile.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // Fetch Analytics Data
    const fetchAnalytics = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/users/profile/analytics/${user.id}`);
            const result = res.data;
            if (result.success) {
                setAnalyticsData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        }
    };

    useEffect(() => {
        if (isOwnProfile && showPerformanceModal && !analyticsData) {
            fetchAnalytics();
        }
    }, [showPerformanceModal, isOwnProfile]);

    // Close modal on esc
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeModal();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);


    const employeeTypes = ["Full-time", "Part-time", "Internship", "Freelance", "Remote", "Contract"];
    const locationTypes = ["On-site", "Hybrid", "Remote"];

    const allSkills = [
        "JavaScript", "React", "Node.js", "Express", "MongoDB",
        "HTML", "CSS", "Bootstrap", "TypeScript",
        "Next.js", "Redux", "Git", "GitHub", "Docker",
        "AWS", "Linux", "SCSS", "Tailwind",
        "Java", "Python", "C++", "MySQL",
    ];

    return (
        <div className="pf-page">
            {/* Header / cover */}
            <div
                className={`pf-cover ${isLoading ? "skeleton-pulse" : ""}`}
                style={{
                    backgroundImage: !isLoading && profile.coverPhoto
                        ? `url(${profile.coverPhoto})`
                        : "linear-gradient(90deg,#f5f8fc,#ffffff)",
                }}
            >
                {isOwnProfile && !isLoading && (
                    <div className="pf-cover-controls">
                        <button
                            className="pf-btn small"
                            onClick={() => openModal("coverPhoto", { url: profile.coverPhoto })}
                            title="Change cover photo"
                        >
                            <FaCamera /> Cover
                        </button>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                className="pf-btn small brand"
                                onClick={() => setShowPerformanceModal(true)}
                                title="Insights and performance"
                                style={{
                                    background: COLORS.brandCorporate,
                                    color: "#fff",
                                    border: `1px solid ${COLORS.brandCorporate}`
                                }}
                            >
                                <FaMagic /> Show Performance
                            </button>
                            <button className="pf-btn small ghost" onClick={downloadProfile}>
                                <FaDownload /> Export
                            </button>
                        </div>
                    </div>
                )}

                <div className="pf-avatar-wrap">
                    <div className={`pf-avatar ${isLoading ? "skeleton-pulse" : ""}`}>
                        {isLoading ? (
                            <div className="pf-avatar-fallback skeleton-pulse"></div>
                        ) : profile.profilePhoto ? (
                            <img src={profile.profilePhoto} alt="avatar" />
                        ) : (
                            <div className="pf-avatar-fallback">CF</div>
                        )}
                        {isOwnProfile && !isLoading && (
                            <button className="pf-avatar-edit" onClick={() => openModal("profilePhoto", { url: profile.profilePhoto })}>
                                <FaCamera />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main two-column */}
            <div className="pf-main">
                {/* Left sticky card */}
                <aside className="pf-left">
                    <div className="card glass">
                        {isLoading ? (
                            <>
                                <div className="skeleton-pulse skeleton-title mb-2" style={{ width: "200px", height: "30px" }}></div>
                                <div className="skeleton-pulse skeleton-text mb-2" style={{ width: "250px" }}></div>
                                <div className="skeleton-pulse skeleton-text mb-4" style={{ width: "150px" }}></div>
                            </>
                        ) : (
                            <>
                                <h2 className="name">{profile.name}</h2>
                                <p className="muted">{profile.headline}</p>
                                <p className="location"><FaMapMarkerAlt /> {profile.location}</p>
                                {profile.linkedin && (
                                    <p className="linkedin" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                                        <FaLinkedin style={{ color: "#0077b5" }} />
                                        <a
                                            href={profile.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: COLORS.brandCorporate, textDecoration: "none", fontSize: "14px" }}
                                        >
                                            View LinkedIn Profile
                                        </a>
                                    </p>
                                )}
                            </>
                        )}


                        <hr />

                        <div>
                            <h6>Skills</h6>
                            <div className="skills">
                                {isLoading ? (
                                    [1, 2, 3, 4].map(i => <div key={i} className="skeleton-pulse skill-pill" style={{ width: "60px", height: "30px" }}></div>)
                                ) : (
                                    <>
                                        {Array.isArray(profile.skills) && profile.skills.map((s) => (
                                            <span key={s} className="skill-pill">
                                                {s}
                                                {isOwnProfile && (
                                                    <button className="skill-remove" onClick={() => removeSkill(s)} title="Remove">
                                                        <FaTrash size={10} />
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                        {isOwnProfile && (
                                            <button className="add-skill" onClick={() => openModal("skills")}>
                                                <FaPlus />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <hr />

                        <div>
                            <h6>Quick actions</h6>
                            {isOwnProfile && (
                                <div className="actions">
                                    <button className="action" onClick={() => openModal("experience")}>
                                        <FaBriefcase /> Add Experience
                                    </button>
                                    <button className="action" onClick={() => openModal("education")}>
                                        <FaGraduationCap /> Add Education
                                    </button>
                                    <button className="action" onClick={() => openModal("certificates")}>
                                        <FaCertificate /> Add Certificate
                                    </button>
                                    <button
                                        className="action"
                                        onClick={() => openModal("resume")}
                                        style={{
                                            width: "100%",
                                            background: "#fff",
                                            border: "1px solid #e5e7eb",
                                            padding: "10px",
                                            textAlign: "left",
                                            borderRadius: "8px",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <FaFileUpload style={{ color: "#3b82f6" }} />
                                        Upload Resume
                                    </button>

                                    <button
                                        className="action"
                                        onClick={() => navigate("/user/resume-templates")}
                                        style={{
                                            width: "100%",
                                            background: "#fff",
                                            border: "1px solid #e5e7eb",
                                            padding: "10px",
                                            textAlign: "left",
                                            borderRadius: "8px",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <FaMagic style={{ color: COLORS.brandCorporate }} />
                                        Resume Templates (Build)
                                    </button>

                                    <button
                                        className="action"
                                        onClick={() => navigate("/user/resume-templates?download=1")}
                                        style={{
                                            width: "100%",
                                            background: "#fff",
                                            border: "1px solid #e5e7eb",
                                            padding: "10px",
                                            textAlign: "left",
                                            borderRadius: "8px",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <FaDownload style={{ color: "#10b981" }} />
                                        Download Resume (PDF)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Right content */}
                <main className="pf-right">
                    {/* about */}
                    <div className="card glass">
                        <div className="card-header">
                            <h4 className="m-0">About</h4>
                            {isOwnProfile && !isLoading && (
                                <button className="btn-link" onClick={() => openModal("about", { about: profile.about }, "edit")}>
                                    <FaEdit size={16} />
                                </button>
                            )}
                        </div>
                        {isLoading ? (
                            <div className="skeleton-pulse skeleton-text mb-2" style={{ width: "100%", height: "80px" }}></div>
                        ) : (
                            <p style={{ lineHeight: 1.6, color: "#444" }}>{profile.about}</p>
                        )}
                    </div>

                    {/* experience */}
                    <div className="card glass">
                        <div className="card-header">
                            <h4 className="m-0">Experience</h4>
                            {isOwnProfile && !isLoading && (
                                <button className="btn-link" onClick={() => openModal("experience")}>
                                    <FaPlus size={16} />
                                </button>
                            )}
                        </div>
                        <div className="list">
                            {isLoading ? (
                                [1, 2].map(i => (
                                    <div key={i} className="list-item py-4">
                                        <div className="li-left">
                                            <div className="skeleton-pulse skeleton-text mb-2" style={{ width: "180px", height: "20px" }}></div>
                                            <div className="skeleton-pulse skeleton-text" style={{ width: "120px" }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                profile.experiences.map((ex) => (
                                    <div key={ex.id} className="list-item">
                                        <div className="li-left">
                                            <h5 className="fw-bold">{ex.role}</h5>
                                            <div className="accent small fw-semibold" style={{ color: COLORS.brandCorporate }}>
                                                {ex.company} · {ex.duration}
                                            </div>
                                            <p className="small mt-2">{ex.description}</p>
                                        </div>
                                        {isOwnProfile && (
                                            <div className="li-actions">
                                                <button className="btn-link" onClick={() => openModal("experience", ex, "edit")}>
                                                    <FaEdit size={14} />
                                                </button>
                                                <button className="btn-link text-danger" onClick={() => removeItem("experiences", ex.id)}>
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* education */}
                    <div className="card glass">
                        <div className="card-header">
                            <h4 className="m-0">Education</h4>
                            {isOwnProfile && !isLoading && (
                                <button className="btn-link" onClick={() => openModal("education")}>
                                    <FaPlus size={16} />
                                </button>
                            )}
                        </div>
                        <div className="list">
                            {isLoading ? (
                                <div className="skeleton-pulse skeleton-text py-4" style={{ width: "200px" }}></div>
                            ) : (
                                profile.education.map((ed) => (
                                    <div key={ed.id} className="list-item">
                                        <div className="li-left">
                                            <h5 className="fw-bold">{ed.institution}</h5>
                                            <div className="muted small">
                                                {ed.degree} · {ed.year}
                                            </div>
                                        </div>
                                        {isOwnProfile && (
                                            <div className="li-actions">
                                                <button className="btn-link" onClick={() => openModal("education", ed, "edit")}>
                                                    <FaEdit size={14} />
                                                </button>
                                                <button className="btn-link text-danger" onClick={() => removeItem("education", ed.id)}>
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="two-grid">
                        {/* certificates */}
                        <div className="card glass">
                            <div className="card-header">
                                <h5 className="m-0">Certificates</h5>
                                {isOwnProfile && !isLoading && (
                                    <button className="btn-link" onClick={() => openModal("certificates")}>
                                        <FaPlus size={14} />
                                    </button>
                                )}
                            </div>
                            {isLoading ? (
                                <div className="skeleton-pulse skeleton-text py-3" style={{ width: "150px" }}></div>
                            ) : (
                                profile.certificates.map((c) => (
                                    <div key={c.id} className="list-item-sm px-0">
                                        <div>
                                            <div className="fw-bold small">{c.title}</div>
                                            <div className="muted" style={{ fontSize: "0.75rem" }}>{c.issuer}</div>
                                        </div>
                                        {isOwnProfile && (
                                            <button className="btn-link text-danger" onClick={() => removeItem("certificates", c.id)}>
                                                <FaTrash size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* awards */}
                        <div className="card glass">
                            <div className="card-header">
                                <h5 className="m-0">Awards</h5>
                                {isOwnProfile && !isLoading && (
                                    <button className="btn-link" onClick={() => openModal("awards")}>
                                        <FaPlus size={14} />
                                    </button>
                                )}
                            </div>
                            {isLoading ? (
                                <div className="skeleton-pulse skeleton-text py-3" style={{ width: "150px" }}></div>
                            ) : (
                                profile.awards.map((a) => (
                                    <div key={a.id} className="list-item-sm px-0">
                                        <div>
                                            <div className="fw-bold small">{a.title}</div>
                                            <div className="muted" style={{ fontSize: "0.75rem" }}>{a.description}</div>
                                        </div>
                                        {isOwnProfile && (
                                            <button className="btn-link text-danger" onClick={() => removeItem("awards", a.id)}>
                                                <FaTrash size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* resume card */}
                    <div className="card glass">
                        <div className="card-header">
                            <h4 className="m-0">Resume</h4>
                            {isOwnProfile && !isLoading && (
                                <button className="btn-link" onClick={() => openModal("resume")}>
                                    <FaEdit size={16} />
                                </button>
                            )}
                        </div>
                        {isLoading ? (
                            <div className="skeleton-pulse skeleton-text py-4" style={{ width: "200px" }}></div>
                        ) : profile.resume ? (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                padding: "16px",
                                background: "rgba(59, 130, 246, 0.05)",
                                borderRadius: "12px",
                                border: "1px solid rgba(59, 130, 246, 0.1)"
                            }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#fff",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#3b82f6",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                }}>
                                    <FaFileUpload size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "700", color: "#1e293b" }}>My Current Resume</div>
                                    <div style={{ fontSize: "14px", color: "#64748b" }}>Uploaded to your profile</div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <a
                                        href={profile.resume}
                                        download={`${profile.name || 'User'}_Resume.pdf`}
                                        className="btn-link"
                                        style={{
                                            padding: "8px",
                                            background: "#fff",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                            color: "#10b981",
                                            display: "flex",
                                            alignItems: "center",
                                            textDecoration: "none"
                                        }}
                                    >
                                        <FaDownload size={18} />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "30px 20px",
                                border: "2px dashed #e5e7eb",
                                borderRadius: "12px",
                                color: "#6b7280"
                            }}>
                                <p style={{ marginBottom: "16px" }}>You haven't uploaded a resume yet.</p>
                                <button className="pf-btn brand" onClick={() => openModal("resume")}>
                                    <FaFileUpload /> Upload Resume
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ---------- Unified Premium Modal ---------- */}
            {modal.isOpen && (
                <div className="pf-modal-backdrop" onClick={closeModal}>
                    <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pf-modal-head">
                            <h4>{modal.mode} {modal.section.replace(/([A-Z])/g, ' $1')}</h4>
                            <button className="pf-close" onClick={closeModal}>✕</button>
                        </div>

                        <div className="pf-modal-body">
                            {/* PHOTO UPLOAD */}
                            {(modal.section === "coverPhoto" || modal.section === "profilePhoto") && (
                                <>
                                    <label className="label">Upload image</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleFile(e, modal.section)} />
                                    <div className="preview">
                                        {modal.data.url ? (
                                            <img src={modal.data.url} alt="preview" />
                                        ) : (
                                            <div className="muted small">Preview will appear here</div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* ABOUT */}
                            {modal.section === "about" && (
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                        <label className="label" style={{ marginBottom: 0 }}>About You</label>
                                        <button
                                            className="pf-btn small"
                                            onClick={generateAIBio}
                                            disabled={isGenerating}
                                            style={{
                                                background: "linear-gradient(90deg, #7c3aed, #db2777)",
                                                border: "none",
                                                color: "white",
                                                fontSize: "0.8rem",
                                                padding: "6px 12px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            {isGenerating ? (
                                                <>Generating...</>
                                            ) : (
                                                <><FaMagic /> Generate with AI</>
                                            )}
                                        </button>
                                    </div>
                                    <textarea
                                        rows={8}
                                        value={modal.data.about || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, about: e.target.value } })}
                                        placeholder="Write a brief bio or generate one with AI..."
                                        disabled={isGenerating}
                                    />
                                </>
                            )}

                            {/* PROFILE BASIC INFO */}
                            {modal.section === "profile" && (
                                <>
                                    <div className="two-grid">
                                        <div>
                                            <label className="label">First Name</label>
                                            <input
                                                type="text"
                                                value={modal.data.firstName || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, firstName: e.target.value } })}
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Last Name</label>
                                            <input
                                                type="text"
                                                value={modal.data.lastName || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, lastName: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                    <label className="label">Headline</label>
                                    <input
                                        type="text"
                                        value={modal.data.headline || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, headline: e.target.value } })}
                                    />
                                    <label className="label">Location</label>
                                    <input
                                        type="text"
                                        value={modal.data.location || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, location: e.target.value } })}
                                    />
                                    <label className="label">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        placeholder="https://www.linkedin.com/in/your-profile"
                                        value={modal.data.linkedin || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, linkedin: e.target.value } })}
                                    />
                                </>
                            )}

                            {/* SKILLS */}
                            {modal.section === "skills" && (
                                <div className="position-relative">
                                    <label className="label">Add Skill</label>
                                    <input
                                        type="text"
                                        placeholder="Search skill..."
                                        value={modal.data.skill || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setModal({ ...modal, data: { ...modal.data, skill: val } });
                                            if (val.length > 1) {
                                                const skills = ["React", "Node.js", "Python", "Docker", "AWS", "Figma", "MongoDB", "SQL"];
                                                setSuggestions(skills.filter(s => s.toLowerCase().includes(val.toLowerCase())));
                                            } else {
                                                setSuggestions([]);
                                            }
                                        }}
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className="skill-dropdown">
                                            {suggestions.map(s => (
                                                <li key={s} onClick={() => {
                                                    setModal({ ...modal, data: { ...modal.data, skill: s } });
                                                    setSuggestions([]);
                                                }}>{s}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* EXPERIENCE */}
                            {modal.section === "experience" && (
                                <>
                                    {/* Title / Role */}
                                    <label className="label">Title / Role *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Senior Software Engineer"
                                        value={modal.data.title || modal.data.role || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, title: e.target.value, role: e.target.value } })}
                                    />

                                    {/* Employee Type */}
                                    <label className="label">Employment Type *</label>
                                    <select
                                        value={modal.data.employeeType || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, employeeType: e.target.value } })}
                                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                    >
                                        <option value="">Select Employment Type</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Temporary">Temporary</option>
                                    </select>

                                    {/* Company / Organisation */}
                                    <label className="label">Company / Organisation *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Google, Microsoft"
                                        value={modal.data.company || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, company: e.target.value } })}
                                    />

                                    {/* Industry (Additional Field 1) */}
                                    <label className="label">Industry</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Information Technology, Finance"
                                        value={modal.data.industry || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, industry: e.target.value } })}
                                    />

                                    {/* Start Date */}
                                    <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div>
                                            <label className="label">Start Month *</label>
                                            <select
                                                value={modal.data.startMonth || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, startMonth: e.target.value } })}
                                                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", width: "100%" }}
                                            >
                                                <option value="">Month</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Start Year *</label>
                                            <input
                                                type="number"
                                                placeholder="2020"
                                                min="1950"
                                                max="2100"
                                                value={modal.data.startYear || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, startYear: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    {/* Currently Working Checkbox */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                                        <input
                                            type="checkbox"
                                            id="currentlyWorking"
                                            checked={modal.data.currentlyWorking || false}
                                            onChange={(e) => setModal({ ...modal, data: { ...modal.data, currentlyWorking: e.target.checked } })}
                                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                        />
                                        <label htmlFor="currentlyWorking" style={{ cursor: "pointer", margin: 0 }}>
                                            I am currently working in this role
                                        </label>
                                    </div>

                                    {/* End Date - Only show if not currently working */}
                                    {!modal.data.currentlyWorking && (
                                        <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                                            <div>
                                                <label className="label">End Month</label>
                                                <select
                                                    value={modal.data.endMonth || ""}
                                                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, endMonth: e.target.value } })}
                                                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", width: "100%" }}
                                                >
                                                    <option value="">Month</option>
                                                    <option value="January">January</option>
                                                    <option value="February">February</option>
                                                    <option value="March">March</option>
                                                    <option value="April">April</option>
                                                    <option value="May">May</option>
                                                    <option value="June">June</option>
                                                    <option value="July">July</option>
                                                    <option value="August">August</option>
                                                    <option value="September">September</option>
                                                    <option value="October">October</option>
                                                    <option value="November">November</option>
                                                    <option value="December">December</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">End Year</label>
                                                <input
                                                    type="number"
                                                    placeholder="2024"
                                                    min="1950"
                                                    max="2100"
                                                    value={modal.data.endYear || ""}
                                                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, endYear: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    <label className="label" style={{ marginTop: "16px" }}>Location</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Mumbai, India"
                                        value={modal.data.location || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, location: e.target.value } })}
                                    />

                                    {/* Location Type */}
                                    <label className="label">Location Type</label>
                                    <select
                                        value={modal.data.locationType || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, locationType: e.target.value } })}
                                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                    >
                                        <option value="">Select Location Type</option>
                                        <option value="On-site">On-site</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>

                                    {/* Profile Headline */}
                                    <label className="label">Profile Headline</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Building scalable web applications"
                                        value={modal.data.headline || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, headline: e.target.value } })}
                                    />

                                    {/* Description */}
                                    <label className="label">Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe your role, responsibilities, and key achievements..."
                                        value={modal.data.description || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                                    />

                                    {/* Responsibilities (Additional Field 2) */}
                                    <label className="label">Key Responsibilities</label>
                                    <textarea
                                        rows={3}
                                        placeholder="List your main responsibilities (one per line)"
                                        value={modal.data.responsibilities || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, responsibilities: e.target.value } })}
                                    />

                                    {/* Achievements (Additional Field 3) */}
                                    <label className="label">Achievements & Impact</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Highlight your key achievements and impact (e.g., Increased revenue by 30%)"
                                        value={modal.data.achievements || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, achievements: e.target.value } })}
                                    />

                                    {/* Skills */}
                                    <label className="label">Skills Used</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., React, Node.js, AWS (comma-separated)"
                                        value={modal.data.skills || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, skills: e.target.value } })}
                                    />

                                    {/* Reference Contact (Additional Field 4) */}
                                    <label className="label">Reference Contact (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., manager@company.com or +91-9876543210"
                                        value={modal.data.referenceContact || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, referenceContact: e.target.value } })}
                                    />

                                    {/* Media Upload */}
                                    <label className="label">Media (Images/Documents)</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf,.doc,.docx"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setModal(m => ({ ...m, data: { ...m.data, media: reader.result } }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {modal.data.media && (
                                        <div style={{ marginTop: "8px", padding: "8px", background: "#f5f6f8", borderRadius: "4px", fontSize: "12px" }}>
                                            ✓ Media uploaded
                                        </div>
                                    )}

                                    {/* LinkedIn Profile */}
                                    <label className="label">LinkedIn Profile (Optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://www.linkedin.com/in/your-profile"
                                        value={modal.data.linkedin || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, linkedin: e.target.value } })}
                                    />
                                </>
                            )}

                            {/* EDUCATION */}
                            {modal.section === "education" && (
                                <>
                                    {/* School/University */}
                                    <label className="label">School / University *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Harvard University, IIT Bombay"
                                        value={modal.data.institution || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, institution: e.target.value } })}
                                    />

                                    {/* Degree */}
                                    <label className="label">Degree *</label>
                                    <select
                                        value={modal.data.degree || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, degree: e.target.value } })}
                                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                    >
                                        <option value="">Select Degree</option>
                                        <option value="High School">High School</option>
                                        <option value="Associate Degree">Associate Degree</option>
                                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                                        <option value="Master's Degree">Master's Degree</option>
                                        <option value="MBA">MBA</option>
                                        <option value="PhD">PhD</option>
                                        <option value="Diploma">Diploma</option>
                                        <option value="Certificate">Certificate</option>
                                        <option value="Other">Other</option>
                                    </select>

                                    {/* Field of Study */}
                                    <label className="label">Field of Study *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Computer Science, Business Administration"
                                        value={modal.data.fieldOfStudy || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, fieldOfStudy: e.target.value } })}
                                    />

                                    {/* Start Date */}
                                    <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div>
                                            <label className="label">Start Month *</label>
                                            <select
                                                value={modal.data.startMonth || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, startMonth: e.target.value } })}
                                                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", width: "100%" }}
                                            >
                                                <option value="">Month</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Start Year *</label>
                                            <input
                                                type="number"
                                                placeholder="2020"
                                                min="1950"
                                                max="2100"
                                                value={modal.data.startYear || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, startYear: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    {/* Currently Studying Checkbox */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                                        <input
                                            type="checkbox"
                                            id="currentlyStudying"
                                            checked={modal.data.currentlyStudying || false}
                                            onChange={(e) => setModal({ ...modal, data: { ...modal.data, currentlyStudying: e.target.checked } })}
                                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                        />
                                        <label htmlFor="currentlyStudying" style={{ cursor: "pointer", margin: 0 }}>
                                            I am currently studying here
                                        </label>
                                    </div>

                                    {/* End Date - Only show if not currently studying */}
                                    {!modal.data.currentlyStudying && (
                                        <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                                            <div>
                                                <label className="label">End Month</label>
                                                <select
                                                    value={modal.data.endMonth || ""}
                                                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, endMonth: e.target.value } })}
                                                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", width: "100%" }}
                                                >
                                                    <option value="">Month</option>
                                                    <option value="January">January</option>
                                                    <option value="February">February</option>
                                                    <option value="March">March</option>
                                                    <option value="April">April</option>
                                                    <option value="May">May</option>
                                                    <option value="June">June</option>
                                                    <option value="July">July</option>
                                                    <option value="August">August</option>
                                                    <option value="September">September</option>
                                                    <option value="October">October</option>
                                                    <option value="November">November</option>
                                                    <option value="December">December</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">End Year (or Expected)</label>
                                                <input
                                                    type="number"
                                                    placeholder="2024"
                                                    min="1950"
                                                    max="2100"
                                                    value={modal.data.endYear || modal.data.year || ""}
                                                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, endYear: e.target.value, year: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Grade / CGPA */}
                                    <label className="label" style={{ marginTop: "16px" }}>Grade / CGPA</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 3.8/4.0, 85%, First Class"
                                        value={modal.data.grade || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, grade: e.target.value } })}
                                    />

                                    {/* Location */}
                                    <label className="label">Location</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Cambridge, MA, USA"
                                        value={modal.data.location || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, location: e.target.value } })}
                                    />

                                    {/* Activities & Societies */}
                                    <label className="label">Activities & Societies</label>
                                    <textarea
                                        rows={2}
                                        placeholder="e.g., Student Council, Debate Club, IEEE Member"
                                        value={modal.data.activities || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, activities: e.target.value } })}
                                    />

                                    {/* Description */}
                                    <label className="label">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe your academic experience, coursework, and achievements..."
                                        value={modal.data.description || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                                    />

                                    {/* Skills Acquired */}
                                    <label className="label">Skills Acquired</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Data Structures, Machine Learning, Python (comma-separated)"
                                        value={modal.data.skills || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, skills: e.target.value } })}
                                    />

                                    {/* Projects / Thesis */}
                                    <label className="label">Projects / Thesis</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe major projects, research work, or thesis..."
                                        value={modal.data.projects || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, projects: e.target.value } })}
                                    />

                                    {/* Honors & Awards */}
                                    <label className="label">Honors & Awards</label>
                                    <textarea
                                        rows={2}
                                        placeholder="e.g., Dean's List, Scholarship Recipient, Best Project Award"
                                        value={modal.data.honors || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, honors: e.target.value } })}
                                    />

                                    {/* Media Upload */}
                                    <label className="label">Media (Certificates/Documents)</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf,.doc,.docx"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setModal(m => ({ ...m, data: { ...m.data, media: reader.result } }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {modal.data.media && (
                                        <div style={{ marginTop: "8px", padding: "8px", background: "#f5f6f8", borderRadius: "4px", fontSize: "12px" }}>
                                            ✓ Media uploaded
                                        </div>
                                    )}

                                    {/* LinkedIn Profile */}
                                    <label className="label">LinkedIn Profile (Optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://www.linkedin.com/in/your-profile"
                                        value={modal.data.linkedin || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, linkedin: e.target.value } })}
                                    />
                                </>
                            )}

                            {/* CERTIFICATES */}
                            {modal.section === "certificates" && (
                                <>
                                    {/* Certificate Name */}
                                    <label className="label">Certificate Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., AWS Certified Solutions Architect"
                                        value={modal.data.title || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })}
                                    />

                                    {/* Issuing Organization */}
                                    <label className="label">Issuing Organization *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Amazon Web Services, Google, Microsoft"
                                        value={modal.data.issuer || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, issuer: e.target.value } })}
                                    />

                                    {/* Issue Date */}
                                    <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div>
                                            <label className="label">Issue Month *</label>
                                            <select
                                                value={modal.data.issueMonth || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, issueMonth: e.target.value } })}
                                                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", width: "100%" }}
                                            >
                                                <option value="">Month</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Issue Year *</label>
                                            <input
                                                type="number"
                                                placeholder="2024"
                                                min="1950"
                                                max="2100"
                                                value={modal.data.issueYear || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, issueYear: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    {/* Does Not Expire Checkbox */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                                        <input
                                            type="checkbox"
                                            id="doesNotExpire"
                                            checked={modal.data.doesNotExpire || false}
                                            onChange={(e) => setModal({ ...modal, data: { ...modal.data, doesNotExpire: e.target.checked } })}
                                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                        />
                                        <label htmlFor="doesNotExpire" style={{ cursor: "pointer", margin: 0 }}>
                                            This credential does not expire
                                        </label>
                                    </div>

                                    {/* Expiry Date - Only show if expires */}
                                    {!modal.data.doesNotExpire && (
                                        <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                                            <div>
                                                <label className="label">Expiry Month</label>
                                                <select
                                                    value={modal.data.expiryMonth || ""}
                                                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, expiryMonth: e.target.value } })}
                                                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", width: "100%" }}
                                                >
                                                    <option value="">Month</option>
                                                    <option value="January">January</option>
                                                    <option value="February">February</option>
                                                    <option value="March">March</option>
                                                    <option value="April">April</option>
                                                    <option value="May">May</option>
                                                    <option value="June">June</option>
                                                    <option value="July">July</option>
                                                    <option value="August">August</option>
                                                    <option value="September">September</option>
                                                    <option value="October">October</option>
                                                    <option value="November">November</option>
                                                    <option value="December">December</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Expiry Year</label>
                                                <input
                                                    type="number"
                                                    placeholder="2027"
                                                    min="1950"
                                                    max="2100"
                                                    value={modal.data.expiryYear || ""}
                                                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, expiryYear: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Credential ID */}
                                    <label className="label" style={{ marginTop: "16px" }}>Credential ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., ABC123XYZ789"
                                        value={modal.data.credentialId || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, credentialId: e.target.value } })}
                                    />

                                    {/* Credential URL */}
                                    <label className="label">Credential URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://www.credential-verification-url.com"
                                        value={modal.data.credentialUrl || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, credentialUrl: e.target.value } })}
                                    />

                                    {/* Description */}
                                    <label className="label">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe what this certification covers and its significance..."
                                        value={modal.data.description || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                                    />

                                    {/* Skills */}
                                    <label className="label">Skills Validated</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Cloud Architecture, DevOps, Security (comma-separated)"
                                        value={modal.data.skills || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, skills: e.target.value } })}
                                    />

                                    {/* Media Upload */}
                                    <label className="label">Certificate Image/PDF</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setModal(m => ({ ...m, data: { ...m.data, media: reader.result } }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {modal.data.media && (
                                        <div style={{ marginTop: "8px", padding: "8px", background: "#f5f6f8", borderRadius: "4px", fontSize: "12px" }}>
                                            ✓ Certificate uploaded
                                        </div>
                                    )}

                                    {/* LinkedIn Profile */}
                                    <label className="label">LinkedIn Profile (Optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://www.linkedin.com/in/your-profile"
                                        value={modal.data.linkedin || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, linkedin: e.target.value } })}
                                    />
                                </>
                            )}

                            {/* AWARDS */}
                            {modal.section === "awards" && (
                                <>
                                    {/* Award Title */}
                                    <label className="label">Award Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Employee of the Year, Best Innovation Award"
                                        value={modal.data.title || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })}
                                    />

                                    {/* Issuing Organization */}
                                    <label className="label">Issuing Organization *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Company Name, Industry Association"
                                        value={modal.data.organization || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, organization: e.target.value } })}
                                    />

                                    {/* Award Date */}
                                    <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div>
                                            <label className="label">Award Month *</label>
                                            <select
                                                value={modal.data.awardMonth || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, awardMonth: e.target.value } })}
                                                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", width: "100%" }}
                                            >
                                                <option value="">Month</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Award Year *</label>
                                            <input
                                                type="number"
                                                placeholder="2024"
                                                min="1950"
                                                max="2100"
                                                value={modal.data.awardYear || ""}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, awardYear: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <label className="label" style={{ marginTop: "16px" }}>Award Category</label>
                                    <select
                                        value={modal.data.category || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })}
                                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Performance">Performance Excellence</option>
                                        <option value="Innovation">Innovation</option>
                                        <option value="Leadership">Leadership</option>
                                        <option value="Academic">Academic Achievement</option>
                                        <option value="Community">Community Service</option>
                                        <option value="Technical">Technical Excellence</option>
                                        <option value="Other">Other</option>
                                    </select>

                                    {/* Description */}
                                    <label className="label">Description *</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe why you received this award and its significance..."
                                        value={modal.data.description || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                                    />

                                    {/* Achievement Details */}
                                    <label className="label">Achievement Details</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Specific achievements or metrics that led to this award..."
                                        value={modal.data.achievementDetails || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, achievementDetails: e.target.value } })}
                                    />

                                    {/* Associated With */}
                                    <label className="label">Associated With</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Project Name, Event, Competition"
                                        value={modal.data.associatedWith || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, associatedWith: e.target.value } })}
                                    />

                                    {/* Award URL */}
                                    <label className="label">Award URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://award-announcement-url.com"
                                        value={modal.data.awardUrl || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, awardUrl: e.target.value } })}
                                    />

                                    {/* Media Upload */}
                                    <label className="label">Award Image/Certificate</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setModal(m => ({ ...m, data: { ...m.data, media: reader.result } }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {modal.data.media && (
                                        <div style={{ marginTop: "8px", padding: "8px", background: "#f5f6f8", borderRadius: "4px", fontSize: "12px" }}>
                                            ✓ Award image uploaded
                                        </div>
                                    )}

                                    {/* LinkedIn Profile */}
                                    <label className="label">LinkedIn Profile (Optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://www.linkedin.com/in/your-profile"
                                        value={modal.data.linkedin || ""}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, linkedin: e.target.value } })}
                                    />
                                </>
                            )}

                            {/* RESUME SECTION */}
                            {modal.section === "resume" && (
                                <div className="resume-modal-content" style={{ textAlign: "center", padding: "20px" }}>
                                    <div className="resume-icon-main">
                                        <FaFileUpload size={40} />
                                    </div>
                                    <h3 style={{ marginBottom: "8px", fontWeight: "700" }}>Upload your resume</h3>
                                    <p className="muted" style={{ marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
                                        Sharing your resume helps recruiters find you for relevant roles.
                                        We support PDF, DOC, and DOCX formats.
                                    </p>

                                    <div className="resume-upload-zone" onClick={() => document.getElementById('resumeInput').click()}>
                                        <input
                                            type="file"
                                            id="resumeInput"
                                            hidden
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        setModal({ ...modal, data: { ...modal.data, url: reader.result, fileName: file.name, type: file.type } });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {modal.data.url ? (
                                            <div className="resume-success-preview">
                                                <div className="resume-icon-badge">
                                                    <FaFileUpload size={24} />
                                                </div>
                                                <div style={{ fontWeight: "700", fontSize: "16px" }}>{modal.data.fileName || "Resume selected!"}</div>
                                                <div style={{ fontSize: "14px", marginTop: "4px", opacity: 0.8 }}>Ready to update your profile</div>
                                            </div>
                                        ) : (
                                            <div className="resume-prompt">
                                                <div className="resume-icon-badge-blue">
                                                    <FaPlus />
                                                </div>
                                                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>Drop your resume here</div>
                                                <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>or click to browse from your computer</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pf-modal-foot">
                            <button className="pf-btn ghost" onClick={closeModal}>Cancel</button>
                            <button className="pf-btn primary" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Insights Modal */}
            <Modal
                show={showPerformanceModal}
                onHide={() => setShowPerformanceModal(false)}
                size="lg"
                centered
                contentClassName="glass border-0"
                style={{ backdropFilter: "blur(10px)" }}
            >
                <Modal.Header closeButton className="border-0 bg-transparent px-4 pt-4">
                    <Modal.Title className="fw-bold d-flex align-items-center">
                        <div className="icon-badge-brand me-3" style={{
                            background: `${COLORS.brandCorporate}15`,
                            color: COLORS.brandCorporate,
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FaMagic size={20} />
                        </div>
                        <span style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>Performance Insights</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 bg-transparent" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                    <div className="mb-4">
                        <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Overview</h5>
                        <p className="text-muted small">Engagement metrics for your professional profile.</p>
                    </div>

                    <EngagementOverview
                        stats={analyticsData ? {
                            profileViews: analyticsData.totalViews,
                            connections: analyticsData.totalConnections,
                            posts: analyticsData.totalPosts
                        } : {
                            profileViews: profile.profileViews,
                            connections: profile.connections,
                            posts: profile.posts
                        }}
                    />

                    <div className="mt-4">
                        <ProfileAnalytics data={analyticsData} />
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 bg-transparent">
                    <Button variant="secondary" onClick={() => setShowPerformanceModal(false)} className="rounded-pill px-4">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
