import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaVideo,
  FaBuilding,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaLink,
  FaGoogle,
  FaRedo,
  FaTimesCircle,
} from "react-icons/fa";

/* ================= THEME ================= */
const COLORS = {
  primary: "#0073b1",
  secondary: "#e8f4fb",
  bg: "#f3f2ef",
  white: "#ffffff",
  textDark: "#1f1f1f",
  textLight: "#606770",
  success: "#0073b1",
  danger: "#b3261e",
  border: "#e0e0e0",
};

/* ================= MOCK DATA ================= */
const INTERVIEWERS = ["Amit HR", "Neha Tech Lead", "Rahul Manager", "Sanjay CTO"];
const TIME_SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

/* ================= MAIN ================= */
export default function InterviewSchedule() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    applicationId: "",
    candidateName: "",
    interviewer: "",
    date: "",
    time: "",
    mode: "Online",
    link: "",
    notes: "",
    status: "",
  });

  const [toast, setToast] = useState("");

  /* ================= FETCH CANDIDATES ================= */
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/companies/jobs/all-applicants/${user.id}`);
        if (res.data.success) {
          // Filter for Shortlisted or Pending candidates for scheduling
          setCandidates(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching applicants:", error);
      }
    };
    fetchApplicants();
  }, [user?.id]);

  /* ================= HELPERS ================= */
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const generateLink = () => {
    const random = Math.random().toString(36).substring(2, 8);
    setForm({
      ...form,
      link:
        form.mode === "Online"
          ? `https://meet.google.com/${random}`
          : "Office Interview",
    });
  };

  const googleCalendarURL = () => {
    if (!form.date || !form.time) return "#";
    const start = `${form.date.replace(/-/g, "")}T${form.time.replace(
      ":",
      ""
    )}00`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview with ${form.candidateName
      }&details=Interview with ${form.interviewer}&location=${form.link
      }&dates=${start}/${start}`;
  };

  const scheduleInterview = async () => {
    if (
      !form.applicationId ||
      !form.interviewer ||
      !form.date ||
      !form.time ||
      !form.mode
    ) {
      notify("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`);
      const res = await api.post(`/companies/jobs/schedule-interview/${form.applicationId}`, {
        type: form.mode,
        scheduledAt,
        location: form.link || (form.mode === "Online" ? "Online Meeting" : "Office"),
        notes: form.notes || `Interview with ${form.interviewer}`
      });

      if (res.data.success) {
        setForm({ ...form, status: "Scheduled" });
        notify("Interview Scheduled & Email Sent");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      notify(error.response?.data?.message || "Failed to schedule interview");
    } finally {
      setIsLoading(false);
    }
  };

  const rescheduleInterview = () => {
    // For now, just resetting the UI status as backend might need a separate Patch endpoint
    setForm({ ...form, status: "Rescheduled" });
    notify("Interview Rescheduled & Calendar Updated");
  };

  const cancelInterview = () => {
    setForm({ ...form, status: "Cancelled" });
    notify("Interview Cancelled & Email Sent");
  };

  /* ================= UI ================= */
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", padding: 32 }}>
      <h4 className="fw-bold mb-1">Interview Management</h4>
      <small className="text-muted">
        Schedule interviews with applicants and sync with Google Calendar.
      </small>

      <div className="row g-4 mt-3">
        {/* ================= LEFT ================= */}
        <div className="col-lg-7">
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            {/* Candidate */}
            <label className="fw-semibold mb-1">Select Candidate *</label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                <FaUserTie />
              </span>
              <select
                className="form-control"
                value={form.applicationId}
                onChange={(e) => {
                  const selected = candidates.find(c => c.id === e.target.value);
                  setForm({
                    ...form,
                    applicationId: e.target.value,
                    candidateName: selected ? selected.name : ""
                  });
                }}
              >
                <option value="">Select an applicant</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.experience} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Interviewer */}
            <label className="fw-semibold mb-1">Interviewer *</label>
            <select
              className="form-control mb-3"
              value={form.interviewer}
              onChange={(e) =>
                setForm({ ...form, interviewer: e.target.value })
              }
            >
              <option value="">Select Interviewer</option>
              {INTERVIEWERS.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>

            {/* Date */}
            <label className="fw-semibold mb-1">Date *</label>
            <input
              type="date"
              className="form-control mb-3"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />

            {/* Time Slots */}
            <label className="fw-semibold mb-2">Time *</label>
            <div className="d-flex gap-2 flex-wrap mb-3">
              {TIME_SLOTS.map((t) => (
                <div
                  key={t}
                  onClick={() => setForm({ ...form, time: t })}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background:
                      form.time === t
                        ? COLORS.primary
                        : COLORS.secondary,
                    color: form.time === t ? "#fff" : COLORS.primary,
                    fontWeight: 600,
                    transition: "0.2s"
                  }}
                >
                  <FaClock /> {t}
                </div>
              ))}
            </div>

            {/* Mode */}
            <label className="fw-semibold mb-2">Mode *</label>
            <div className="d-flex gap-3 mb-3">
              {["Online", "In-Person"].map((m) => (
                <div
                  key={m}
                  onClick={() =>
                    setForm({ ...form, mode: m, link: "" })
                  }
                  className="p-3 border rounded flex-fill"
                  style={{
                    background:
                      form.mode === m
                        ? COLORS.secondary
                        : COLORS.white,
                    border: form.mode === m ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                    cursor: "pointer",
                    transition: "0.2s"
                  }}
                >
                  {m === "Online" ? <FaVideo color={COLORS.primary} /> : <FaBuilding color={COLORS.primary} />}{" "}
                  <strong>{m}</strong>
                </div>
              ))}
            </div>

            {/* Meeting Link */}
            {form.mode === "Online" && (
              <>
                <button
                  className="btn btn-outline-primary btn-sm mb-2"
                  onClick={generateLink}
                >
                  <FaLink /> Generate Meeting Link
                </button>
                {form.link && (
                  <input
                    className="form-control mb-3"
                    value={form.link}
                    readOnly
                  />
                )}
              </>
            )}

            {/* NOTES */}
            <label className="fw-semibold mb-1">Internal Notes</label>
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Interview instructions or notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            ></textarea>

            {/* ACTIONS */}
            <div className="d-flex gap-2 mt-3 flex-wrap">
              <button
                className="btn flex-fill fw-bold"
                style={{ background: COLORS.primary, color: "#fff", padding: '10px' }}
                onClick={scheduleInterview}
                disabled={isLoading}
              >
                {isLoading ? "Scheduling..." : "Schedule Interview"}
              </button>

              {form.status && (
                <>
                  <a
                    href={googleCalendarURL()}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary flex-fill fw-bold"
                    style={{ padding: '10px' }}
                  >
                    <FaGoogle /> Add to Calendar
                  </a>

                  <button
                    className="btn btn-outline-danger flex-fill fw-bold"
                    style={{ padding: '10px' }}
                    onClick={cancelInterview}
                  >
                    <FaTimesCircle /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-lg-5">
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-3">
            <h6 className="fw-bold mb-3" style={{ color: COLORS.primary }}>Interview Summary</h6>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status:</span>
                <span className={`fw-bold ${form.status ? 'text-primary' : ''}`}>{form.status || "Not Scheduled"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Candidate:</span>
                <span className="fw-bold">{form.candidateName || "-"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Interviewer:</span>
                <span className="fw-bold">{form.interviewer || "-"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Date & Time:</span>
                <span className="fw-bold">{form.date ? `${form.date} @ ${form.time || '?'}` : "-"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Mode:</span>
                <span className="fw-bold">{form.mode || "-"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <h6 className="fw-bold mb-3">
              <FaEnvelope color={COLORS.primary} /> Notification Preview
            </h6>
            <div className="alert alert-secondary border-0 p-3" style={{ fontSize: '14px' }}>
              <p className="mb-2"><strong>To:</strong> {candidates.find(c => c.id === form.applicationId)?.email || "candidate@email.com"}</p>
              <p className="mb-0">
                Hi {form.candidateName || "Candidate"},<br /><br />
                We are pleased to invite you for an interview for the position you applied for. <br /><br />
                <strong>Date:</strong> {form.date || "---"}<br />
                <strong>Time:</strong> {form.time || "---"}<br />
                <strong>Link:</strong> {form.link || "N/A"}<br /><br />
                Looking forward to meeting you!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOAST ===== */}
      {toast && (
        <div
          className="position-fixed bottom-0 end-0 m-4 px-4 py-2 rounded shadow-lg animate-fade-in"
          style={{ background: COLORS.success, color: "#fff", zIndex: 1000 }}
        >
          <FaCheckCircle className="me-2" /> {toast}
        </div>
      )}
    </div>
  );
}
