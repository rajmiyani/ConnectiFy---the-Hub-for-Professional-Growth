import React, { useState } from "react";
import { FaCheckCircle, FaStar, FaCrown, FaBuilding, FaUserTie, FaRocket, FaShieldAlt, FaBolt } from "react-icons/fa";

const PremiumPlans = ({ role = "user" }) => {
    const [billingCycle, setBillingCycle] = useState("monthly");
    const [isLoading, setIsLoading] = useState(false);

    const COLORS = {
        primary: "#0073b1",
        secondary: "#e8f4fb",
        dark: "#1f1f1f",
        light: "#f3f2ef",
        accent: "#ff9100", // Gold for Pro
        bg: "linear-gradient(135deg, #0073b1 0%, #004e89 100%)",
        soft: "#e8f4fb"
    };

    const PLANS = {
        user: [
            {
                name: "Basic",
                price: "Free",
                period: "Forever",
                icon: <FaUserTie />,
                features: ["Basic Profile", "Apply to 10 Jobs/Month", "Job Alerts", "Public Feed Access"],
                color: "#6c757d",
                type: "standard"
            },
            {
                name: "Pro Career",
                price: billingCycle === "monthly" ? "₹499" : "₹4,990",
                period: billingCycle === "monthly" ? "/mo" : "/yr",
                icon: <FaCrown />,
                features: [
                    "AI Resume Optimizer",
                    "Unlimited Job Applications",
                    "Unlimited AI Mock Interviews",
                    "Profile Highlight for Recruiters",
                    "Salary Insights & Trends"
                ],
                color: COLORS.primary,
                recommend: true,
                type: "pro"
            },
            {
                name: "Elite",
                price: billingCycle === "monthly" ? "₹999" : "₹9,990",
                period: billingCycle === "monthly" ? "/mo" : "/yr",
                icon: <FaStar />,
                features: [
                    "Everything in Pro",
                    "1-on-1 Career Mentorship",
                    "Featured Profile Status",
                    "Direct Recruiter Messaging",
                    "Exclusive Career Webinars"
                ],
                color: COLORS.dark,
                type: "premium"
            }
        ],
        company: [
            {
                name: "Startup",
                price: "Free",
                period: "Forever",
                icon: <FaRocket />,
                features: ["Post 2 Jobs/Month", "Basic Applicant Tracking", "Company Branding", "Standard Support"],
                color: "#6c757d",
                type: "standard"
            },
            {
                name: "Growth Pro",
                price: billingCycle === "monthly" ? "₹2,999" : "₹29,990",
                period: billingCycle === "monthly" ? "/mo" : "/yr",
                icon: <FaBolt />,
                features: [
                    "Unlimited Job Postings",
                    "AI Applicant Scoring",
                    "HD Video Interview Room",
                    "Priority Job Promotion",
                    "Advanced Team Analytics"
                ],
                color: COLORS.primary,
                recommend: true,
                type: "pro"
            },
            {
                name: "Enterprise",
                price: "Custom",
                period: "",
                icon: <FaShieldAlt />,
                features: [
                    "Dedicated Account Manager",
                    "Custom Integration APIs",
                    "Unlimited User Licenses",
                    "Employer Brand Consultation",
                    "Bulk Content Promotion"
                ],
                color: COLORS.dark,
                type: "premium"
            }
        ]
    };

    const currentPlans = PLANS[role];

    return (
        <div className="min-vh-100" style={{ backgroundColor: COLORS.light, fontFamily: "'Inter', sans-serif" }}>
            {/* HERO SECTION */}
            <div className="py-5 text-white text-center" style={{ background: COLORS.bg, borderRadius: "0 0 50px 50px", marginBottom: "-100px", paddingBottom: "150px" }}>
                <div className="container">
                    <span className="badge bg-white text-dark rounded-pill px-3 py-2 mb-3 fw-bold">🚀 Elevate Your Experience</span>
                    <h1 className="display-4 fw-bold mb-3">
                        {role === "user" ? "Unlock Your Dream Career" : "Scale Your Engineering Team"}
                    </h1>
                    <p className="lead opacity-75 mb-4 max-w-600 mx-auto">
                        {role === "user"
                            ? "Get the tools, insights, and visibility you need to stand out from the crowd."
                            : "Access premium recruiting tools and AI insights to hire better talent, faster."}
                    </p>

                    {/* Toggle */}
                    <div className="d-inline-flex bg-white bg-opacity-10 rounded-pill p-1 border border-white border-opacity-25 backdrop-blur shadow-sm">
                        <button
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${billingCycle === "monthly" ? "bg-white text-primary shadow" : "text-white border-0"}`}
                            onClick={() => setBillingCycle("monthly")}
                            style={{ minWidth: "140px", fontSize: "0.9rem", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                            Monthly
                        </button>
                        <button
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all d-flex align-items-center justify-content-center gap-2 ${billingCycle === "yearly" ? "bg-white text-primary shadow" : "text-white border-0"}`}
                            onClick={() => setBillingCycle("yearly")}
                            style={{ minWidth: "170px", fontSize: "0.9rem", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                            <span>Yearly</span>
                            <span className="badge bg-warning text-dark rounded-pill fw-bold" style={{ fontSize: "0.7rem", padding: "4px 8px" }}>
                                Save 15%
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* PLANS GRID */}
            <div className="container pb-10">
                <div className="row g-4 justify-content-center mt-5">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="col-lg-4 col-md-6">
                                <div className="card h-100 border-0 shadow-lg" style={{ borderRadius: "24px", overflow: "hidden" }}>
                                    <div className="card-body p-4 p-xl-5">
                                        <div className="skeleton skeleton-pulse mb-4" style={{ width: "60px", height: "60px", borderRadius: "16px" }}></div>
                                        <div className="skeleton skeleton-pulse skeleton-title" style={{ width: "120px" }}></div>
                                        <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "180px" }}></div>
                                        <div className="my-4">
                                            <div className="skeleton skeleton-pulse" style={{ width: "140px", height: "48px" }}></div>
                                        </div>
                                        <hr className="mb-4 opacity-50" />
                                        <div className="mb-4">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <div key={s} className="skeleton skeleton-pulse skeleton-text mb-3"></div>
                                            ))}
                                        </div>
                                        <div className="skeleton skeleton-pulse skeleton-rect" style={{ borderRadius: "50px", height: "54px" }}></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        currentPlans.map((plan, index) => (
                            <div key={index} className="col-lg-4 col-md-6 translate-up">
                                <div
                                    className={`card h-100 border-0 shadow-lg position-relative plan-card ${plan.recommend ? "featured" : ""}`}
                                    style={{
                                        borderRadius: "24px",
                                        overflow: "hidden",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    {plan.recommend && (
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm fw-bold">
                                                MOST POPULAR
                                            </span>
                                        </div>
                                    )}

                                    <div className="card-body p-4 p-xl-5 d-flex flex-column">
                                        <div className="mb-4">
                                            <div className="d-inline-flex p-3 rounded-4 mb-3" style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>
                                                <div className="fs-3">{plan.icon}</div>
                                            </div>
                                            <h3 className="fw-bold mb-1">{plan.name}</h3>
                                            <p className="text-muted small">Perfect for {plan.type === 'pro' ? 'power users' : 'getting started'}</p>
                                        </div>

                                        <div className="mb-4 d-flex align-items-baseline gap-1">
                                            <h2 className="display-5 fw-bold mb-0">{plan.price}</h2>
                                            <span className="text-muted fw-medium">{plan.period}</span>
                                        </div>

                                        <hr className="mb-4 opacity-50" />

                                        <ul className="list-unstyled flex-grow-1 mb-4">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="mb-3 d-flex align-items-start gap-2">
                                                    <FaCheckCircle className="mt-1 text-success flex-shrink-0" size={16} />
                                                    <span className="text-secondary small fw-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            className={`btn btn-lg w-100 py-3 rounded-pill fw-bold transition-all ${plan.recommend
                                                ? "btn-primary shadow-lg hover-up"
                                                : "btn-outline-dark"
                                                }`}
                                            style={plan.recommend ? { backgroundColor: plan.color, borderColor: plan.color } : {}}
                                        >
                                            {plan.price === "Free" ? "Get Started" : "Choose " + plan.name}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* TRUST SECTION */}
            <div className="container py-5 border-top">
                <div className="text-center mb-4">
                    <p className="text-muted small text-uppercase fw-bold tracking-widest">Trusted by Teams Around the World</p>
                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-5 opacity-50 grayscale">
                        {/* Mock Logos */}
                        <h4 className="fw-bold m-0 italic">TechNova</h4>
                        <h4 className="fw-bold m-0 italic">GlobalLink</h4>
                        <h4 className="fw-bold m-0 italic">FutureHR</h4>
                        <h4 className="fw-bold m-0 italic">ConnectScale</h4>
                    </div>
                </div>
            </div>

            <style>{`
                .backdrop-blur { backdrop-filter: blur(8px); }
                .max-w-600 { max-width: 600px; }
                .grayscale { filter: grayscale(100%); }
                .plan-card:hover { transform: translateY(-10px); }
                .featured { border: 2px solid ${COLORS.primary} !important; }
                .hover-up:hover { transform: scale(1.02); }
                .italic { font-style: italic; font-family: 'serif'; }
                .tracking-widest { letter-spacing: 0.15em; }
            `}</style>
        </div>
    );
};

export default PremiumPlans;
