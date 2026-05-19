import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { FaUser, FaEnvelope, FaLock, FaGlobeAsia, FaCheckCircle } from "react-icons/fa";
import { FaArrowRight, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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

const Register = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showAccountTypePopup, setShowAccountTypePopup] = useState(false);

    const [form, setForm] = useState({
        accountType: "user",
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        educationLevel: "",
        country: "",
        state: "",
        city: "",
        occupation: "",
        lookingFor: "",
        headline: "",
        bio: "",
        skills: "",
        university: "",
        courseName: "",
        startYear: "",
        passingYear: "",
        cgpa: "",
        interest: "",
        currentEducation: false,
        linkedin: "",
        portfolio: "",
        password: "",
        confirmPassword: "",
        pin: "",
        profileImg: null,
        profileVisibility: "public",
        accept: false,
    });

    const validateStep1 = () => {
        let errs = {};
        if (!form.firstName) errs.firstName = "First Name is required";
        if (!form.lastName) errs.lastName = "Last Name is required";
        if (!form.username) errs.username = "Username is required";
        if (!form.email) errs.email = "Email is required";
        if (!form.country) errs.country = "Country is required";
        if (!form.city) errs.city = "City is required";
        if (!form.headline) errs.headline = "Headline is required";
        if (!form.accountType) errs.accountType = "Please select account type";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };


    const validateStep3 = () => {
        let errs = {};
        if (!form.password) errs.password = "Password required";
        if (!form.confirmPassword) errs.confirmPassword = "Confirm password required";
        if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
        if (!form.accept) errs.accept = "You must accept terms";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 3 && !validateStep3()) return;
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const submitHandler = async () => {
        try {
            // Combine names for backend requirement
            const submissionData = {
                ...form,
                fullName: `${form.firstName} ${form.lastName}`.trim()
            };

            const response = await api.post("/users/register", submissionData);

            if (response.data.success) {

                showToast("🎉 Registration Successful! Please login.", "success");
                navigate("/login");
            } else {
                showToast(response.data.message || "Registration failed. Please check your details.", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showToast("Something went wrong. Please try again later.", "error");
        }
    };

    // Simplified: Account type is now handled by the parent selection wrapper
    useEffect(() => {
        setForm(prev => ({ ...prev, accountType: "user" }));
    }, []);


    return (
        <div
            style={{
                backgroundColor: COLORS.bg,
                minHeight: "100vh",
                // padding: "30px",
                display: "flex",
                // alignItems: "center",
                // justifyContent: "center",
            }}
        >
            <div
                className="container row shadow"
                style={{
                    maxWidth: "100%",
                    backgroundColor: COLORS.white,
                    borderRadius: "12px",
                    padding: "0",
                    overflow: "hidden",
                }}
            >
                {/* LEFT SIDE */}
                <div
                    className="col-md-6 d-flex flex-column align-items-center justify-content-center p-4"
                    style={{
                        backgroundColor: COLORS.secondary,
                        borderRight: `1px solid ${COLORS.border}`,
                        height: "100vh",
                        position: "sticky",
                        top: 0,
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/ConnectiFy_logo.png"
                        alt="ConnectiFY"
                        style={{ width: 150, marginBottom: 20 }}
                    />
                    <h3 style={{ color: COLORS.primary, fontWeight: 700 }}>Welcome 👋</h3>
                    <p
                        style={{
                            textAlign: "center",
                            color: COLORS.textLight,
                            marginTop: 10,
                            fontSize: 14,
                        }}
                    >
                        Create a professional account to connect, grow & showcase your journey.
                    </p>
                </div>

                {/* RIGHT FORM */}
                <div
                    className="col-md-6 p-4"
                    style={{
                        height: "100vh",
                        overflowY: "scroll",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    <style>
                        {`
                            .col-md-6::-webkit-scrollbar {
                                display: none;
                            }
                        `}
                    </style>
                    <h4 style={{ fontWeight: 700, color: COLORS.primary }} className="mb-4">
                        Create Your Account
                    </h4>

                    {/* STEP INDICATOR */}
                    <div className="position-relative mb-5" style={{ padding: "0 10px" }}>

                        {/* Background line */}
                        <div
                            style={{
                                position: "absolute",
                                top: 20,
                                left: 20,
                                right: 20,
                                height: 4,
                                backgroundColor: COLORS.border,
                                zIndex: 0,
                            }}
                        ></div>

                        {/* Filled progress line */}
                        <div
                            style={{
                                position: "absolute",
                                top: 20,
                                left: 20,
                                height: 4,
                                width: `${((step - 1) / 3) * 100}%`,
                                backgroundColor: COLORS.primary,
                                transition: "0.3s ease",
                                zIndex: 1,
                            }}
                        ></div>

                        <div className="d-flex justify-content-between position-relative" style={{ zIndex: 2 }}>
                            {["Personal", "Education", "Account", "Finish"].map((label, index) => {
                                const isActive = step === index + 1;
                                const isCompleted = step > index + 1;

                                return (
                                    <div key={index} className="text-center">
                                        <div
                                            style={{
                                                width: 45,
                                                height: 45,
                                                borderRadius: "50%",
                                                border: `2px solid ${isActive || isCompleted ? COLORS.primary : COLORS.border
                                                    }`,
                                                backgroundColor: isActive
                                                    ? COLORS.primary
                                                    : isCompleted
                                                        ? COLORS.white
                                                        : COLORS.border,
                                                color: isActive
                                                    ? COLORS.white
                                                    : isCompleted
                                                        ? COLORS.primary
                                                        : COLORS.textLight,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                margin: "auto",
                                                fontWeight: 700,
                                                fontSize: 18,
                                            }}
                                        >
                                            {isCompleted ? "✓" : index + 1}
                                        </div>
                                        <small
                                            style={{
                                                fontWeight: isActive ? 600 : 400,
                                                color: isActive ? COLORS.primary : COLORS.textLight,
                                            }}
                                        >
                                            {label}
                                        </small>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* STEP 1 – PERSONAL */}
                    {step === 1 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaUser /> Personal Information
                            </h5>

                            <div className="row">
                                {/* First Name */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">First Name *</label>
                                    <input
                                        className={`form-control ${errors.firstName && "is-invalid"}`}
                                        value={form.firstName}
                                        onChange={(e) =>
                                            setForm({ ...form, firstName: e.target.value })
                                        }
                                    />
                                    {errors.firstName && (
                                        <div className="text-danger small">{errors.firstName}</div>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Last Name *</label>
                                    <input
                                        className={`form-control ${errors.lastName && "is-invalid"}`}
                                        value={form.lastName}
                                        onChange={(e) =>
                                            setForm({ ...form, lastName: e.target.value })
                                        }
                                    />
                                    {errors.lastName && (
                                        <div className="text-danger small">{errors.lastName}</div>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Username *</label>
                                    <input
                                        className={`form-control ${errors.username && "is-invalid"}`}
                                        value={form.username}
                                        onChange={(e) =>
                                            setForm({ ...form, username: e.target.value })
                                        }
                                    />
                                    {errors.username && (
                                        <div className="text-danger small">{errors.username}</div>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email && "is-invalid"}`}
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                    />
                                    {errors.email && (
                                        <div className="text-danger small">{errors.email}</div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Phone</label>
                                    <input
                                        className="form-control"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({ ...form, phone: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.dob}
                                        onChange={(e) =>
                                            setForm({ ...form, dob: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Gender */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Gender</label>
                                    <select
                                        className="form-control"
                                        value={form.gender}
                                        onChange={(e) =>
                                            setForm({ ...form, gender: e.target.value })
                                        }
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Country */}
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

                                {/* City */}
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

                                {/* Headline */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Professional Headline *</label>
                                    <input
                                        placeholder="e.g. MERN Stack Developer | Freelancer"
                                        className={`form-control ${errors.headline && "is-invalid"}`}
                                        value={form.headline}
                                        onChange={(e) =>
                                            setForm({ ...form, headline: e.target.value })
                                        }
                                    />
                                    {errors.headline && (
                                        <div className="text-danger small">{errors.headline}</div>
                                    )}
                                </div>

                                {/* Short Bio */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Short Bio (Max 120 chars)</label>
                                    <textarea
                                        className="form-control"
                                        maxLength={120}
                                        rows={3}
                                        placeholder="A short introduction about yourself..."
                                        value={form.bio}
                                        onChange={(e) =>
                                            setForm({ ...form, bio: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Portfolio */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Portfolio Website (Optional)</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. https://myportfolio.com"
                                        value={form.portfolio}
                                        onChange={(e) =>
                                            setForm({ ...form, portfolio: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Profile Photo */}
                                <div className="col-md-12 mb-4">
                                    <label className="form-label">Profile Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control"
                                        onChange={(e) =>
                                            setForm({ ...form, photo: e.target.files[0] })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Next Button */}
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

                    {/* STEP 2 – EDUCATION */}
                    {step === 2 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaGlobeAsia /> Education Details
                            </h5>

                            <div className="row">

                                {/* Highest Education */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Highest Qualification *</label>
                                    <select
                                        className="form-control"
                                        value={form.educationLevel}
                                        onChange={(e) =>
                                            setForm({ ...form, educationLevel: e.target.value })
                                        }
                                    >
                                        <option value="">Select Qualification</option>
                                        <option value="10th">10th / SSC</option>
                                        <option value="12th">12th / HSC</option>
                                        <option value="Diploma">Diploma</option>
                                        <option value="Bachelor">Bachelor’s Degree</option>
                                        <option value="Master">Master’s Degree</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </div>

                                {/* Course Name */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Course / Degree Name *</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. BCA, B.Tech, MCA"
                                        value={form.courseName}
                                        onChange={(e) =>
                                            setForm({ ...form, courseName: e.target.value })
                                        }
                                    />
                                </div>

                                {/* University */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">University / Institute *</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. VNSGU, GTU, DU"
                                        value={form.university}
                                        onChange={(e) =>
                                            setForm({ ...form, university: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Start Year */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Start Year</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="2021"
                                        value={form.startYear}
                                        onChange={(e) =>
                                            setForm({ ...form, startYear: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Passing Year */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Passing Year</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="2024"
                                        value={form.passingYear}
                                        onChange={(e) =>
                                            setForm({ ...form, passingYear: e.target.value })
                                        }
                                        disabled={form.currentEducation}
                                    />
                                </div>

                                {/* Currently Studying */}
                                <div className="col-md-12 mb-3">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={form.currentEducation}
                                            onChange={(e) =>
                                                setForm({ ...form, currentEducation: e.target.checked })
                                            }
                                        />
                                        <label className="form-check-label ms-1">
                                            Currently Studying
                                        </label>
                                    </div>
                                </div>

                                {/* CGPA / Grade */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">CGPA / Percentage</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. 8.5 / 85%"
                                        value={form.cgpa}
                                        onChange={(e) =>
                                            setForm({ ...form, cgpa: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Skills */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Skills (comma separated)</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. React, Node.js, MongoDB"
                                        value={form.skills}
                                        onChange={(e) =>
                                            setForm({ ...form, skills: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Area of Interest */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Area of Interest</label>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. Full Stack, AI, Cloud"
                                        value={form.interest}
                                        onChange={(e) =>
                                            setForm({ ...form, interest: e.target.value })
                                        }
                                    />
                                </div>

                                {/* LinkedIn */}
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">LinkedIn Profile (Optional)</label>
                                    <input
                                        className="form-control"
                                        placeholder="https://linkedin.com/in/username"
                                        value={form.linkedin}
                                        onChange={(e) =>
                                            setForm({ ...form, linkedin: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Profile Image Upload */}
                                <div className="col-md-12 mb-4">
                                    <label className="form-label">Profile Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control"
                                        onChange={(e) => handleFileChange(e, "profileImg")}
                                    />
                                </div>

                                {/* Resume Upload */}
                                <div className="col-md-12 mb-4">
                                    <label className="form-label">Upload Resume (PDF)</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="form-control"
                                        onChange={(e) => handleFileChange(e, "resume")}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="d-flex gap-2 mt-2">
                                <button
                                    className="btn w-50"
                                    onClick={prevStep}
                                    style={{ backgroundColor: COLORS.textLight, color: COLORS.white }}
                                >
                                    <FaArrowLeft className="me-1" /> Back
                                </button>

                                <button
                                    className="btn w-50"
                                    onClick={nextStep}
                                    style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
                                >
                                    Next <FaArrowRight className="ms-1" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 3 – ACCOUNT */}
                    {step === 3 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaLock /> Account Security
                            </h5>

                            {/* Password */}
                            <div className="mb-3">
                                <label className="form-label">Password *</label>
                                <div className="input-group">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        className={`form-control ${errors.password && "is-invalid"}`}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                    >
                                        {showPass ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="text-danger small">{errors.password}</div>
                                )}

                                <div className="mt-1 small text-muted">
                                    ➤ Minimum 8 characters
                                    ➤ Include letters & numbers
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-3">
                                <label className="form-label">Confirm Password *</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.confirmPassword && "is-invalid"}`}
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                                {errors.confirmPassword && (
                                    <div className="text-danger small">{errors.confirmPassword}</div>
                                )}
                            </div>

                            {/* Terms & Privacy */}
                            <div className="form-check mb-3">
                                <input
                                    type="checkbox"
                                    className={`form-check-input ${errors.accept && "is-invalid"}`}
                                    checked={form.accept}
                                    onChange={(e) => setForm({ ...form, accept: e.target.checked })}
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

                            <div className="d-flex gap-2 mt-2">
                                <button
                                    className="btn w-50"
                                    onClick={prevStep}
                                    style={{ backgroundColor: COLORS.textLight, color: COLORS.white }}
                                >
                                    <FaArrowLeft className="me-1" /> Back
                                </button>

                                <button
                                    className="btn w-50"
                                    onClick={nextStep}
                                    style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
                                >
                                    Next <FaArrowRight className="ms-1" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 4 – FINAL */}
                    {step === 4 && (
                        <>
                            <h5 className="fw-bold mb-3">
                                <FaCheckCircle /> Review & Finish
                            </h5>

                            {/* Personal Info */}
                            <div className="card mb-3 border-0 shadow-sm">
                                <div className="card-header fw-bold" style={{ background: COLORS.secondary }}>
                                    Personal Information
                                </div>
                                <div className="card-body p-2">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">
                                            <strong>Full Name:</strong> {form.firstName} {form.lastName}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Username:</strong> {form.username}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Email:</strong> {form.email}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Phone:</strong> {form.phone || "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Gender:</strong> {form.gender || "Not Selected"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Date of Birth:</strong> {form.dob || "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Country:</strong> {form.country || "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>City:</strong> {form.city || "Not Provided"}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Education Info */}
                            <div className="card mb-3 border-0 shadow-sm">
                                <div className="card-header fw-bold" style={{ background: COLORS.secondary }}>
                                    Education Details
                                </div>
                                <div className="card-body p-2">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">
                                            <strong>Education Level:</strong> {form.educationLevel || "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>University:</strong> {form.university || "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Degree:</strong> {form.degree || "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Field Of Study:</strong> {form.fieldOfStudy || "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Graduation Year:</strong> {form.graduationYear || "Not Provided"}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Security Info */}
                            <div className="card mb-3 border-0 shadow-sm">
                                <div className="card-header fw-bold" style={{ background: COLORS.secondary }}>
                                    Account Security
                                </div>
                                <div className="card-body p-2">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">
                                            <strong>2FA:</strong> {form.twoFactor || "Not Enabled"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Security Question:</strong>{" "}
                                            {form.securityQuestion ? "Selected" : "Not Provided"}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>PIN:</strong> {form.pin ? "Set" : "Not Set"}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Additional Final Inputs */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">Short Bio (Optional)</label>
                                <textarea
                                    rows="3"
                                    className="form-control"
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                    placeholder="Tell something about yourself... (Max 200 words)"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Profile Visibility</label>
                                <select
                                    className="form-select"
                                    value={form.profileVisibility}
                                    onChange={(e) =>
                                        setForm({ ...form, profileVisibility: e.target.value })
                                    }
                                >
                                    <option value="public">Public – Anybody can view</option>
                                    <option value="private">Private – Only connections can view</option>
                                    <option value="hidden">Hidden – Only you can view</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <button
                                className="btn w-100 mt-3"
                                onClick={submitHandler}
                                style={{
                                    backgroundColor: COLORS.primary,
                                    color: COLORS.white,
                                    fontWeight: 600,
                                }}
                            >
                                Finish & Create Account <FaPaperPlane className="ms-2" />
                            </button>
                        </>
                    )}
                </div>
                {/* REGISTER AS POPUP */}
                {showAccountTypePopup && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                        style={{
                            background: "rgba(0,0,0,0.4)",
                            zIndex: 2000,
                            backdropFilter: "blur(3px)",
                        }}
                    >
                        <div
                            className="bg-white p-4 rounded-4 shadow-lg"
                            style={{
                                width: "90%",
                                maxWidth: "420px",
                                animation: "fadeIn 0.3s",
                            }}
                        >
                            <h4 className="fw-bold mb-3 text-center">Register As</h4>

                            <div className="d-flex flex-column gap-3">

                                {/* USER OPTION */}
                                <div
                                    className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${form.accountType === "user" ? "border-primary bg-light" : ""
                                        }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setForm({ ...form, accountType: "user" })}
                                >
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="user"
                                        checked={form.accountType === "user"}
                                        onChange={() => setForm({ ...form, accountType: "user" })}
                                    />
                                    <span className="fw-semibold">Individual User</span>
                                </div>

                                {/* COMPANY OPTION */}
                                <div
                                    className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${form.accountType === "company"
                                        ? "border-primary bg-light"
                                        : ""
                                        }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setForm({ ...form, accountType: "company" })}
                                >
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="company"
                                        checked={form.accountType === "company"}
                                        onChange={() => setForm({ ...form, accountType: "company" })}
                                    />
                                    <span className="fw-semibold">Company / Recruiter</span>
                                </div>
                            </div>

                            {/* Error */}
                            {errors.accountType && (
                                <div className="text-danger small mt-2 text-center">
                                    {errors.accountType}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="d-flex justify-content-between mt-4">

                                {/* CANCEL BUTTON */}
                                <button
                                    className="btn w-25"
                                    onClick={() => setShowAccountTypePopup(false)}
                                    style={{
                                        backgroundColor: COLORS.textLight,
                                        color: COLORS.white,
                                        padding: "10px 20px",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        letterSpacing: "0.3px",
                                        border: "none",
                                        transition: "0.3s",
                                    }}
                                    onMouseOver={(e) => (e.target.style.backgroundColor = "#4d4d4d")}
                                    onMouseOut={(e) => (e.target.style.backgroundColor = COLORS.textLight)}
                                >
                                    Cancel
                                </button>

                                {/* SAVE BUTTON */}
                                <button
                                    className="btn w-25"
                                    onClick={() => {
                                        if (!form.accountType) {
                                            setErrors({
                                                ...errors,
                                                accountType: "Please select account type",
                                            });
                                        } else {
                                            setShowAccountTypePopup(false);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: COLORS.primary,
                                        color: COLORS.white,
                                        padding: "10px 20px",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        letterSpacing: "0.3px",
                                        border: "none",
                                        transition: "0.3s",
                                    }}
                                    onMouseOver={(e) => (e.target.style.backgroundColor = "#005580")}
                                    onMouseOut={(e) => (e.target.style.backgroundColor = COLORS.primary)}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Register;
