import React, { useState, useEffect, useRef } from "react";
import {
    BiSearch,
    BiSend,
    BiPaperclip,
    BiSmile,
    BiDotsVertical,
    BiBriefcase,
    BiEnvelope,
    BiUserCircle,
    BiStar,
    BiArchive,
    BiCog,
} from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=0";

function formatTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "long" });
    return date.toLocaleDateString();
}

const COLORS = {
    primary: "#0d6efd",
    background: "#f8f9fb",
    sidebar: "#f3f4f6",
    card: "#ffffff",
    textDark: "#212529",
    textMuted: "#6c757d",
    accent: "#0096C7",
    border: "#e4e6e8",
    chatMe: "#E7F1FF",
    chatOther: "#F1F3F6",
};

const Message = () => {
    const { user: company } = useAuth();
    const socket = useSocket();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);
    const [input, setInput] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [file, setFile] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [filterType, setFilterType] = useState("all");

    // Real data
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const emojis = ["😊", "❤️", "😂", "👍", "🥰", "😎"];
    const chatContainerRef = useRef(null);

    // 1. Fetch conversations for company
    useEffect(() => {
        if (!company?.id) return;

        const fetchConversations = async () => {
            try {
                const res = await api.get(`/users/chat/conversations/${company.id}?type=company`);
                const json = res.data;
                if (json.success) {
                    setConversations(json.data);
                }
            } catch (err) {
                console.error("Failed to load conversations:", err);
            }
        };

        fetchConversations();
    }, [company?.id]);

    // 2. Socket listener
    useEffect(() => {
        if (!socket || !activeConversationId) return;

        socket.emit("joinRoom", activeConversationId);

        const handleNewMessage = (msg) => {
            if (msg.conversationId === activeConversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage");
    }, [socket, activeConversationId]);

    // 3. Selection handler
    const handleSelectConversation = async (conv) => {
        const otherParticipant = conv.participants?.[0]; // For company, the other is a user
        if (!otherParticipant) return;

        setSelectedContact({
            id: otherParticipant.id,
            name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
            avatar: otherParticipant.profileImg || DEFAULT_AVATAR,
            online: true
        });

        setActiveConversationId(conv.id);
        setMessages([]);
        setLoading(true);

        try {
            const res = await api.get(`/users/chat/messages/${conv.id}`);
            const json = res.data;
            if (json.success) {
                setMessages(json.data);
            }
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setLoading(false);
        }
    };

    // 4. Send handler
    const handleSend = async () => {
        if ((!input.trim() && !file) || !activeConversationId || !company?.id || sending) return;

        const content = input.trim();
        const currentFile = file;

        setInput("");
        setFile(null);
        setSending(true);

        let mediaUrl = null;
        let mediaType = null;

        if (currentFile) {
            mediaType = currentFile.type.startsWith("image/") ? "image" : "pdf";
            mediaUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(currentFile);
            });
        }

        try {
            const res = await api.post("/users/chat/message", {
                conversationId: activeConversationId,
                senderId: company.id,
                senderType: "company",
                content,
                mediaUrl,
                mediaType
            });
            const json = res.data;
            if (json.success) {
                setMessages(prev => [...prev, json.data]);
            }
        } catch (err) {
            console.error("Failed to send:", err);
        } finally {
            setSending(false);
        }
    };

    // ✅ Filter logic
    const filteredChats = conversations
        .filter((conv) => {
            const other = conv.participants?.[0];
            if (!other) return false;
            const fullName = `${other.firstName} ${other.lastName}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });

    // ✅ Dropdown click handler
    const handleFilter = (type) => {
        setFilterType(type);
        setShowOptions(false);
    };

    // ✅ Close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown-container")) {
                setShowOptions(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div
            className="container-fluid py-4 px-5"
            style={{ backgroundColor: COLORS.background, minHeight: "100vh" }}
        >
            <div
                className="d-flex shadow"
                style={{
                    height: "90vh",
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: COLORS.card,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
            >
                {/* Sidebar */}
                <div
                    className="d-flex flex-column"
                    style={{
                        width: "28%",
                        backgroundColor: COLORS.sidebar,
                        borderRight: `1px solid ${COLORS.border}`,
                    }}
                >
                    {/* Header */}
                    <div
                        className="d-flex justify-content-between align-items-center p-3 border-bottom"
                        style={{ borderColor: COLORS.border }}
                    >
                        <h5 className="fw-semibold mb-0" style={{ color: COLORS.textDark }}>
                            Chats
                        </h5>

                        <div className="dropdown-container position-relative">
                            <BiDotsVertical
                                className="text-secondary fs-5"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowOptions((prev) => !prev);
                                }}
                            />
                            {showOptions && (
                                <div
                                    className="position-absolute end-0 mt-3 me-2 shadow-sm p-2 rounded-3 bg-white"
                                    style={{
                                        zIndex: 99,
                                        width: "220px",
                                        border: `1px solid ${COLORS.border}`,
                                    }}
                                >
                                    {[
                                        {
                                            icon: <BiBriefcase className="me-2 text-primary" />,
                                            label: "Jobs",
                                            type: "jobs",
                                        },
                                        {
                                            icon: <BiEnvelope className="me-2 text-info" />,
                                            label: "Unread Messages",
                                            type: "unread",
                                        },
                                        {
                                            icon: <BiUserCircle className="me-2 text-success" />,
                                            label: "My Connections",
                                            type: "connections",
                                        },
                                        {
                                            icon: <BiStar className="me-2 text-warning" />,
                                            label: "Starred Messages",
                                            type: "starred",
                                        },
                                        {
                                            icon: <BiArchive className="me-2 text-secondary" />,
                                            label: "Archived Chats",
                                            type: "archived",
                                        },
                                        {
                                            icon: <BiCog className="me-2 text-dark" />,
                                            label: "Settings (Coming Soon)",
                                            type: "all",
                                        },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="dropdown-item py-2 px-3 d-flex align-items-center text-muted"
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                                background:
                                                    filterType === item.type ? "#e9f5ff" : "transparent",
                                                fontWeight:
                                                    filterType === item.type ? "600" : "normal",
                                            }}
                                            onClick={() => handleFilter(item.type)}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background = "#f5f7fa")
                                            }
                                            onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                                filterType === item.type ? "#e9f5ff" : "transparent")
                                            }
                                        >
                                            {item.icon} {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-bottom" style={{ borderColor: COLORS.border }}>
                        <div
                            className="d-flex align-items-center px-3 py-2"
                            style={{
                                backgroundColor: COLORS.card,
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: "25px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                            }}
                        >
                            <BiSearch
                                style={{
                                    color: COLORS.accent,
                                    fontSize: "1.2rem",
                                    marginRight: "8px",
                                }}
                            />
                            <input
                                type="text"
                                className="form-control border-0 bg-transparent shadow-none"
                                placeholder="Search or start new chat"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    fontSize: "15px",
                                    color: COLORS.textDark,
                                }}
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-grow-1 overflow-auto">
                        {filteredChats.length > 0 ? (
                            filteredChats.map((conv) => {
                                const other = conv.participants?.[0];
                                const isSelected = activeConversationId === conv.id;
                                const name = other ? `${other.firstName} ${other.lastName}` : "Unknown User";
                                const avatar = (other && other.profileImg) || DEFAULT_AVATAR;

                                return (
                                    <div
                                        key={conv.id}
                                        className={`d-flex align-items-center p-3 border-bottom ${isSelected ? "bg-white shadow-sm" : ""}`}
                                        style={{
                                            cursor: "pointer",
                                            transition: "0.3s",
                                            borderLeft: isSelected ? `3px solid ${COLORS.accent}` : "3px solid transparent",
                                        }}
                                        onClick={() => handleSelectConversation(conv)}
                                    >
                                        <img
                                            src={avatar}
                                            alt="avatar"
                                            width="48"
                                            height="48"
                                            className="rounded-circle me-3"
                                            style={{ objectFit: "cover" }}
                                            onError={(e) => e.target.src = DEFAULT_AVATAR}
                                        />
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="fw-semibold mb-0" style={{ color: COLORS.textDark }}>
                                                    {name}
                                                </h6>
                                                <small className="text-muted">{formatTime(conv.updatedAt)}</small>
                                            </div>
                                            <small className="text-muted text-truncate d-block" style={{ maxWidth: "180px" }}>
                                                {conv.lastMessage || "Start a conversation"}
                                            </small>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-5 text-muted">No chats found</div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    className="flex-grow-1 d-flex flex-column position-relative"
                    style={{
                        backgroundColor: COLORS.background,
                        backgroundImage: !selectedContact ? "url('/ConnectiFy_logo.png')" : "none",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "260px",
                        transition: "0.3s ease",
                    }}
                >
                    {selectedContact ? (
                        <>
                            {/* Top Bar */}
                            <div
                                className="d-flex align-items-center justify-content-between border-bottom p-3"
                                style={{ borderColor: COLORS.border, backgroundColor: COLORS.card }}
                            >
                                <div className="d-flex align-items-center">
                                    <img
                                        src={selectedContact.avatar}
                                        alt="user"
                                        width="45"
                                        height="45"
                                        className="rounded-circle me-2"
                                        onError={(e) => e.target.src = DEFAULT_AVATAR}
                                    />
                                    <div>
                                        <h6 className="fw-semibold mb-0" style={{ color: COLORS.textDark }}>
                                            {selectedContact.name}
                                        </h6>
                                        <small className="text-success">
                                            {selectedContact.online ? "Online" : "Offline"}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div
                                className="flex-grow-1 d-flex flex-column p-3 overflow-auto"
                                ref={chatContainerRef}
                                style={{ backgroundColor: COLORS.background }}
                            >
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border spinner-border-sm text-primary" />
                                        <p className="text-muted mt-2">Loading messages...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <BiEnvelope size={40} className="mb-2 d-block mx-auto" />
                                        No messages yet. Say hello! 👋
                                    </div>
                                ) : (
                                    (() => {
                                        let lastDate = "";
                                        return messages.map((msg) => {
                                            const isMe = msg.senderId === company?.id;
                                            const msgDate = new Date(msg.createdAt).toLocaleDateString();
                                            const showDate = msgDate !== lastDate;
                                            lastDate = msgDate;

                                            return (
                                                <React.Fragment key={msg.id}>
                                                    {showDate && (
                                                        <div className="text-center mb-3">
                                                            <span
                                                                className="px-3 py-1 rounded-3"
                                                                style={{
                                                                    backgroundColor: "#e9ecef",
                                                                    fontSize: "13px",
                                                                    color: COLORS.textMuted,
                                                                }}
                                                            >
                                                                {msgDate === new Date().toLocaleDateString() ? "Today" : msgDate}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                                                        <div
                                                            className="p-2 px-3 rounded-3 position-relative"
                                                            style={{
                                                                backgroundColor: isMe ? COLORS.chatMe : COLORS.chatOther,
                                                                color: COLORS.textDark,
                                                                maxWidth: "70%",
                                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                            }}
                                                        >
                                                            {/* Attachment */}
                                                            {msg.mediaUrl && (
                                                                <div className="mb-2">
                                                                    {msg.mediaType === "image" ? (
                                                                        <img
                                                                            src={msg.mediaUrl}
                                                                            alt="Attachment"
                                                                            style={{ maxWidth: "100%", borderRadius: "8px", cursor: "pointer" }}
                                                                            onClick={() => window.open(msg.mediaUrl, "_blank")}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="d-flex align-items-center p-2 rounded bg-white border"
                                                                            style={{ cursor: "pointer" }}
                                                                            onClick={() => window.open(msg.mediaUrl, "_blank")}
                                                                        >
                                                                            <BiPaperclip className="me-2 text-primary" />
                                                                            <span className="text-primary text-truncate" style={{ fontSize: "14px" }}>
                                                                                PDF Document
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div style={{ fontSize: "15px", wordBreak: "break-word" }}>
                                                                {msg.content}
                                                            </div>
                                                            <div
                                                                className="d-flex align-items-center justify-content-end mt-1"
                                                                style={{ fontSize: "11px", color: "#6c757d", gap: "3px" }}
                                                            >
                                                                <span>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </span>
                                                                {isMe && (
                                                                    <span style={{ color: COLORS.accent, fontSize: "14px" }}>
                                                                        ✔✔
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        });
                                    })()
                                )}
                            </div>

                            {/* Input Section */}
                            <div
                                className="d-flex align-items-center p-3 border-top position-relative"
                                style={{
                                    borderColor: COLORS.border,
                                    backgroundColor: COLORS.card,
                                }}
                            >
                                <div className="position-relative">
                                    <BiSmile
                                        className="fs-5 text-muted me-3"
                                        role="button"
                                        onClick={() => setShowEmoji((prev) => !prev)}
                                    />
                                    {showEmoji && (
                                        <div
                                            className="position-absolute bg-white shadow-sm rounded-4 p-2 d-flex gap-2"
                                            style={{
                                                bottom: "120%",
                                                left: 0,
                                                border: `1px solid ${COLORS.border}`,
                                                zIndex: 99,
                                            }}
                                        >
                                            {emojis.map((emoji) => (
                                                <span
                                                    key={emoji}
                                                    role="button"
                                                    onClick={() => {
                                                        setInput((prev) => prev + emoji);
                                                        setShowEmoji(false);
                                                    }}
                                                    style={{
                                                        fontSize: "1.4rem",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {emoji}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <label htmlFor="file-upload">
                                    <BiPaperclip
                                        className="fs-5 text-muted me-3"
                                        role="button"
                                        style={{ cursor: "pointer" }}
                                    />
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*,.pdf"
                                    style={{ display: "none" }}
                                    onChange={(e) => setFile(e.target.files[0])}
                                />

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={file ? `📎 ${file.name}` : "Type a message..."}
                                    className="form-control"
                                    style={{
                                        borderRadius: "25px",
                                        borderColor: COLORS.border,
                                        padding: "10px 15px",
                                        fontSize: "15px",
                                        color: COLORS.textDark,
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />

                                <button
                                    onClick={handleSend}
                                    disabled={sending || (!input.trim() && !file)}
                                    className="ms-3 d-flex justify-content-center align-items-center"
                                    style={{
                                        background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.primary})`,
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "45px",
                                        height: "45px",
                                        boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)",
                                        transition: "0.3s ease",
                                        opacity: (sending || (!input.trim() && !file)) ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    <BiSend size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                            <BiEnvelope size={60} className="mb-3 opacity-25" />
                            <p>Select a message to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message;
