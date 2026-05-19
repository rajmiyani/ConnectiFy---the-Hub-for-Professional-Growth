import React, { useState } from "react";
import UserRegister from "./Register";
import CompanyRegister from "../company/Register";
import { FaUser, FaBuilding, FaArrowLeft } from "react-icons/fa";

const COLORS = {
    primary: "#0073b1",
    secondary: "#e8f4fb",
    textDark: "#1f1f1f",
    textLight: "#606770",
    border: "#e0e0e0",
    white: "#ffffff",
    bg: "#f3f2ef",
};

const RegisterMain = () => {
    const [choice, setChoice] = useState(null); // 'user' or 'company'

    if (choice === "user") {
        return (
            <div className="position-relative">
                <button
                    onClick={() => setChoice(null)}
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        zIndex: 1000,
                        background: COLORS.primary,
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "5px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                    }}
                >
                    <FaArrowLeft className="me-2" /> Change Type
                </button>
                <UserRegister />
            </div>
        );
    }

    if (choice === "company") {
        return (
            <div className="position-relative">
                <button
                    onClick={() => setChoice(null)}
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        zIndex: 1000,
                        background: COLORS.primary,
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "5px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                    }}
                >
                    <FaArrowLeft className="me-2" /> Change Type
                </button>
                <CompanyRegister />
            </div>
        );
    }

    return (
        <div
            style={{
                backgroundColor: COLORS.bg,
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
        >
            <div
                className="shadow-lg"
                style={{
                    backgroundColor: COLORS.white,
                    borderRadius: "15px",
                    padding: "40px",
                    maxWidth: "900px",
                    width: "100%",
                    textAlign: "center"
                }}
            >
                <img src="/ConnectiFy_logo.png" alt="ConnectiFy" style={{ width: "180px", marginBottom: "30px" }} />

                <h2 style={{ color: COLORS.textDark, fontWeight: "800", marginBottom: "10px" }}>Join ConnectiFy</h2>
                <p style={{ color: COLORS.textLight, fontSize: "16px", marginBottom: "40px" }}>
                    Select how you want to use the platform to get started.
                </p>

                <div className="row g-4">
                    {/* Individual User Option */}
                    <div className="col-md-6">
                        <div
                            onClick={() => setChoice("user")}
                            style={{
                                border: `2px solid ${COLORS.border}`,
                                borderRadius: "12px",
                                padding: "30px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                height: "100%"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = COLORS.primary;
                                e.currentTarget.style.backgroundColor = COLORS.secondary;
                                e.currentTarget.style.transform = "translateY(-5px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = COLORS.border;
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div style={{
                                width: "70px",
                                height: "70px",
                                backgroundColor: COLORS.secondary,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                                fontSize: "30px",
                                color: COLORS.primary
                            }}>
                                <FaUser />
                            </div>
                            <h4 style={{ color: COLORS.primary, fontWeight: "700" }}>Individual User</h4>
                            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>
                                Build your profile, connect with professionals, and find your dream job or internship.
                            </p>
                        </div>
                    </div>

                    {/* Company/Recruiter Option */}
                    <div className="col-md-6">
                        <div
                            onClick={() => setChoice("company")}
                            style={{
                                border: `2px solid ${COLORS.border}`,
                                borderRadius: "12px",
                                padding: "30px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                height: "100%"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = COLORS.primary;
                                e.currentTarget.style.backgroundColor = COLORS.secondary;
                                e.currentTarget.style.transform = "translateY(-5px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = COLORS.border;
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div style={{
                                width: "70px",
                                height: "70px",
                                backgroundColor: COLORS.secondary,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                                fontSize: "30px",
                                color: COLORS.primary
                            }}>
                                <FaBuilding />
                            </div>
                            <h4 style={{ color: COLORS.primary, fontWeight: "700" }}>Company / Recruiter</h4>
                            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>
                                Hire the best talent, post job openings, and showcase your company culture.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "40px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "20px" }}>
                    <p style={{ color: COLORS.textLight }}>
                        Already have an account? <a href="/login" style={{ color: COLORS.primary, fontWeight: "bold", textDecoration: "none" }}>Log In</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterMain;
