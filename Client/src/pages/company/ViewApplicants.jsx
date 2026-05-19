import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  FaUserTie,
  FaEnvelope,
  FaPhoneAlt,
  FaEye,
  FaCalendarAlt,
  FaTimesCircle,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaUserCheck,
  FaLinkedin,
  FaGithub,
  FaDownload,
  FaBuilding,
  // FaUserCheck,
  FaGlobe,
  FaMapMarkerAlt,
  FaRobot,
  FaClock,
  FaVideo,
  FaBriefcase
} from "react-icons/fa";

/* ================= THEME ================= */
const COLORS = {
  primary: "#0073b1",
  secondary: "#e8f4fb",
  textDark: "#1f1f1f",
  textLight: "#606770",
  border: "#e0e0e0",
  white: "#ffffff",
  hover: "#f7f9fa",
  bg: "#f3f2ef",
  success: "#0073b1", // Updated to blue for Hired status
  danger: "#cc1016",  // Added for Rejected status
};

const dummyApplicants = [
  {
    id: 1,
    name: "Rohit Malhotra",
    role: "Senior DevOps Engineer",
    experience: "4 Years",
    education: "B.Tech in CSE",
    email: "rohit.m@example.com",
    phone: "+91 98765 22110",
    location: "Pune, India",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    status: "Applied",
    profileImg: "https://randomuser.me/api/portraits/men/32.jpg",
    coverLetter: "I am passionate about automating infrastructure and ensuring high availability...",
    appliedDate: "2 days ago",
    matchScore: 92,
    aiAnalysis: {
      summary: "Top-tier candidate. Strong Kubernetes experience aligns perfectly with backend scaling needs.",
      technical: 95,
      culture: 88,
      tags: ["High Performer", "Immediate Value"]
    }
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Product Manager",
    experience: "6 Years",
    education: "MBA",
    email: "priya.s@example.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    skills: ["Agile", "JIRA", "Roadmapping", "User Research"],
    status: "Shortlisted",
    profileImg: "https://randomuser.me/api/portraits/women/44.jpg",
    coverLetter: "Driving product vision from 0 to 1 is my forte. I have led multiple successful launches...",
    appliedDate: "5 days ago",
    matchScore: 88,
    aiAnalysis: {
      summary: "Excellent strategic thinker. Proven track record in B2B SaaS product scaling.",
      technical: 82,
      culture: 94,
      tags: ["Leadership Material", "User Centric"]
    }
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Frontend Developer",
    experience: "3 Years",
    education: "B.E. IT",
    email: "amit.p@example.com",
    phone: "+91 91234 56789",
    location: "Ahmedabad, India",
    skills: ["React", "TypeScript", "Tailwind", "Redux"],
    status: "Interviewing",
    interviewDetails: {
      type: "Online",
      date: "2024-03-25T14:30",
      link: "https://meet.google.com/abc-defg-hij"
    },
    profileImg: "https://randomuser.me/api/portraits/men/22.jpg",
    coverLetter: "I build pixel-perfect user interfaces with a focus on performance and accessibility...",
    appliedDate: "1 week ago",
    matchScore: 95,
    aiAnalysis: {
      summary: "Exceptional UI coding skills. React profiling indicates high optimization capabilities.",
      technical: 98,
      culture: 85,
      tags: ["Code Ninja", "Frontend Specialist"]
    }
  },
  {
    id: 4,
    name: "Sneha Gupta",
    role: "UI/UX Designer",
    experience: "2 Years",
    education: "B.Des",
    email: "sneha.g@example.com",
    phone: "+91 99887 76655",
    location: "Delhi, India",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    status: "Applied",
    profileImg: "https://randomuser.me/api/portraits/women/24.jpg",
    coverLetter: "Designing intuitive user experiences that delight users is what I strive for...",
    appliedDate: "1 day ago",
    matchScore: 78,
    aiAnalysis: {
      summary: "Good visual portfolio. Needs more experience with complex design systems.",
      technical: 75,
      culture: 90,
      tags: ["Creative", "Rising Star"]
    }
  },
  {
    id: 8,
    name: "Kavita Nair",
    role: "HR Manager",
    experience: "8 Years",
    education: "MBA HR",
    email: "kavita.n@example.com",
    phone: "+91 55443 32211"
  }
];

