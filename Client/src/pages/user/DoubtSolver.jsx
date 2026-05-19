import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiCpu, FiUser, FiZap, FiBook, FiTerminal } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
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
    accent: "#ff9800",
};

export default function DoubtSolver() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: "system-1",
            role: "assistant",
            content: "Hello! I'm your AI Doubt Solver. Paste your code or ask any technical questions, and I'll help you debug or explain concepts.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await api.post("/users/doubt-solver", { question: input });
            const data = response.data;
            if (data.success) {
                const aiResponse = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: data.answer,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiResponse]);
            }
        } catch (error) {
            console.error("Doubt Solver Error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const generateMockResponse = (question) => {
        const q = question.toLowerCase();
        if (q.includes("react")) return "React is a JavaScript library for building user interfaces. It uses a virtual DOM to optimize rendering and a component-based architecture for reusability.";
        if (q.includes("debug") || q.includes("error")) return "To debug this, I recommend checking your console logs first. If it's a runtime error, ensure all your variables are defined and your API calls are returning the expected data structure.";
        return "That's an interesting technical question! Let's break it down. Have you tried checking the official documentation for the latest best practices on this topic?";
    };

    return (
        <div style={{ background: COLORS.bg, minHeight: "100vh", padding: "40px" }}>
            <div className="container-fluid max-w-4xl mx-auto">
                {/* HEADER */}
                <div className="bg-white rounded-4 shadow-sm p-4 mb-4 d-flex align-items-center gap-3 border-start border-4 border-primary">
                    <div className="p-3 bg-secondary rounded-circle text-primary">
                        <FiCpu size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1">AI Doubt Solver</h4>
                        <p className="mb-0 text-muted small">Instant expert help with code, logic, and concepts</p>
                    </div>
                </div>

                {/* CHAT WINDOW */}
                <div
                    className="bg-white rounded-4 shadow-sm d-flex flex-column overflow-hidden"
                    style={{ height: "calc(100vh - 250px)", border: `1px solid ${COLORS.border}` }}
                >
                    <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`d-flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div
                                        className={`p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm`}
                                        style={{
                                            width: 40, height: 40,
                                            backgroundColor: msg.role === "user" ? COLORS.primary : COLORS.secondary,
                                            color: msg.role === "user" ? "white" : COLORS.primary
                                        }}
                                    >
                                        {msg.role === "user" ? <FiUser /> : <FiCpu />}
                                    </div>
                                    <div
                                        className={`p-3 rounded-4 shadow-sm`}
                                        style={{
                                            maxWidth: "75%",
                                            backgroundColor: msg.role === "user" ? COLORS.primary : COLORS.white,
                                            color: msg.role === "user" ? "white" : COLORS.textDark,
                                            border: msg.role === "assistant" ? `1px solid ${COLORS.border}` : "none",
                                        }}
                                    >
                                        <p className="mb-1 leading-relaxed">{msg.content}</p>
                                        <small className={`opacity-50 ${msg.role === "user" ? "text-white" : "text-muted"}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </small>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="d-flex gap-3"
                                >
                                    <div className="p-2 bg-secondary rounded-circle text-primary" style={{ width: 40, height: 40 }}>
                                        <FiCpu />
                                    </div>
                                    <div className="p-3 bg-white border rounded-4 text-muted small">
                                        AI is thinking...
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={scrollRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-4 bg-light border-top">
                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control border-0 shadow-none p-3 rounded-pill"
                                placeholder="Ask me anything... (e.g., 'Explain useEffect in React')"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button
                                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: 50, height: 50 }}
                                onClick={handleSend}
                            >
                                <FiSend size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* QUICK TAGS */}
                <div className="mt-4 d-flex flex-wrap gap-2">
                    {["Explain Code", "Debug Error", "Architecture advice", "Optimize performance", "Learning Path"].map(tag => (
                        <button
                            key={tag}
                            className="btn btn-light btn-sm border bg-white rounded-pill px-3 shadow-sm text-muted"
                            onClick={() => setInput(tag)}
                        >
                            <FiZap className="text-warning me-1" /> {tag}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
        .leading-relaxed { line-height: 1.6; }
        .max-w-4xl { max-width: 900px; }
      `}</style>
        </div>
    );
}
