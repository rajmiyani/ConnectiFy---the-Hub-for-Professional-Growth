import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAward, FiClock, FiCheckCircle, FiXCircle, FiPlay, FiChevronRight, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
    primary: "#0073b1",
    secondary: "#e8f4fb",
    textDark: "#1f1f1f",
    textLight: "#606770",
    border: "#e0e0e0",
    white: "#ffffff",
    hover: "#f7f9fa",
    bg: "#f3f2ef",
    success: "#28a745",
    danger: "#dc3545",
};

export default function DailyQuiz() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState("intro"); // intro, playing, finished
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timer, setTimer] = useState(15);
    const [results, setResults] = useState([]);

    const questions = [
        {
            id: 1,
            question: "Which hook is used to handle side effects in React?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correct: 1,
            explanation: "useEffect allows you to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.",
        },
        {
            id: 2,
            question: "What is the time complexity of searching in a balanced Binary Search Tree?",
            options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
            correct: 1,
            explanation: "In a balanced BST, each comparison allows you to skip half of the remaining nodes, resulting in logarithmic time complexity.",
        },
        {
            id: 3,
            question: "Which CSS property is used to create a flex container?",
            options: ["flex-direction", "display: flex", "align-items", "justify-content"],
            correct: 1,
            explanation: "Setting 'display: flex' on an element makes it a flex container, enabling flexbox layout for its children.",
        },
    ];

    useEffect(() => {
        let interval;
        if (gameState === "playing" && timer > 0 && selectedAnswer === null) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (timer === 0 && selectedAnswer === null) {
            handleAnswer(null);
        }
        return () => clearInterval(interval);
    }, [gameState, timer, selectedAnswer]);

    const startQuiz = () => {
        setGameState("playing");
        setCurrentQuestion(0);
        setScore(0);
        setTimer(15);
        setResults([]);
    };

    const handleAnswer = (index) => {
        setSelectedAnswer(index);
        const isCorrect = index === questions[currentQuestion].correct;
        if (isCorrect) setScore((s) => s + 1);

        setResults([...results, { question: questions[currentQuestion].id, isCorrect, chosen: index }]);

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion((c) => c + 1);
                setSelectedAnswer(null);
                setTimer(15);
            } else {
                setGameState("finished");
            }
        }, 1500);
    };

    return (
        <div style={{ background: COLORS.bg, minHeight: "100vh", padding: "40px" }}>
            <div className="container max-w-2xl mx-auto">

                {/* HEADER */}
                <div className="bg-white rounded-4 shadow-sm p-4 mb-4 d-flex align-items-center justify-content-between border-bottom border-4 border-primary">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-3 bg-secondary rounded-4 text-primary">
                            <FiAward size={28} />
                        </div>
                        <div>
                            <h4 className="fw-bold mb-1">Daily Tech Quiz</h4>
                            <p className="mb-0 text-muted small">Solve today's challenge and boost your rank</p>
                        </div>
                    </div>
                    {gameState === "playing" && (
                        <div className="d-flex align-items-center gap-2 px-3 py-2 bg-light rounded-pill border">
                            <FiClock className={timer < 5 ? "text-danger animate-pulse" : "text-primary"} />
                            <span className={`fw-bold ${timer < 5 ? "text-danger" : ""}`}>{timer}s</span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-4 shadow-sm overflow-hidden" style={{ minHeight: "400px", border: `1px solid ${COLORS.border}` }}>
                    <AnimatePresence mode="wait">
                        {/* INTRO STATE */}
                        {gameState === "intro" && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-5 text-center"
                            >
                                <div className="mb-4 d-inline-block p-4 bg-secondary rounded-circle">
                                    <FiAward size={64} className="text-primary" />
                                </div>
                                <h2 className="fw-bold mb-3">Ready for today's quiz?</h2>
                                <p className="text-muted mb-4 px-lg-5">
                                    Test your technical knowledge with 3 curated questions.
                                    You have 15 seconds for each question.
                                </p>
                                <button
                                    className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-2 mx-auto"
                                    onClick={startQuiz}
                                >
                                    <FiPlay /> Start Today's Quiz
                                </button>
                            </motion.div>
                        )}

                        {/* PLAYING STATE */}
                        {gameState === "playing" && (
                            <motion.div
                                key="playing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-4 p-lg-5"
                            >
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted small fw-bold">QUESTION {currentQuestion + 1} OF {questions.length}</span>
                                        <span className="badge bg-secondary text-primary px-3 rounded-pill">+{score * 10} XP</span>
                                    </div>
                                    <div className="progress" style={{ height: "6px" }}>
                                        <div
                                            className="progress-bar bg-primary"
                                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, transition: "width 0.5s ease" }}
                                        ></div>
                                    </div>
                                </div>

                                <h4 className="fw-bold mb-5 leading-tight">{questions[currentQuestion].question}</h4>

                                <div className="d-flex flex-column gap-3">
                                    {questions[currentQuestion].options.map((opt, i) => {
                                        const isCorrect = i === questions[currentQuestion].correct;
                                        const isSelected = selectedAnswer === i;
                                        const showSuccess = selectedAnswer !== null && isCorrect;
                                        const showError = isSelected && !isCorrect;

                                        return (
                                            <button
                                                key={i}
                                                className={`btn text-start p-3 rounded-4 d-flex align-items-center justify-content-between border-2 transition-all ${isSelected ? (isCorrect ? "border-success bg-success-subtle" : "border-danger bg-danger-subtle") :
                                                    (selectedAnswer !== null && isCorrect ? "border-success bg-success-subtle" : "border-light bg-light hover-border")
                                                    }`}
                                                onClick={() => selectedAnswer === null && handleAnswer(i)}
                                                disabled={selectedAnswer !== null}
                                            >
                                                <span className="fw-bold">{opt}</span>
                                                {showSuccess && <FiCheckCircle className="text-success" size={20} />}
                                                {showError && <FiXCircle className="text-danger" size={20} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* FINISHED STATE */}
                        {gameState === "finished" && (
                            <motion.div
                                key="finished"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-5 text-center"
                            >
                                <div className="mb-4">
                                    <h2 className="fw-bold mb-1">🎉 Quiz Completed!</h2>
                                    <p className="text-muted">Great effort! Here's how you performed:</p>
                                </div>

                                <div className="d-flex justify-content-center gap-4 mb-5">
                                    <div className="p-4 bg-light rounded-4 border w-50">
                                        <h1 className="fw-bold mb-0 text-primary">{Math.round((score / questions.length) * 100)}%</h1>
                                        <small className="text-muted">Accuracy</small>
                                    </div>
                                    <div className="p-4 bg-light rounded-4 border w-50">
                                        <h1 className="fw-bold mb-0 text-success">+{score * 10}</h1>
                                        <small className="text-muted">XP Earned</small>
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-2 mb-5">
                                    <button className="btn btn-primary py-3 rounded-pill fw-bold shadow-sm" onClick={startQuiz}>
                                        <FiRefreshCw className="me-2" /> Retake Practice Quiz
                                    </button>
                                    <button className="btn btn-link text-muted text-decoration-none small" onClick={() => setGameState("intro")}>
                                        Back to Selection
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
        .max-w-2xl { max-width: 700px; }
        .leading-tight { line-height: 1.4; }
        .hover-border:hover { border-color: ${COLORS.primary} !important; background: ${COLORS.secondary} !important; }
        .bg-success-subtle { background-color: #d4edda; }
        .bg-danger-subtle { background-color: #f8d7da; }
        .animate-pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
        </div>
    );
}