/* ================= COMPONENT ================= */
export default function ViewApplicants() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState("Grid"); // "Grid" or "Pipeline"
  const [search, setSearch] = useState("");
  const [sortByAI, setSortByAI] = useState(true); // Default to AI ranking
  const [showSchedule, setShowSchedule] = useState(false);
  const [interviewData, setInterviewData] = useState({ type: "Online", date: "", location: "TechNova HQ, Cyber City, Pune", link: "" });
  const [toast, setToast] = useState({ msg: "", type: "success" }); // Improved toast state
  const [applicants, setApplicants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchApplicants = async () => {
    // If no jobId is provided, fetch all applicants for the current company
    const endpoint = jobId
      ? `/companies/jobs/applicants/${jobId}`
      : `/companies/jobs/all-applicants/${user?.id || user?.company?.id}`;

    if (!jobId && !user?.id && !user?.company?.id) return;

    setIsLoading(true);
    try {
      const res = await api.get(endpoint);
      const data = res.data;
      if (data.success) {
        setApplicants(data.data);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || user?.company?.id || jobId) {
      fetchApplicants();
    }
  }, [jobId, user?.id, user?.company?.id]);

  /* ================= HELPERS ================= */
  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const updateStatus = async (id, status, extraData = {}) => {
    try {
      const dbStatus = status.toUpperCase().replace(/ /g, "_");
      const res = await api.put(`/companies/jobs/application-status/${id}`, { status: dbStatus });
      const data = res.data;
      if (data.success) {
        notify(`Status updated to ${status}`);
        fetchApplicants();
        if (selectedUser && selectedUser.id === id) {
          setSelectedUser(prev => ({ ...prev, status: status, ...extraData }));
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      notify("Failed to update status", "danger");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedUser) return;
    if (!interviewData.date || !interviewData.link && interviewData.type === "Online") {
      notify("Please fill in all interview details", "danger");
      return;
    }

    try {
      const res = await api.post(`/companies/jobs/schedule-interview/${selectedUser.id}`, {
        type: interviewData.type,
        scheduledAt: interviewData.date,
        location: interviewData.type === "Online" ? interviewData.link : interviewData.location,
        notes: "Scheduled via Talent Pipeline"
      });
      const data = res.data;
      if (data.success) {
        notify("Interview scheduled successfully!");
        setShowSchedule(false);
        fetchApplicants();
        // Update selected user status locally to reflect change instantly
        if (selectedUser) {
          setSelectedUser(prev => ({
            ...prev,
            status: "Interviewing",
            interviewDetails: {
              type: interviewData.type,
              date: interviewData.date,
              location: interviewData.type === "Online" ? interviewData.link : interviewData.location,
              link: interviewData.type === "Online" ? interviewData.link : ""
            }
          }));
        }
      } else {
        notify(data.message || "Failed to schedule interview", "danger");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      notify("Failed to schedule interview", "danger");
    }
  };

  // Filter & Sort Logic
  const filteredApplicants = applicants
    .filter(app => {
      const matchStatus = activeTab === "All" ? true : app.status === activeTab;
      const matchSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => sortByAI ? b.matchScore - a.matchScore : 0);

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied": return { bg: "#e8f4fb", text: "#0073b1" }; // Blue
      case "Shortlisted": return { bg: "#fff3cf", text: "#9c6d04" }; // Gold
      case "Interviewing": return { bg: "#e8f0fe", text: "#1a73e8" }; // Darker Blue
      case "Hired": return { bg: "#dcfce7", text: "#057642" }; // Green
      case "Rejected": return { bg: "#fee2e2", text: "#cc1016" }; // Red
      default: return { bg: COLORS.bg, text: COLORS.textLight };
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* HEADER SECTION */}
      <div className="bg-white border-bottom px-4 py-3 sticky-top" style={{ zIndex: 10, top: "85px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: COLORS.textDark }}>Talent Pipeline</h4>
          </div>

          <div className="d-flex bg-light p-1 rounded-3">
            <button
              className={`btn btn-sm px-3 fw-bold ${viewMode === "Grid" ? "bg-white shadow-sm" : "text-muted"}`}
              onClick={() => setViewMode("Grid")}
              style={{ transition: "0.2s" }}
            >
              Grid View
            </button>
            <button
              className={`btn btn-sm px-3 fw-bold ${viewMode === "Pipeline" ? "bg-white shadow-sm" : "text-muted"}`}
              onClick={() => { setViewMode("Pipeline"); setActiveTab("All"); }}
              style={{ transition: "0.2s" }}
            >
              Pipeline View
            </button>
          </div>
        </div>


        {/* ===== TOAST ===== */}
        {toast.msg && (
          <div className={`position-fixed bottom-0 end-0 m-4 px-4 py-3 text-white rounded-3 shadow-lg d-flex align-items-center gap-2 ${toast.type === 'danger' ? 'bg-danger' : 'bg-success'}`} style={{ zIndex: 3000, animation: "slideLeft 0.3s ease-out" }}>
            {toast.type === 'danger' ? <FaTimesCircle className="fs-5" /> : <FaCheckCircle className="fs-5" />}
            <div>
              <div className="fw-bold">{toast.type === 'danger' ? 'Error' : 'Success'}</div>
              <div className="small opacity-75">{toast.msg}</div>
            </div>
          </div>
        )}

        {/* TABS & SEARCH */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          {viewMode === "Grid" && (
            <div className="d-flex gap-2 bg-light p-1 rounded-pill animate-fade-in">
              {["All", "Applied", "Shortlisted", "Interviewing", "Hired", "Rejected"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`btn btn-sm rounded-pill px-3 fw-medium ${activeTab === tab ? "bg-white shadow-sm" : "text-muted"}`}
                  style={{
                    color: activeTab === tab ? COLORS.primary : COLORS.textLight,
                    transition: "all 0.2s"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          <div className="d-flex align-items-center gap-3 ms-auto">
            {/* AI Ranking Toggle */}
            <div className="form-check form-switch bg-white px-4 py-2 rounded-pill shadow-sm border d-flex align-items-center gap-2 m-0" style={{ cursor: "pointer" }}>
              <input
                className="form-check-input ms-0"
                type="checkbox"
                role="switch"
                id="aiRanking"
                checked={sortByAI}
                onChange={(e) => setSortByAI(e.target.checked)}
              />
              <label className="form-check-label small fw-bold text-primary mb-0" htmlFor="aiRanking" style={{ cursor: "pointer" }}>
                <FaRobot className="me-1" /> AI Rank
              </label>
            </div>

            <div className="position-relative">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="form-control rounded-pill ps-5 border-0 bg-light shadow-sm"
                style={{ width: "250px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* CONTENT GRID / PIPELINE */}
      <div className="container-fluid p-4">
        {viewMode === "Pipeline" ? (
          /* KANBAN PIPELINE VIEW */
          <div className="d-flex gap-4 overflow-auto pb-4" style={{ minHeight: "calc(100vh - 250px)" }}>
            {["Applied", "Shortlisted", "Interviewing", "Hired", "Rejected"].map(stage => {
              const stageApplicants = applicants.filter(a => a.status === stage &&
                (a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
              );
              return (
                <div key={stage} className="pipeline-column d-flex flex-column gap-3" style={{ minWidth: "320px", width: "320px" }}>
                  <div className="d-flex justify-content-between align-items-center px-2">
                    <h6 className="fw-bold m-0 d-flex align-items-center gap-2">
                      <span className="p-1 rounded-circle" style={{ width: 10, height: 10, backgroundColor: getStatusColor(stage).text }}></span>
                      {stage}
                    </h6>
                    <span className="badge bg-light text-muted rounded-pill fs-xs">{stageApplicants.length}</span>
                  </div>

                  <div className="flex-grow-1 d-flex flex-column gap-3 p-2 bg-light bg-opacity-50 rounded-4 border-dash" style={{ border: "2px dashed #e0e0e0" }}>
                    {stageApplicants.map(app => (
                      <div
                        key={app.id}
                        className={`card border-0 shadow-sm rounded-4 p-3 cursor-pointer slide-up ${selectedUser?.id === app.id ? "border-primary-heavy shadow" : ""}`}
                        style={{ transition: "all 0.2s", border: selectedUser?.id === app.id ? `2px solid ${COLORS.primary}` : "none" }}
                        onClick={() => setSelectedUser(app)}
                      >
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <img src={app.profileImg} className="rounded-circle border" width="40" height="40" alt={app.name} />
                          <div className="overflow-hidden">
                            <div className="fw-bold text-truncate small">{app.name}</div>
                            <div className="text-muted text-truncate" style={{ fontSize: "11px" }}>{app.role}</div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className={`badge rounded-pill fs-xs ${app.matchScore > 90 ? "bg-primary" : "bg-light text-primary"}`} style={{ fontSize: "9px" }}>
                            {app.matchScore}% AI Match
                          </div>
                          <FaEye className="text-muted small" />
                        </div>
                      </div>
                    ))}
                    {stageApplicants.length === 0 && (
                      <div className="text-center py-5 opacity-25">
                        <FaUserTie size={30} className="mb-2" />
                        <div className="small fw-bold">No candidates here</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW */
          <div className="row g-4">
            {/* LIST OF APPLICANTS */}
            <div className={`col-lg-${selectedUser && viewMode === "Grid" ? '7' : '12'} transition-all`}>
              <div className="row g-3">
                {isLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="col-xl-4 col-lg-6">
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: 62, height: 62 }}></div>
                            <div className="flex-grow-1">
                              <div className="skeleton skeleton-pulse skeleton-title" style={{ width: "80%" }}></div>
                              <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "60%", height: "10px" }}></div>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-2 mb-4">
                            {[1, 2, 3].map(s => (
                              <div key={s} className="skeleton skeleton-pulse" style={{ width: "50px", height: "20px", borderRadius: "20px" }}></div>
                            ))}
                          </div>
                          <hr className="opacity-50" />
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "80px" }}></div>
                            <div className="skeleton skeleton-pulse skeleton-btn" style={{ width: "100px" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  filteredApplicants.map((applicant) => (
                    <div key={applicant.id} className="col-xl-4 col-lg-6 slide-up">
                      <div
                        className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover position-relative ${selectedUser?.id === applicant.id ? "border-primary-heavy shadow" : ""}`}
                        style={{ transition: "all 0.3s ease", border: selectedUser?.id === applicant.id ? `2px solid ${COLORS.primary}` : "none" }}
                        onClick={() => setSelectedUser(applicant)}
                      >
                        <div className="card-body p-4">
                          {/* Header: Profile & Score */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="position-relative">
                              <img
                                src={applicant.profileImg}
                                className={`rounded-circle border border-2 shadow-sm ${applicant.matchScore > 90 ? "border-dark border-opacity-10" : "border-white"}`}
                                width="62" height="62"
                                alt={applicant.name}
                              />
                              {applicant.matchScore > 90 && (
                                <div
                                  className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle d-flex align-items-center justify-content-center border border-white shadow-sm"
                                  style={{ width: 22, height: 22, fontSize: "10px" }}
                                  title="Top Talent"
                                >
                                  <FaRobot />
                                </div>
                              )}
                            </div>
                            <div className="text-end">
                              <div className={`badge rounded-pill mb-1 ${applicant.matchScore > 90 ? "bg-dark bg-opacity-75" : "bg-light text-secondary border"}`}>
                                {applicant.matchScore}% Match
                              </div>
                              <div className="small text-muted d-block">{applicant.appliedDate}</div>
                            </div>
                          </div>

                          {/* Candidate Info */}
                          <h5 className="fw-bold text-dark mb-1">{applicant.name}</h5>
                          <p className="text-muted small fw-medium mb-3">{applicant.role}</p>

                          {/* Skills Tags */}
                          <div className="d-flex flex-wrap gap-2 mb-4">
                            {Array.isArray(applicant.skills) ? applicant.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="badge bg-light text-secondary fw-medium px-3 py-2 rounded-pill" style={{ fontSize: "10px" }}>
                                {skill}
                              </span>
                            )) : (
                              applicant.skills && applicant.skills.split(',').slice(0, 3).map((skill, i) => (
                                <span key={i} className="badge bg-light text-secondary fw-medium px-3 py-2 rounded-pill" style={{ fontSize: "10px" }}>
                                  {skill.trim()}
                                </span>
                              ))
                            )}
                            {Array.isArray(applicant.skills) && applicant.skills.length > 3 && <span className="small text-muted pt-1">+{applicant.skills.length - 3}</span>}
                          </div>

                          <hr className="opacity-50" />

                          {/* Footer Actions */}
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-1 text-muted small">
                              <span className={`p-1 rounded-circle bg-opacity-10 d-inline-block`} style={{ backgroundColor: applicant.status === "Applied" ? "#333" : COLORS.primary, width: 8, height: 8 }}></span>
                              {applicant.status}
                            </div>

                            <button
                              className="btn btn-sm px-4 py-2 rounded-pill fw-bold border"
                              style={{
                                backgroundColor: selectedUser?.id === applicant.id ? COLORS.primary : "white",
                                color: selectedUser?.id === applicant.id ? "white" : COLORS.primary,
                                transition: "0.2s"
                              }}
                              onClick={() => setSelectedUser(applicant)}
                            >
                              <FaEye className="me-2" /> View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DETAILS PANEL (SIDEBAR) - GRID VIEW INTEGRATION */}
            {selectedUser && viewMode === "Grid" && (
              <div className="col-lg-5">
                <div className="sticky-top" style={{ top: "180px", zIndex: 5 }}>
                  <DetailsPanel
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    setShowSchedule={setShowSchedule}
                    updateStatus={updateStatus}
                    navigate={navigate}
                    COLORS={COLORS}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* DETAILS PANEL (DRAWER) - PIPELINE VIEW INTEGRATION */}
        {selectedUser && viewMode === "Pipeline" && (
          <div
            className="position-fixed end-0 top-0 h-100 shadow-2xl bg-white slide-left"
            style={{ zIndex: 2000, width: "450px" }}
          >
            <DetailsPanel
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              setShowSchedule={setShowSchedule}
              updateStatus={updateStatus}
              navigate={navigate}
              COLORS={COLORS}
            />
          </div>
        )}
      </div>

      {/* ===== SCHEDULE INTERVIEW MODAL ===== */}
      {showSchedule && selectedUser && (
        <Modal title="Schedule Interview" close={() => setShowSchedule(false)}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Interview Type</label>
            <div className="d-flex gap-3">
              {["Online", "Offline"].map(type => (
                <div key={type}
                  className={`p-3 rounded-3 border w-100 text-center cursor-pointer ${interviewData.type === type ? "bg-light border-primary text-primary fw-bold" : "text-muted"}`}
                  style={{ cursor: "pointer", transition: "0.2s" }}
                  onClick={() => setInterviewData({ ...interviewData, type: type })}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Date & Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={interviewData.date}
              onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
            />
          </div>

          {interviewData.type === "Online" ? (
            <div className="mb-4 animate-fade-in">
              <label className="form-label small fw-bold text-muted">Meeting Link</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><FaGlobe /></span>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://meet.google.com/..."
                  value={interviewData.link}
                  onChange={(e) => setInterviewData({ ...interviewData, link: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="mb-4 animate-fade-in">
              <label className="form-label small fw-bold text-muted">Office Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><FaBuilding /></span>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Enter full office address..."
                  value={interviewData.location}
                  onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                ></textarea>
              </div>
            </div>
          )}

          <div className="form-check mb-4">
            <input className="form-check-input" type="checkbox" id="syncCal" defaultChecked />
            <label className="form-check-label small text-muted" htmlFor="syncCal">
              Sync to Google Calendar <FaCalendarAlt className="ms-1 text-primary" />
            </label>
          </div>

          <button
            className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
            onClick={handleScheduleInterview}
          >
            Confirm Schedule
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ================= COMPONENT: DETAILS PANEL ================= */
const DetailsPanel = ({ selectedUser, setSelectedUser, setShowSchedule, updateStatus, navigate, COLORS }) => {
  return (
    <div className="card border-0 h-100 shadow-2xl glass-panel animate-slide-in-right" style={{ borderRadius: "24px", overflow: "hidden" }}>
      {/* Premium Glass Header */}
      <div className="p-4 d-flex justify-content-between align-items-center sticky-top glass-header" style={{ zIndex: 10 }}>
        <div>
          <h5 className="fw-bold m-0 text-dark">Candidate Profile</h5>
          <span className="text-primary fw-bold" style={{ fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>Talent Intelligence</span>
        </div>
        <button
          className="btn-close shadow-none p-2 bg-light rounded-circle"
          onClick={() => { setSelectedUser(null); setShowSchedule(false); }}
          style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}
        ></button>
      </div>

      <div className="card-body p-0 custom-scrollbar" style={{ overflowY: "auto", maxHeight: "calc(100vh - 80px)" }}>
        {/* Profile Hero Section - Clean & Professional */}
        <div className="text-center py-5 px-4 position-relative border-bottom bg-light bg-opacity-25">
          <div className="position-relative d-inline-block mb-4">
            <img
              src={selectedUser.profileImg || "https://randomuser.me/api/portraits/lego/1.jpg"}
              className="rounded-circle border border-4 border-white shadow-md position-relative"
              width="110" height="110"
              style={{ objectFit: "cover", zIndex: 2 }}
              alt="Profile"
            />
          </div>

          <h4 className="fw-extra-bold mb-1 text-dark tracking-tight">{selectedUser.name}</h4>
          <p className="text-muted mb-3 fw-medium d-flex align-items-center justify-content-center gap-2">
            <span className="badge bg-light border text-dark px-3 py-2 rounded-pill fs-xs">
              {selectedUser.role}
            </span>
            <span className="text-secondary opacity-50">•</span>
            <span className="small">{selectedUser.experience} Exp.</span>
          </p>

          <div className="d-flex justify-content-center gap-2 mt-4">
            {[
              { icon: <FaLinkedin size={18} />, color: "#0077b5", bg: "#f0f9ff" },
              { icon: <FaGithub size={18} />, color: "#333", bg: "#f8f9fa" },
              { icon: <FaEnvelope size={18} />, color: COLORS.primary, bg: "#f0f9ff" }
            ].map((social, i) => (
              <button
                key={i}
                className="btn border rounded-4 p-3 d-flex align-items-center justify-content-center transition-all hover-lift"
                style={{ backgroundColor: social.bg, color: social.color }}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-5 pt-4">
          {/* AI Score Card - Modern Sleek Intelligence Design */}
          <div className="premium-intelligence-card p-4 rounded-4 mb-5 border shadow-sm position-relative overflow-hidden">
            <div className="position-relative" style={{ zIndex: 1 }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                    <FaRobot size={22} />
                  </div>
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Talent Intelligence</h6>
                    <span className="text-muted fs-xs fw-medium">AI-Powered Compatibility Analysis</span>
                  </div>
                </div>
                <div className="intelligence-score-box">
                  <span className="int-score">{selectedUser.matchScore}</span>
                  <span className="int-label">% Fit</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between text-dark small mb-2">
                  <span className="fw-bold">Technical Proficiency</span>
                  <span className="fw-bold text-primary">{selectedUser.aiAnalysis?.technical || 0}%</span>
                </div>
                <div className="progress rounded-pill bg-light" style={{ height: "10px" }}>
                  <div
                    className="progress-bar bg-primary rounded-pill progress-bar-animated progress-bar-striped"
                    style={{ width: `${selectedUser.aiAnalysis?.technical || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="insight-box p-3 rounded-3 mb-4 border-start border-4 border-primary bg-light">
                <p className="text-dark fs-7 mb-0 fw-medium italic" style={{ lineHeight: "1.6" }}>
                  "{selectedUser.aiAnalysis?.summary || "Analyzing candidate profile for potential fit..."}"
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {selectedUser.aiAnalysis?.tags?.map((tag, i) => (
                  <span key={i} className="badge rounded-pill bg-white border text-primary px-3 py-2 fw-bold fs-xs shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="section-container mb-5">
            <h6 className="section-title mb-4">Essential Information</h6>
            <div className="row g-4">
              {[
                { label: "Education", value: selectedUser.education, icon: <FaUserTie />, col: 12 },
                { label: "Experience", value: selectedUser.experience, icon: <FaBriefcase />, col: 6 },
                { label: "Location", value: selectedUser.location, icon: <FaMapMarkerAlt />, col: 6 },
                { label: "Email Address", value: selectedUser.email, icon: <FaEnvelope />, col: 12 },
                { label: "Phone Number", value: selectedUser.phone, icon: <FaPhoneAlt />, col: 12 }
              ].map((item, i) => (
                <div key={i} className={`col-${item.col}`}>
                  <div className="d-flex align-items-start gap-3">
                    <div className="info-icon shadow-sm">{item.icon}</div>
                    <div className="flex-grow-1 overflow-hidden">
                      <span className="text-muted fs-xs fw-bold text-uppercase tracking-wider">{item.label}</span>
                      <p className="mb-0 text-dark fw-bold fs-7 text-truncate">{item.value || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Details (If Scheduled) */}
          {selectedUser.status === "Interviewing" && selectedUser.interviewDetails && (
            <div className="section-container mb-5 schedule-glow p-4 rounded-4 border border-primary border-opacity-25">
              <h6 className="section-title text-primary mb-3">
                <FaClock className="me-2" /> Interview Intelligence
              </h6>
              <div className="bg-white p-3 rounded-3 shadow-sm border">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-primary px-3 py-2 rounded-3">{selectedUser.interviewDetails.type}</span>
                  <span className="text-dark fw-bold fs-7">{new Date(selectedUser.interviewDetails.date).toLocaleString()}</span>
                </div>

                {selectedUser.interviewDetails.type === "Online" ? (
                  <div className="d-flex flex-column gap-3 mt-2">
                    <div className="p-2 bg-light rounded-2 text-truncate small">
                      <FaGlobe className="text-primary me-2" />
                      <a href={selectedUser.interviewDetails.link} target="_blank" rel="noreferrer" className="text-primary fw-medium">
                        {selectedUser.interviewDetails.link}
                      </a>
                    </div>
                    <button
                      className="btn btn-dark w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-lg transition-all hover-scale"
                      onClick={() => navigate(`/company/interview/${selectedUser.interviewDetails.id}`)}
                    >
                      <FaVideo />
                      <span className="fw-bold">Join Interview Room</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded-3 small text-dark fw-medium border-start border-4 border-primary">
                    <FaMapMarkerAlt className="text-primary me-2" /> {selectedUser.interviewDetails.location}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cover Letter Section */}
          <div className="section-container mb-5">
            <h6 className="section-title mb-3">Candidate Pitch</h6>
            <div className="cover-letter-box p-4 rounded-4 bg-light position-relative">
              <div className="quote-icon p-3 bg-white shadow-sm rounded-circle opacity-50 position-absolute" style={{ top: "-15px", left: "20px", fontSize: "1.5rem", lineHeight: "1" }}>“</div>
              <p className="small text-muted mb-0 fst-italic fw-medium" style={{ lineHeight: "1.8", color: "#4b5563 !important" }}>
                {selectedUser.coverLetter || "No cover letter provided by the candidate."}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky-bottom mt-5 pt-3 bg-white">
            <div className="d-grid gap-3">
              {(() => {
                const btnStyle = { padding: "14px", borderRadius: "16px", fontWeight: "700", transition: "0.3s" };
                switch (selectedUser.status) {
                  case "Applied":
                    return (
                      <div className="d-flex gap-3">
                        <button className="btn btn-outline-danger flex-fill shadow-sm hover-lift" style={btnStyle} onClick={() => updateStatus(selectedUser.id, "Rejected")}>Reject</button>
                        <button className="btn btn-primary flex-fill shadow-lg hover-lift-heavy" style={btnStyle} onClick={() => updateStatus(selectedUser.id, "Shortlisted")}>Shortlist Candidate</button>
                      </div>
                    );
                  case "Shortlisted":
                    return (
                      <div className="d-flex gap-3">
                        <button className="btn btn-outline-danger flex-fill shadow-sm hover-lift" style={btnStyle} onClick={() => updateStatus(selectedUser.id, "Rejected")}>Reject</button>
                        <button className="btn btn-primary flex-fill shadow-lg hover-lift-heavy" style={btnStyle} onClick={() => setShowSchedule(true)}>Schedule Interview</button>
                      </div>
                    );
                  case "Interviewing":
                    return (
                      <div className="d-flex gap-3">
                        <button className="btn btn-outline-danger flex-fill shadow-sm hover-lift" style={btnStyle} onClick={() => updateStatus(selectedUser.id, "Rejected")}>Reject</button>
                        <button className="btn btn-primary flex-fill shadow-lg hover-lift-heavy" style={btnStyle} onClick={() => updateStatus(selectedUser.id, "Hired")}>Final Hire</button>
                      </div>
                    );
                  case "Hired":
                    return <button className="btn btn-success w-100 shadow-lg" style={{ ...btnStyle, cursor: "default" }} disabled><FaCheckCircle className="me-2" /> Selection Confirmed</button>;
                  case "Rejected":
                    return <button className="btn btn-light w-100 shadow-sm border text-muted" style={btnStyle} onClick={() => updateStatus(selectedUser.id, "Applied")}>Reconsider Candidate</button>;
                  default:
                    return null;
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= MODAL COMPONENT ================= */
const Modal = ({ title, children, close }) => (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999, backdropFilter: "blur(2px)" }}
    onClick={close}
  >
    <div
      className="bg-white rounded-4 p-4 shadow-lg animate-scale-up"
      style={{ width: "450px", maxWidth: "90%" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">{title}</h5>
        <button onClick={close} className="btn btn-sm btn-light rounded-circle p-2">
          <FaTimes />
        </button>
      </div>
      {children}
    </div>
    <style>{`
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .animate-scale-up { animation: scaleUp 0.2s ease-out; }
        .animate-slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .premium-intelligence-card {
          background: white;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
        }

        .intelligence-score-box {
          text-align: center;
          background: #f0f9ff;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 115, 177, 0.2);
        }

        .int-score { font-weight: 800; font-size: 1.4rem; color: ${COLORS.primary}; display: block; line-height: 1; }
        .int-label { font-size: 0.65rem; color: ${COLORS.primary}; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }

        .insight-box {
          border-left: 4px solid ${COLORS.primary} !important;
        }

        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 800;
          color: #64748b;
          border-left: 3px solid ${COLORS.primary};
          padding-left: 12px;
        }

        .info-icon {
          width: 42px;
          height: 42px;
          background: #f8f9fa;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.primary};
          font-size: 1.1rem;
          border: 1px solid #e2e8f0;
        }

        .cover-letter-box {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0;
        }

        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 15px -3px rgba(0,0,0,0.1); }
        .hover-lift-heavy:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 115, 177, 0.3); }
        .hover-scale:hover { transform: scale(1.02); }
        .transition-all { transition: all 0.3s ease; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }

        .fs-xs { font-size: 0.7rem; }
        .fs-7 { font-size: 0.925rem; }
        .fw-extra-bold { font-weight: 850; }
        .letter-spacing-sm { letter-spacing: -0.01em; }

        .pipeline-column { height: calc(100vh - 250px); }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1) !important; }
        .cursor-pointer { cursor: pointer; }
    `}</style>
  </div>
);
