# ConnectiFy — Quality Assurance Test Cases

This document outlines the essential test scenarios for the ConnectiFy platform. All "Physical Results" and "Remarks" reflect the current state of the implementation as verified in the backend logic.

---

## 1. Login Module (User / Company / Admin)

| Sr. No | Test Scenario | Expected Result | Actual Result | Remark |
|--------|---------------|-----------------|---------------|--------|
| 1 | Enter valid email & invalid password | Error message | "Invalid credentials" displayed | Pass |
| 2 | Enter invalid email & valid password | Error message | "Invalid credentials" displayed | Pass |
| 3 | Enter missing email or password | Validation error | "Email and password are required" | Pass |
| 4 | Enter valid credentials (Unverified) | OTP prompt | "Account unverified. An OTP has been sent..." | Pass |
| 5 | Enter valid credentials (Verified) | Login successful | "Logged in successfully" | Pass |
| 6 | Admin: Enter invalid credentials | Error message | "Invalid admin credentials." | Pass |
| 7 | Admin: Enter valid credentials | Login successful | "Admin login successful." | Pass |

---

## 2. Registration Module (User / Company)

| Sr. No | Test Scenario | Expected Result | Actual Result | Remark |
|--------|---------------|-----------------|---------------|--------|
| 1 | Submit User registration with missing fields | Validation error | "Required fields are missing: fullName, username..." | Pass |
| 2 | Submit password & confirmPassword mismatch | Validation error | "Passwords do not match" | Pass |
| 3 | Submit password less than 8 characters | Validation error | "Password must be at least 8 characters long" | Pass |
| 4 | Submit already registered email/username | Conflict error | "User already exists with this email or username" | Pass |
| 5 | Submit valid Company registration details | Registration success | "Company registered successfully! Please login..." | Pass |
| 6 | Company: Mismatched recruiter email format | Validation error | "Invalid recruiter email format." | Pass |

---

## 3. Job Management Module (Company)

| Sr. No | Test Scenario | Expected Result | Actual Result | Remark |
|--------|---------------|-----------------|---------------|--------|
| 1 | Post job with missing mandatory fields | Validation error | "Missing required fields" | Pass |
| 2 | Post job with invalid Company ID | 404 Error | "Company not found" | Pass |
| 3 | Submit valid job posting details | Success message | "Job posted successfully" | Pass |
| 4 | Update job details successfully | Success message | "Job updated successfully" | Pass |
| 5 | Delete an existing job posting | Success message | "Job deleted successfully" | Pass |

---

## 4. Job Application & Recruitment Flow (User / Company)

| Sr. No | Test Scenario | Expected Result | Actual Result | Remark |
|--------|---------------|-----------------|---------------|--------|
| 1 | Apply for a job without Job/User ID | Validation error | "Job ID and User ID are required" | Pass |
| 2 | Apply for a job already applied for | Conflict error | "You have already applied for this job" | Pass |
| 3 | Submit a valid job application | Success message | "Application submitted successfully" | Pass |
| 4 | Schedule interview with past date | Validation error | "Interview date cannot be in the past" | Pass |
| 5 | Schedule interview with valid details | Success message | "Interview scheduled successfully" | Pass |
| 6 | Update application status (Shortlist/Hire) | Success message | "Status updated to SHORTLISTED" | Pass |

---

## 5. Network & Interactions (User)

| Sr. No | Test Scenario | Expected Result | Actual Result | Remark |
|--------|---------------|-----------------|---------------|--------|
| 1 | View non-existent job details | 404 Error | "Job not found" | Pass |
| 2 | Save a job for the first time | Success message | "Job saved successfully" | Pass |
| 3 | Remove a saved job (Toggle) | Success message | "Job removed from saved" | Pass |
| 4 | Send OTP verification (Resend) | Success message | "New OTP sent to your email." | Pass |
| 5 | Reset password with invalid token | Validation error | "Invalid or expired reset token" | Pass |

---

## 6. Admin Panel (Moderation)

| Sr. No | Test Scenario | Expected Result | Actual Result | Remark |
|--------|---------------|-----------------|---------------|--------|
| 1 | Moderate post without auth token | 401 Error | "Unauthorized access" | Pass |
| 2 | Moderate post (Warn/Block/Delete) | Success message | "Post moderation action applied" | Pass |
| 3 | Fetch dashboard activity data | Data returned | Dashboard charts populated with real data | Pass |
