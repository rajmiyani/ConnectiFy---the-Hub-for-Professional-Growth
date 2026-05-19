import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Button, Form, Badge } from "react-bootstrap";
import {
    BiBriefcase,
    BiMap,
    BiRupee,
    BiBookmark,
    BiSolidBookmark,
    BiFilter,
} from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const COLORS = {
    brand: "rgb(0, 115, 177)",
    accent: "#0096C7",
    background: "#F4F7FB",
    card: "#FFFFFF",
    textDark: "#1E1E1E",
    border: "#E0E0E0",
};

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

const Jobs = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const socket = useSocket();
    const [isLoading, setIsLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [originalJobs, setOriginalJobs] = useState([]); // Keep originalJobs for filtering
    const [search, setSearch] = useState(""); // New state variable
    const [jobType, setJobType] = useState("All");
    const [location, setLocation] = useState("");
    const [savedJobIds, setSavedJobIds] = useState([]); // Keep savedJobIds for tracking saved jobs
    const [toast, setToast] = useState(""); // New state variable for local toast

    const savedJobs = originalJobs.filter(job => savedJobIds.includes(job.id));

    const fetchJobs = async () => { // Renamed from fetchData
        setIsLoading(true);
        try {
            const [jobsRes, savedRes] = await Promise.all([
                api.get("/users/jobs"),
                user?.id ? api.get(`/users/interaction/saved/${user.id}`) : Promise.resolve({ data: { success: true, data: [] } })
            ]);

            const jobsData = jobsRes.data;
            const savedData = savedRes.data;

            if (jobsData.success) {
                setJobs(jobsData.data);
                setOriginalJobs(jobsData.data);
            }
            if (savedData.success) {
                setSavedJobIds(savedData.data.filter(i => i.type === "Job").map(i => i.id));
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [user?.id]);

    useEffect(() => {
        if (!socket) return;

        socket.on("new_job", (newJob) => {
            setOriginalJobs(prev => [newJob, ...prev]);
            setJobs(prev => [newJob, ...prev]);
            // App.jsx will handle the toast.
        });

        socket.on("status_update", (data) => {
            console.log("🔥 Application status updated:", data);
            // The global notification in App.jsx handles the toast.
            // We could refresh the list if needed, but the application status 
            // is usually viewed on the 'My Applications' page or details.
        });

        return () => {
            socket.off("new_job");
            socket.off("application_status_update");
        };
    }, [socket]);

    /* ------------------ FILTER LOGIC ------------------ */
    const applyFilters = () => {
        let filtered = originalJobs;
        if (jobType !== "All") filtered = filtered.filter((job) => job.type === jobType);
        if (location.trim()) {
            filtered = filtered.filter((job) =>
                job.location.toLowerCase().includes(location.toLowerCase())
            );
        }
        setJobs(filtered);
    };

    /* ------------------ SAVE JOB ------------------ */
    const toggleSave = async (jobId) => {
        if (!user?.id) return;
        try {
            const res = await api.post("/users/interaction/save-job", { jobId, userId: user.id });
            const data = res.data;
            if (data.success) {
                if (data.saved) {
                    setSavedJobIds(prev => [...prev, jobId]);
                    showToast("💾 Job saved successfully!", "success");
                } else {
                    setSavedJobIds(prev => prev.filter(id => id !== jobId));
                    showToast("🗑️ Removed from saved jobs", "info");
                }
            }
        } catch (error) {
            console.error("Error toggling save job:", error);
            showToast("❌ Failed to update save status", "error");
        }
    };

    const isSaved = (id) => savedJobIds.includes(id);

    const SkeletonLoader = ({ type }) => {
        if (type === "sidebar") {
            return (
                <div className="card p-4 border-0 shadow-sm" style={{ borderRadius: "16px" }}>
                    <div className="skeleton skeleton-pulse skeleton-title mb-4" style={{ width: "80%" }}></div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="mb-4">
                            <div className="skeleton skeleton-pulse skeleton-text mb-2" style={{ width: "40%", height: "14px" }}></div>
                            <div className="skeleton skeleton-pulse skeleton-text mb-1" style={{ width: "90%", height: "12px" }}></div>
                            <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "80%", height: "12px" }}></div>
                        </div>
                    ))}
                    <div className="skeleton skeleton-pulse skeleton-rect mt-2" style={{ height: "40px", borderRadius: "10px" }}></div>
                </div>
            );
        } else if (type === "job-card") {
            return (
                <div className="col-md-6 mb-4">
                    <Card className="border-0 shadow-sm h-100 rounded-4">
                        <Card.Body>
                            <div className="d-flex">
                                <div className="skeleton skeleton-pulse skeleton-circle me-3" style={{ width: "50px", height: "50px" }}></div>
                                <div className="flex-grow-1">
                                    <div className="skeleton skeleton-pulse skeleton-title mb-1" style={{ width: "60%" }}></div>
                                    <div className="skeleton skeleton-pulse skeleton-text mb-2" style={{ width: "40%", height: "10px" }}></div>
                                    <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "30%", height: "16px", borderRadius: "6px" }}></div>
                                </div>
                            </div>
                            <div className="skeleton skeleton-pulse skeleton-text mt-3 mb-2" style={{ width: "100%", height: "12px" }}></div>
                            <div className="skeleton skeleton-pulse skeleton-text mb-4" style={{ width: "80%", height: "12px" }}></div>
                            <div className="d-flex gap-2">
                                <div className="skeleton skeleton-pulse skeleton-rect flex-grow-1" style={{ height: "38px", borderRadius: "8px" }}></div>
                                <div className="skeleton skeleton-pulse skeleton-rect flex-grow-1" style={{ height: "38px", borderRadius: "8px" }}></div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid py-5" style={{ background: COLORS.background, minHeight: "100vh" }}>
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: COLORS.brand, letterSpacing: "0.5px" }} > Explore Your Career Opportunities </h2>
                    <p className="text-muted mb-0"> Find roles that match your passion and professional goals. </p>
                </div>

                <div className="row g-4">
                    {/* ------------ FILTER SIDEBAR ------------ */}
                    <div className="col-lg-3">
                        <div className="sticky-top" style={{ top: "100px", zIndex: 10 }}>
                            {isLoading ? (
                                <SkeletonLoader type="sidebar" />
                            ) : (
                                <div className="card shadow-sm border-0 p-4" style={{ borderRadius: "16px" }}>
                                    <h5 className="fw-bold mb-4 d-flex align-items-center">
                                        <BiFilter className="me-2" style={{ color: COLORS.brand }} /> Filter Jobs
                                    </h5>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small text-muted">Job Type</Form.Label>
                                        <Form.Select
                                            className="border-0 bg-light"
                                            onChange={(e) => setJobType(e.target.value)}
                                            style={{ borderRadius: "8px" }}
                                        >
                                            <option>All</option>
                                            <option>Full-time</option>
                                            <option>Remote</option>
                                            <option>Hybrid</option>
                                            <option>Contract</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small text-muted">Location</Form.Label>
                                        <Form.Control
                                            className="border-0 bg-light"
                                            placeholder="City or Remote"
                                            onChange={(e) => setLocation(e.target.value)}
                                            style={{ borderRadius: "8px" }}
                                        />
                                    </Form.Group>

                                    <Button
                                        className="w-100 rounded-pill fw-bold"
                                        style={{ background: COLORS.brand, border: "none" }}
                                        onClick={applyFilters}
                                    >
                                        Apply Filters
                                    </Button>

                                    {savedJobs.length > 0 && (
                                        <>
                                            <hr />
                                            <h6 className="fw-semibold small text-muted mb-3">Saved Jobs</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {savedJobs.map((job) => (
                                                    <Badge key={job.id} bg="light" text="dark" className="border">
                                                        {job.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ------------ JOB LIST ------------ */}
                    <div className="col-lg-9">
                        <div className="row">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => <SkeletonLoader key={i} type="job-card" />)
                            ) : jobs.length === 0 ? (
                                <p className="text-center text-muted col-12 py-5">No jobs found matching your criteria.</p>
                            ) : (
                                jobs.map((job) => (
                                    <div className="col-md-6 mb-4" key={job.id}>
                                        <Card className="border-0 shadow-sm h-100 rounded-4">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between">
                                                    <div className="d-flex">
                                                        <img src={job.logoUrl || "https://cdn-icons-png.flaticon.com/512/2836/2836511.png"} alt="" width="50" height="50" className="me-3 rounded" />
                                                        <div>
                                                            <h6 className="fw-semibold mb-0">{job.title}</h6>
                                                            <small className="text-muted">
                                                                {job.companyName} · {job.location}
                                                            </small>
                                                            <div className="mt-1">
                                                                <Badge
                                                                    style={{
                                                                        backgroundColor: (job.match || 85) > 80 ? "#10b981" : (job.match || 85) > 60 ? "#f59e0b" : "#ef4444",
                                                                        fontSize: "10px",
                                                                        padding: "4px 8px",
                                                                        borderRadius: "6px"
                                                                    }}
                                                                >
                                                                    🪄 {job.match || 85}% AI MATCH
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => toggleSave(job.id)}
                                                    >
                                                        {isSaved(job.id) ? (
                                                            <BiSolidBookmark size={22} color={COLORS.brand} />
                                                        ) : (
                                                            <BiBookmark size={22} color={COLORS.brand} />
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-muted small mt-3" style={{ height: "40px", overflow: "hidden" }}>{job.description}</p>

                                                <div className="d-flex justify-content-between small text-muted mb-3">
                                                    <span><BiBriefcase className="me-1" /> {job.type}</span>
                                                    <span><BiRupee className="me-1" /> {job.salary}</span>
                                                </div>

                                                <div className="d-flex gap-2 mt-auto">
                                                    <Button
                                                        className="flex-grow-1"
                                                        style={{ background: COLORS.accent, border: "none" }}
                                                        onClick={() => navigate(`/user/job-details/${job.id}`)}
                                                    >
                                                        Apply
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-grow-1"
                                                        style={{ color: COLORS.brand, borderColor: COLORS.brand }}
                                                        onClick={() => navigate(`/user/job-details/${job.id}`)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
