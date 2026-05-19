import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Button, Form, Badge } from "react-bootstrap";
import {
    BiBriefcase,
    BiMap,
    BiRupee,
    BiBookmark,
    BiSolidBookmark,
} from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const COLORS = {
    primary: "#004E89",
    accent: "#0096C7",
    background: "#F4F7FB",
    card: "#FFFFFF",
    textDark: "#1E1E1E",
    border: "#E0E0E0",
};

const Jobs = () => {
    const navigate = useNavigate();

    /* ------------------ DATA ------------------ */
    const jobsData = [
        {
            id: 1,
            title: "Frontend Developer",
            company: "Google",
            location: "Bengaluru",
            type: "Full-time",
            salary: "₹8 LPA - ₹12 LPA",
            logo: "https://cdn-icons-png.flaticon.com/512/270/270798.png",
            desc: "Work on modern UI frameworks and scalable web experiences.",
        },
        {
            id: 2,
            title: "Backend Engineer",
            company: "Amazon",
            location: "Hyderabad",
            type: "Remote",
            salary: "₹10 LPA - ₹15 LPA",
            logo: "https://cdn-icons-png.flaticon.com/512/5968/5968282.png",
            desc: "Develop APIs and scalable backend systems.",
        },
        {
            id: 3,
            title: "UI/UX Designer",
            company: "Adobe",
            location: "Remote",
            type: "Contract",
            salary: "₹6 LPA - ₹9 LPA",
            logo: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
            desc: "Design creative and user-centered interfaces.",
        },
        {
            id: 4,
            title: "Full Stack Developer",
            company: "Microsoft",
            location: "Pune",
            type: "Hybrid",
            salary: "₹12 LPA - ₹18 LPA",
            logo: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
            desc: "Work on frontend & backend for global products.",
        },
    ];

    /* ------------------ STATE ------------------ */
    const [jobs, setJobs] = useState(jobsData);
    const [jobType, setJobType] = useState("All");
    const [location, setLocation] = useState("");
    const [savedJobs, setSavedJobs] = useState([]);

    /* ------------------ FILTER LOGIC ------------------ */
    const applyFilters = () => {
        let filtered = jobsData;

        if (jobType !== "All") {
            filtered = filtered.filter((job) => job.type === jobType);
        }

        if (location.trim()) {
            filtered = filtered.filter((job) =>
                job.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        setJobs(filtered);
    };

    /* ------------------ SAVE JOB ------------------ */
    const toggleSave = (job) => {
        const exists = savedJobs.find((j) => j.id === job.id);
        if (exists) {
            setSavedJobs(savedJobs.filter((j) => j.id !== job.id));
        } else {
            setSavedJobs([...savedJobs, job]);
        }
    };

    const isSaved = (id) => savedJobs.some((job) => job.id === id);

    return (
        <div className="container-fluid py-5" style={{ background: COLORS.background }}>
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: COLORS.primary, letterSpacing: "0.5px" }} > Explore Your Career Opportunities </h2>
                    <p className="text-muted mb-0"> Find roles that match your passion and professional goals. </p>
                </div>

                <div className="row g-4">
                    {/* ------------ FILTER SIDEBAR ------------ */}
                    <div className="col-lg-3">
                        <div className="p-4 rounded shadow-sm bg-white">
                            <h6 className="fw-semibold mb-3">Filters</h6>

                            <Form.Group className="mb-3">
                                <Form.Label>Job Type</Form.Label>
                                <Form.Select onChange={(e) => setJobType(e.target.value)}>
                                    <option>All</option>
                                    <option>Full-time</option>
                                    <option>Remote</option>
                                    <option>Hybrid</option>
                                    <option>Contract</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    placeholder="Enter location"
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted">Experience</Form.Label>
                                <Form.Select style={{ borderRadius: "8px", borderColor: COLORS.border, fontSize: "0.9rem", }} >
                                    <option>All</option>
                                    <option>0-2 years</option>
                                    <option>3-5 years</option>
                                    <option>5+ years</option>
                                </Form.Select>
                            </Form.Group>

                            <Button
                                className="w-100"
                                style={{ background: COLORS.primary, border: "none" }}
                                onClick={applyFilters}
                            >
                                Apply Filters
                            </Button>

                            {/* Saved Jobs */}
                            {savedJobs.length > 0 && (
                                <>
                                    <hr />
                                    <h6 className="fw-semibold">Saved Jobs</h6>
                                    {savedJobs.map((job) => (
                                        <div key={job.id} className="small mb-2">
                                            <Badge bg="secondary" className="me-1">
                                                {job.title}
                                            </Badge>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* ------------ JOB LIST ------------ */}
                    <div className="col-lg-9">
                        <div className="row g-4">
                            {jobs.length === 0 && (
                                <p className="text-center text-muted">No jobs found.</p>
                            )}

                            {jobs.map((job) => (
                                <div className="col-md-6" key={job.id}>
                                    <Card className="border-0 shadow-sm h-100 rounded-4">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between">
                                                <div className="d-flex">
                                                    <img src={job.logo} alt="" width="50" className="me-3" />
                                                    <div>
                                                        <h6 className="fw-semibold">{job.title}</h6>
                                                        <small className="text-muted">
                                                            {job.company} · {job.location}
                                                        </small>
                                                    </div>
                                                </div>

                                                {/* SAVE ICON */}
                                                <div
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => toggleSave(job)}
                                                >
                                                    {isSaved(job.id) ? (
                                                        <BiSolidBookmark size={22} color={COLORS.primary} />
                                                    ) : (
                                                        <BiBookmark size={22} color={COLORS.primary} />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-muted small mt-3">{job.desc}</p>

                                            <div className="d-flex justify-content-between small text-muted mb-3">
                                                <span><BiBriefcase /> {job.type}</span>
                                                <span><BiRupee /> {job.salary}</span>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Button
                                                    className="w-50"
                                                    style={{ background: COLORS.accent, border: "none" }}
                                                    onClick={() => navigate("/company/job-details")}
                                                >
                                                    Apply
                                                </Button>

                                                <Button
                                                    variant="outline-primary"
                                                    className="w-50"
                                                    onClick={() => navigate("/company/job-details")}
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
