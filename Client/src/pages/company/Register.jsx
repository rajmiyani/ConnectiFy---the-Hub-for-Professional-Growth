import React, { useEffect, useState } from "react";
import {
    FaBuilding,
    FaUserTie,
    FaMapMarkerAlt,
    FaLock,
    FaCheckCircle,
    FaArrowRight,
    FaArrowLeft,
    FaPaperPlane,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";

const COLORS = {
    primary: "#0073b1",
    secondary: "#e8f4fb",
    textDark: "#1f1f1f",
    textLight: "#606770",
    border: "#e0e0e0",
    white: "#ffffff",
    hover: "#f7f9fa",
    bg: "#f3f2ef",
};

const CompanyRegister = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        accountType: "company",

        /* STEP 1 – COMPANY */
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        website: "",
        industry: "",
        companySize: "",
        foundedYear: "",

        /* STEP 2 – RECRUITER */
        recruiterName: "",
        recruiterEmail: "",
        recruiterPhone: "",
        designation: "", // Standardized to designation

        /* STEP 3 – ADDRESS */
        country: "",
        state: "",
        city: "",
        pincode: "",
        address: "",

        /* STEP 4 – SECURITY */
        password: "",
        confirmPassword: "",
        accept: false,
    });

    /* ---------------- VALIDATION ---------------- */
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => /^\d{10,15}$/.test(phone.replace(/\D/g, ""));
    const isValidYear = (year) => /^\d{4}$/.test(year) && year <= new Date().getFullYear();

    const validateStep1 = () => {
        let errs = {};
        if (!form.companyName.trim()) errs.companyName = "Company name is required";
        if (!form.companyEmail) {
            errs.companyEmail = "Company email is required";
        } else if (!isValidEmail(form.companyEmail)) {
            errs.companyEmail = "Invalid email format";
        }
        if (form.companyPhone && !isValidPhone(form.companyPhone)) {
            errs.companyPhone = "Invalid phone number (10-15 digits)";
        }
        if (form.foundedYear && !isValidYear(form.foundedYear)) {
            errs.foundedYear = "Invalid year";
        }
        if (!form.industry) errs.industry = "Please select an industry";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
        let errs = {};
        if (!form.recruiterName.trim()) errs.recruiterName = "Recruiter name is required";
        if (!form.recruiterEmail) {
            errs.recruiterEmail = "Recruiter email is required";
        } else if (!isValidEmail(form.recruiterEmail)) {
            errs.recruiterEmail = "Invalid email format";
        }
        if (!form.recruiterPhone) {
            errs.recruiterPhone = "Recruiter phone is required";
        } else if (!isValidPhone(form.recruiterPhone)) {
            errs.recruiterPhone = "Invalid phone number (10-15 digits)";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep3 = () => {
        let errs = {};
        if (!form.country.trim()) errs.country = "Country is required";
        if (!form.state.trim()) errs.state = "State is required";
        if (!form.city.trim()) errs.city = "City is required";
        if (!form.address.trim()) errs.address = "Detailed address is required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep4 = () => {
        let errs = {};
        if (!form.password) {
            errs.password = "Password is required";
        } else if (form.password.length < 8) {
            errs.password = "Password must be at least 8 characters";
        }
        if (form.password !== form.confirmPassword) {
            errs.confirmPassword = "Passwords do not match";
        }
        if (!form.accept) errs.accept = "You must accept the terms and conditions";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const submitHandler = async () => {
        if (!validateStep4()) return;

        setLoading(true);
        try {
            const res = await api.post("/companies/register", form);
            const data = res.data;
            if (data.success) {
                showToast("🏢 Company Registered Successfully! Please verify your email.", "success");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                showToast(data.message || "Registration failed. Please check your details.", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showToast("Server error. Please try again later.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }} className="container-fluid">
            <div className=" row shadow bg-white p-0">

                <div
                    className="col-md-6 d-flex flex-column align-items-center justify-content-center p-4"
                    style={{
                        backgroundColor: COLORS.secondary,
                        height: "100vh",
                        position: "sticky",
                        top: 0,
                    }}
                >
                    <img src="/ConnectiFy_logo.png" alt="logo" width={150} />
                    <h3 className="fw-bold mt-3" style={{ color: COLORS.primary }}>
                        Company Registration
                    </h3>
                    <p className="text-muted text-center mt-2">
                        Create your company profile & start hiring professionals
                    </p>
                </div>

                {/* RIGHT FORM */}
                <div
                    className="col-md-6 p-4 m-0"
                    style={{
                        height: "100vh",
                        overflowY: "scroll",
                        scrollbarWidth: "none",
                    }}
                >
                    <h4 className="fw-bold mb-4" style={{ color: COLORS.primary }}>
                        Create Company Account
                    </h4>

                    {/* STEP INDICATOR – SAME STYLE */}
                    <div className="position-relative mb-5 px-3">
                        <div
                            style={{
                                position: "absolute",
                                top: 22,
                                left: 25,
                                right: 25,
                                height: 4,
                                background: COLORS.border,
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                top: 22,
                                left: 25,
                                height: 4,
                                width: `${((step - 1) / 3) * 100}%`,
                                background: COLORS.primary,
                                transition: "0.3s",
                            }}
                        />
                        <div className="d-flex justify-content-between position-relative">
                            {["Company", "Recruiter", "Address", "Finish"].map((label, i) => (
                                <div key={i} className="text-center">
                                    <div
                                        style={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: "50%",
                                            background:
                                                step === i + 1 ? COLORS.primary : COLORS.white,
                                            border: `2px solid ${step >= i + 1 ? COLORS.primary : COLORS.border}`,
                                            color: step === i + 1 ? "#fff" : COLORS.primary,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {step > i + 1 ? "✓" : i + 1}
                                    </div>
                                    <small>{label}</small>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STEP 1 – COMPANY */}
                    {step === 1 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaBuilding /> Company Information
                            </h5>

                            <div className="row">

                                {/* Company Name */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Company Name *</label>
                                    <input
                                        className={`form-control ${errors.companyName && "is-invalid"}`}
                                        value={form.companyName}
                                        onChange={(e) =>
                                            setForm({ ...form, companyName: e.target.value })
                                        }
                                    />
                                    {errors.companyName && (
                                        <div className="text-danger small">{errors.companyName}</div>
                                    )}
                                </div>

                                {/* Company Email */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Company Email *</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.companyEmail && "is-invalid"}`}
                                        value={form.companyEmail}
                                        onChange={(e) =>
                                            setForm({ ...form, companyEmail: e.target.value })
                                        }
                                    />
                                    {errors.companyEmail && (
                                        <div className="text-danger small">{errors.companyEmail}</div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Company Phone</label>
                                    <input
                                        className={`form-control ${errors.companyPhone && "is-invalid"}`}
                                        value={form.companyPhone}
                                        onChange={(e) =>
                                            setForm({ ...form, companyPhone: e.target.value })
                                        }
                                    />
                                    {errors.companyPhone && (
                                        <div className="text-danger small">{errors.companyPhone}</div>
                                    )}
                                </div>

                                {/* Website */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Company Website</label>
                                    <input
                                        className="form-control"
                                        placeholder="https://example.com"
                                        value={form.website}
                                        onChange={(e) =>
                                            setForm({ ...form, website: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Industry */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Industry *</label>
                                    <select
                                        className={`form-control ${errors.industry && "is-invalid"}`}
                                        value={form.industry}
                                        onChange={(e) =>
                                            setForm({ ...form, industry: e.target.value })
                                        }
                                    >
                                        <option value="">Select Industry</option>
                                        <option>IT Services</option>
                                        <option>Software</option>
                                        <option>Finance</option>
                                        <option>Healthcare</option>
                                    </select>
                                    {errors.industry && (
                                        <div className="text-danger small">{errors.industry}</div>
                                    )}
                                </div>

                                {/* Company Size */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Company Size</label>
                                    <select
                                        className="form-control"
                                        value={form.companySize}
                                        onChange={(e) =>
                                            setForm({ ...form, companySize: e.target.value })
                                        }
                                    >
                                        <option value="">Select Size</option>
                                        <option>1–10</option>
                                        <option>11–50</option>
                                        <option>51–200</option>
                                        <option>200+</option>
                                    </select>
                                </div>

                                {/* Founded Year */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Founded Year</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.foundedYear && "is-invalid"}`}
                                        placeholder="2015"
                                        value={form.foundedYear}
                                        onChange={(e) =>
                                            setForm({ ...form, foundedYear: e.target.value })
                                        }
                                    />
                                    {errors.foundedYear && (
                                        <div className="text-danger small">{errors.foundedYear}</div>
                                    )}
                                </div>

                            </div>

                            {/* NEXT BUTTON (SAME STYLE) */}
                            <div className="text-end">
                                <button
                                    className="btn w-25 mt-2 d-flex align-items-center justify-content-center"
                                    onClick={nextStep}
                                    style={{
                                        backgroundColor: COLORS.primary,
                                        color: COLORS.white,
                                        fontWeight: 600,
                                    }}
                                >
                                    Next <FaArrowRight className="ms-1" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 2 – RECRUITER */}
                    {step === 2 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaUserTie /> Recruiter Details
                            </h5>

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Recruiter Name *</label>
                                    <input
                                        className={`form-control ${errors.recruiterName && "is-invalid"}`}
                                        value={form.recruiterName}
                                        onChange={(e) =>
                                            setForm({ ...form, recruiterName: e.target.value })
                                        }
                                    />
                                    {errors.recruiterName && (
                                        <div className="text-danger small">{errors.recruiterName}</div>
                                    )}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Recruiter Email *</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.recruiterEmail && "is-invalid"}`}
                                        value={form.recruiterEmail}
                                        onChange={(e) =>
                                            setForm({ ...form, recruiterEmail: e.target.value })
                                        }
                                    />
                                    {errors.recruiterEmail && (
                                        <div className="text-danger small">{errors.recruiterEmail}</div>
                                    )}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Recruiter Phone *</label>
                                    <input
                                        className={`form-control ${errors.recruiterPhone && "is-invalid"}`}
                                        value={form.recruiterPhone}
                                        onChange={(e) =>
                                            setForm({ ...form, recruiterPhone: e.target.value })
                                        }
                                    />
                                    {errors.recruiterPhone && (
                                        <div className="text-danger small">{errors.recruiterPhone}</div>
                                    )}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Position / Role</label>
                                    <input
                                        className="form-control"
                                        value={form.designation}
                                        onChange={(e) =>
                                            setForm({ ...form, designation: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-2">
                                <button
                                    className="btn w-50"
                                    onClick={prevStep}
                                    style={{ backgroundColor: COLORS.textLight, color: COLORS.white }}
                                >
                                    <FaArrowLeft /> Back
                                </button>

                                <button
                                    className="btn w-50"
                                    onClick={nextStep}
                                    style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
                                >
                                    Next <FaArrowRight />
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 3 – ADDRESS */}
                    {step === 3 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaMapMarkerAlt /> Company Address
                            </h5>

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Country *</label>
                                    <input
                                        className={`form-control ${errors.country && "is-invalid"}`}
                                        value={form.country}
                                        onChange={(e) =>
                                            setForm({ ...form, country: e.target.value })
                                        }
                                    />
                                    {errors.country && (
                                        <div className="text-danger small">{errors.country}</div>
                                    )}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">State *</label>
                                    <input
                                        className={`form-control ${errors.state && "is-invalid"}`}
                                        value={form.state}
                                        onChange={(e) =>
                                            setForm({ ...form, state: e.target.value })
                                        }
                                    />
                                    {errors.state && (
                                        <div className="text-danger small">{errors.state}</div>
                                    )}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">City *</label>
                                    <input
                                        className={`form-control ${errors.city && "is-invalid"}`}
                                        value={form.city}
                                        onChange={(e) =>
                                            setForm({ ...form, city: e.target.value })
                                        }
                                    />
                                    {errors.city && (
                                        <div className="text-danger small">{errors.city}</div>
                                    )}
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Full Address *</label>
                                    <textarea
                                        className={`form-control ${errors.address && "is-invalid"}`}
                                        rows={3}
                                        value={form.address}
                                        onChange={(e) =>
                                            setForm({ ...form, address: e.target.value })
                                        }
                                    />
                                    {errors.address && (
                                        <div className="text-danger small">{errors.address}</div>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-2">
                                <button
                                    className="btn w-50"
                                    onClick={prevStep}
                                    style={{ backgroundColor: COLORS.textLight, color: COLORS.white }}
                                >
                                    <FaArrowLeft /> Back
                                </button>

                                <button
                                    className="btn w-50"
                                    onClick={nextStep}
                                    style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
                                >
                                    Next <FaArrowRight />
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 4 – SECURITY */}
                    {step === 4 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaLock /> Account Security
                            </h5>

                            <div className="mb-3">
                                <label className="form-label">Password *</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password && "is-invalid"}`}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                />
                                {errors.password && (
                                    <div className="text-danger small">{errors.password}</div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Confirm Password *</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.confirmPassword && "is-invalid"}`}
                                    value={form.confirmPassword}
                                    onChange={(e) =>
                                        setForm({ ...form, confirmPassword: e.target.value })
                                    }
                                />
                                {errors.confirmPassword && (
                                    <div className="text-danger small">
                                        {errors.confirmPassword}
                                    </div>
                                )}
                            </div>

                            <div className="form-check mb-3">
                                <input
                                    type="checkbox"
                                    className={`form-check-input ${errors.accept && "is-invalid"}`}
                                    checked={form.accept}
                                    onChange={(e) =>
                                        setForm({ ...form, accept: e.target.checked })
                                    }
                                />
                                <label className="ms-1">
                                    I accept Terms & Privacy Policy *
                                </label>
                                {errors.accept && (
                                    <div className="text-danger small d-block">
                                        {errors.accept}
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn w-100 mt-2"
                                onClick={submitHandler}
                                disabled={loading}
                                style={{
                                    backgroundColor: COLORS.primary,
                                    color: COLORS.white,
                                    fontWeight: 600,
                                    opacity: loading ? 0.7 : 1,
                                    height: "50px"
                                }}
                            >
                                {loading ? "Creating Account..." : "Finish & Create Company Account"} <FaPaperPlane className="ms-2" />
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CompanyRegister;
