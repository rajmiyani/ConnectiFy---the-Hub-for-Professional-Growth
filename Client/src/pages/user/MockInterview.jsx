import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaRobot, FaUser, FaStopCircle, FaVolumeUp } from "react-icons/fa";
import { BiCheckCircle, BiTime } from "react-icons/bi";
import { Badge } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

/* ================= THEME ================= */
const COLORS = {
    primary: "#2563EB",
    secondary: "#E2E8F0",
    bg: "#F8FAFC",
    botBg: "#EFF6FF", // Light Blue
    userBg: "#FFFFFF",
    text: "#1E293B",
    micActive: "#EF4444", // Red
};

const MockInterview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    /* ================= STATE ================= */
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am your AI Interviewer. I'm here to help you practice. Shall we start with a quick introduction?", sender: "bot" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [topic, setTopic] = useState("Frontend Engineering");

    const messagesEndRef = useRef(null);
    const recognition = useRef(null);

    /* ================= EFFECTS ================= */
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = "en-US";

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsListening(false);
            };

            recognition.current.onerror = () => {
                setIsListening(false);
            };
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /* ================= HANDLERS ================= */
    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setIsThinking(true);

        try {
            const response = await api.post("/users/mock-interview/chat", {
                messages: [...messages, userMsg],
                topic: topic
            });
            const data = response.data;
            if (data.success) {
                const botMsg = { id: Date.now() + 1, text: data.text, sender: "bot" };
                setMessages((prev) => [...prev, botMsg]);
                speakText(data.text);
            }
        } catch (err) {
            console.error("AI Chat Error:", err);
        } finally {
            setIsThinking(false);
        }
    };

    const speakText = (text) => {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleMic = () => {
        if (isListening) {
            recognition.current?.stop();
            setIsListening(false);
        } else {
            recognition.current?.start();
            setIsListening(true);
        }
    };

    const handleEndSession = async () => {
        if (window.confirm("Are you sure you want to end this practice session and view your AI analysis?")) {
            setIsLoading(true);
            try {
                const response = await api.post("/users/mock-interview/analyze", { messages, topic });
                const data = response.data;
                if (data.success) {
                    setAnalysisData(data.data);
                    setShowAnalysis(true);
                }
            } catch (err) {
                console.error("Analysis Error:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="container-fluid d-flex flex-column" style={{ backgroundColor: COLORS.bg, height: "calc(100vh - 80px)", fontFamily: "'Inter', sans-serif" }}>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center py-3 px-4 border-bottom bg-white shadow-sm">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                        <FaRobot size={24} />
                    </div>
                    <div>
                        <h5 className="fw-bold mb-0">AI Mock Interview</h5>
                        <p className="small text-muted mb-0">Topic: {topic} • Practice Mode</p>
                    </div>
                </div>
                <div>
                    {!showAnalysis && (
                        <button className="btn btn-outline-danger btn-sm fw-bold" onClick={handleEndSession}>
                            End Session
                        </button>
                    )}
                </div>
            </div>

            {showAnalysis ? (
                <div className="flex-grow-1 p-5 overflow-auto" style={{ backgroundColor: "#FFFFFF" }}>
                    <div className="max-width-800 mx-auto">
                        <div className="text-center mb-5">
                            <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">AI INTERVIEW INSIGHTS</Badge>
                            <h2 className="fw-bold display-6">Performance Summary</h2>
                            <p className="text-muted">Great job, {user?.firstName || "User"}! You are highly competitive for this role.</p>
                        </div>

                        <div className="row g-4 mb-5">
                            <div className="col-md-4 text-center">
                                <div className="p-4 rounded-4 shadow-sm border" style={{ backgroundColor: "#f8fafc" }}>
                                    <h1 className="display-4 fw-bold text-primary mb-0">{analysisData.score}%</h1>
                                    <small className="text-muted fw-bold">OVERALL SCORE</small>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                                    <h6 className="fw-bold mb-4">Core Metrics</h6>
                                    {analysisData.metrics.map((m, i) => (
                                        <div key={i} className="mb-3">
                                            <div className="d-flex justify-content-between small fw-bold mb-1">
                                                <span>{m.label}</span>
                                                <span>{m.value}%</span>
                                            </div>
                                            <div className="progress" style={{ height: "8px", borderRadius: "10px" }}>
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${m.value}%`, backgroundColor: m.color || COLORS.primary, borderRadius: "10px" }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-sm p-4 rounded-4" style={{ backgroundColor: "#f0fdf4" }}>
                                    <h6 className="fw-bold text-success mb-3">Key Strengths</h6>
                                    <ul className="list-unstyled mb-0">
                                        {analysisData.strengths.map((s, i) => (
                                            <li key={i} className="mb-2 d-flex gap-2">
                                                <BiCheckCircle className="text-success mt-1" />
                                                <span className="small fw-medium">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-sm p-4 rounded-4" style={{ backgroundColor: "#fffbeb" }}>
                                    <h6 className="fw-bold text-warning mb-3">Areas for Improvement</h6>
                                    <ul className="list-unstyled mb-0">
                                        {analysisData.improvements.map((s, i) => (
                                            <li key={i} className="mb-2 d-flex gap-2">
                                                <BiTime className="text-warning mt-1" />
                                                <span className="small fw-medium">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-5">
                            <button className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg" onClick={() => navigate("/user/home")}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* CHAT AREA */}
                    <div className="flex-grow-1 p-4" style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`d-flex gap-3 align-items-start ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
                                {msg.sender === "bot" && (
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary" style={{ width: 35, height: 35, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <FaRobot size={16} />
                                    </div>
                                )}
                                <div
                                    className="p-3 shadow-sm"
                                    style={{
                                        maxWidth: "75%",
                                        borderRadius: msg.sender === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
                                        backgroundColor: msg.sender === "user" ? COLORS.primary : COLORS.userBg,
                                        color: msg.sender === "user" ? "#FFFFFF" : COLORS.text,
                                        fontSize: "15px",
                                        lineHeight: "1.5"
                                    }}
                                >
                                    {msg.text}
                                    {msg.sender === "bot" && (
                                        <div className="mt-2 pt-2 border-top d-flex gap-2">
                                            <FaVolumeUp className="text-primary pointer" style={{ cursor: "pointer" }} onClick={() => speakText(msg.text)} />
                                        </div>
                                    )}
                                </div>
                                {msg.sender === "user" && (
                                    <div className="bg-secondary p-2 rounded-circle" style={{ width: 35, height: 35, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <FaUser size={16} />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isThinking && (
                            <div className="d-flex align-items-center gap-2 text-muted ms-5">
                                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                                <small>AI is thinking...</small>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-4 bg-white border-top">
                        <div className="d-flex gap-3 align-items-center max-width-800 mx-auto">
                            <button
                                className="btn rounded-circle shadow-sm"
                                style={{
                                    width: 50,
                                    height: 50,
                                    backgroundColor: isListening ? COLORS.micActive : COLORS.secondary,
                                    color: isListening ? "#FFF" : COLORS.text,
                                    transition: "0.3s"
                                }}
                                onClick={toggleMic}
                            >
                                {isListening ? <FaStopCircle size={20} /> : <FaMicrophone size={20} />}
                            </button>

                            <div className="flex-grow-1 position-relative">
                                <input
                                    type="text"
                                    className="form-control border-0 bg-light p-3 pe-5 shadow-none"
                                    placeholder="Type your response here..."
                                    style={{ borderRadius: "30px" }}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button className="btn position-absolute top-50 end-0 translate-middle-y me-3 text-primary" onClick={handleSendMessage}>
                                    <FaPaperPlane size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <small className="text-muted fs-xs">
                                <FaVolumeUp className="me-1" /> Use the microphone to speak your answers for a real interview feel.
                            </small>
                        </div>
                    </div>
                </>
            )}
            {isLoading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex flex-column justify-content-center align-items-center" style={{ zIndex: 9999 }}>
                    <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
                    <h5 className="mt-3 fw-bold">Analyzing your performance...</h5>
                </div>
            )}
            <style>
                {`
                    .max-width-800 { max-width: 800px; }
                    .fs-xs { font-size: 11px; }
                `}
            </style>
        </div>
    );
};

export default MockInterview;
