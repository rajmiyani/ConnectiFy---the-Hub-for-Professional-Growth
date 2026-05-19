import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
    FaPhoneSlash, FaDesktop, FaRegCommentDots, FaCode,
    FaPlay, FaRobot, FaExpand, FaCog, FaCheckCircle
} from "react-icons/fa";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

/* ================= THEME ================= */
const COLORS = {
    primary: "#0073b1",
    secondary: "#e8f4fb",
    dark: "#1f1f1f",
    light: "#f3f2ef",
    white: "#ffffff",
    border: "#e0e0e0",
    codeBg: "#1e1e1e", // VS Code Dark
    success: "#057642",
    danger: "#cc1016"
};

export default function InterviewRoom({ role = "interviewer" }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();

    // States
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [activeTab, setActiveTab] = useState("Code"); // Code, AI Assistant
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [candidate, setCandidate] = useState(null);
    const [interview, setInterview] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Refs for WebRTC
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    // 🕒 Timer logic
    useEffect(() => {
        const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 🚀 Fetch Interview Details
    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const res = await api.get(`/companies/interviews/${id}`);
                const data = res.data;
                if (data.success) {
                    setInterview(data.data);
                    setCandidate(data.data.application.user);
                    if (!code) setCode(`// Technical Interview for ${data.data.application.job.title}\n// Candidate: ${data.data.application.user.firstName}\n\nfunction solution() {\n  // Start coding here\n}`);
                }
            } catch (err) {
                console.error("Error fetching interview:", err);
            }
        };
        if (id) fetchInterview();
    }, [id]);

    // 🔌 Socket Integration
    useEffect(() => {
        if (!socket || !id) return;

        socket.emit("join_interview", id);

        socket.on("code_update", (newCode) => {
            setCode(newCode);
        });

        // WebRTC Signaling
        socket.on("webrtc_signal", async (signal) => {
            if (signal.type === "offer") {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                socket.emit("webrtc_signal", { interviewId: id, signal: answer });
            } else if (signal.type === "answer") {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        });

        return () => {
            socket.off("code_update");
            socket.off("webrtc_signal");
        };
    }, [socket, id]);

    // 💻 Handle Code Change
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (socket) {
            socket.emit("code_change", { interviewId: id, code: newCode });
        }
    };

    // 🤖 AI Suggestions
    const fetchAiSuggestions = async () => {
        setIsLoadingSuggestions(true);
        setActiveTab("AI Assistant");
        try {
            const res = await api.get(`/companies/interviews/${id}/suggestions`);
            const data = res.data;
            if (data.success) {
                setAiSuggestions(data.suggestions);
            }
        } catch (err) {
            console.error("Error fetching AI suggestions:", err);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const runCode = () => {
        setOutput("Running...\n");
        const logs = [];
        const originalLog = console.log;

        const customConsole = {
            log: (...args) => {
                logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
                originalLog(...args);
            }
        };

        try {
            const execute = new Function('console', code);
            execute(customConsole);
            setOutput(logs.length === 0 ? "> Code executed successfully (no output)" : logs.map(log => `> ${log}`).join('\n'));
        } catch (err) {
            setOutput(`> Runtime Error: ${err.message}`);
        }
    };

    if (!interview) return <div className="vh-100 d-flex justify-content-center align-items-center bg-light">Loading session...</div>;

    return (
        <div className="d-flex flex-column vh-100" style={{ backgroundColor: COLORS.light, fontFamily: "'Inter', sans-serif" }}>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom shadow-sm" style={{ height: "70px" }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <div className="spinner-grow text-danger spinner-grow-sm" role="status"></div>
                        <span className="fw-bold text-danger small">LIVE</span>
                    </div>
                    <div className="vr mx-2"></div>
                    <h5 className="fw-bold mb-0 text-dark">Technical Interview: {interview.application.job.title}</h5>
                    <span className="text-muted small">with {candidate.firstName} {candidate.lastName}</span>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="badge bg-light text-dark border px-3 py-2 fw-normal">
                        <span className="fw-bold">{formatTime(timeElapsed)}</span>
                    </div>
                    <button className="btn btn-danger fw-bold d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                        <FaPhoneSlash /> End Session
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="d-flex flex-grow-1 overflow-hidden">

                {/* LEFT: VIDEO FEED */}
                <div className="col-4 d-flex flex-column bg-dark position-relative p-3 gap-3">
                    <div className="flex-grow-1 bg-secondary rounded-4 overflow-hidden position-relative d-flex justify-content-center align-items-center">
                        <img src={candidate.profileImg || "https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate"} alt="Candidate" className="w-100 h-100 object-fit-cover" style={{ opacity: 0.9 }} />
                        <div className="position-absolute bottom-0 start-0 m-3 text-white bg-dark bg-opacity-50 px-3 py-1 rounded-pill small fw-bold">
                            {candidate.firstName} (Candidate)
                        </div>
                    </div>

                    <div className="position-absolute bottom-0 end-0 m-4 rounded-4 overflow-hidden border border-2 border-white shadow-lg" style={{ width: "160px", height: "110px", zIndex: 10 }}>
                        <div className="w-100 h-100 bg-secondary d-flex justify-content-center align-items-center text-white small">
                            {videoOn ? "You (Interviewer)" : <FaVideoSlash size={20} />}
                        </div>
                    </div>

                    <div className="d-flex justify-content-center gap-4 py-3 bg-dark bg-opacity-50 rounded-4 mt-auto">
                        <button className={`btn btn-lg rounded-circle ${micOn ? 'btn-light' : 'btn-danger'}`} onClick={() => setMicOn(!micOn)}>
                            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </button>
                        <button className={`btn btn-lg rounded-circle ${videoOn ? 'btn-light' : 'btn-danger'}`} onClick={() => setVideoOn(!videoOn)}>
                            {videoOn ? <FaVideo /> : <FaVideoSlash />}
                        </button>
                        <button className="btn btn-light btn-lg rounded-circle"><FaDesktop /></button>
                        <button className="btn btn-light btn-lg rounded-circle" onClick={fetchAiSuggestions} title="Get AI Suggestions"><FaRobot /></button>
                    </div>
                </div>

                {/* RIGHT: CODE EDITOR & TOOLS */}
                <div className="col-8 d-flex flex-column bg-white border-start">
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
                        <div className="d-flex gap-1">
                            {["Code", "AI Assistant"].map(tab => (
                                <button
                                    key={tab}
                                    className={`btn btn-sm fw-medium px-3 rounded-pill ${activeTab === tab ? "bg-white shadow-sm text-primary" : "text-muted"}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === "Code" && <FaCode className="me-2" />}
                                    {tab === "AI Assistant" && <FaRobot className="me-2" />}
                                    {tab}
                                </button>
                            ))}
                        </div>
                        {activeTab === "Code" && (
                            <button className="btn btn-sm btn-success fw-bold d-flex align-items-center gap-2" onClick={runCode}>
                                <FaPlay size={10} /> Run Code
                            </button>
                        )}
                    </div>

                    <div className="flex-grow-1 position-relative d-flex flex-column">
                        {activeTab === "Code" && (
                            <>
                                <textarea
                                    className="form-control border-0 h-100 p-4 font-monospace"
                                    style={{ backgroundColor: COLORS.codeBg, color: "#d4d4d4", resize: "none", fontSize: "14px", outline: "none" }}
                                    value={code}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    spellCheck="false"
                                ></textarea>
                                <div className="bg-dark text-white p-3 border-top" style={{ height: "180px", fontFamily: "monospace", fontSize: "13px" }}>
                                    <div className="d-flex justify-content-between text-muted small mb-2 uppercase">
                                        <span>TERMINAL</span>
                                        <span>ready</span>
                                    </div>
                                    <pre className="m-0 text-success">{output}</pre>
                                </div>
                            </>
                        )}

                        {activeTab === "AI Assistant" && (
                            <div className="p-4 bg-light h-100 overflow-auto">
                                <div className="alert alert-primary border-0 shadow-sm d-flex gap-3 align-items-start">
                                    <FaRobot size={24} className="mt-1" />
                                    <div>
                                        <h6 className="fw-bold">AI Interview Copilot</h6>
                                        <p className="small mb-0">Based on the job description and candidate profile, here are some tailored suggestions:</p>
                                    </div>
                                </div>

                                {isLoadingSuggestions ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2 text-muted">Thinking...</p>
                                    </div>
                                ) : (
                                    <ul className="list-group shadow-sm rounded-4 border-0">
                                        {aiSuggestions.map((sugg, i) => (
                                            <li key={i} className="list-group-item p-3 border-bottom d-flex gap-3 align-items-center">
                                                <div className="bg-white p-2 rounded-circle text-primary border shadow-sm">
                                                    <FaCheckCircle />
                                                </div>
                                                <span className="fw-medium text-dark">{sugg}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
