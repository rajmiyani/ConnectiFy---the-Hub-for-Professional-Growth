import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
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

const Message = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [filterType, setFilterType] = useState("all");
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);

    // Real data
    const [connections, setConnections] = useState([]);  // accepted connections
    const [conversations, setConversations] = useState({}); // keyed by contactId
    const [selectedContact, setSelectedContact] = useState(null); // { id, name, avatar, headline }
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const chatContainerRef = useRef(null);
    const emojis = ["😊", "❤️", "😂", "👍", "🥰", "😎"];

    // ────────────────────────────────────────────────────────────────
    // 1. Fetch accepted connections on mount
    // ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        const fetchConnections = async () => {
            try {
                const res = await api.get(`/users/network/accepted/${user.id}`);
                const json = res.data;
                if (json.success) {
                    setConnections(json.data);
                }
            } catch (err) {
                console.error("Failed to load connections:", err);
            }
        };

        fetchConnections();
    }, [user?.id]);

    // ────────────────────────────────────────────────────────────────
    // 2. Fetch existing conversations (to show last message preview)
    // ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        const fetchConversations = async () => {
            try {
                const res = await api.get(`/users/chat/conversations/${user.id}`);
                const json = res.data;
                if (json.success) {
                    const convMap = {};
                    json.data.forEach((conv) => {
                        // Find the other participant (not me)
                        // It could be a User or a Company
                        const otherUser = conv.participants?.find((p) => p.id !== user.id);
                        const otherCompany = conv.companies?.find((c) => c.id !== user.id);

                        const other = otherUser || otherCompany;
                        if (other) {
                            convMap[other.id] = {
                                conversationId: conv.id,
                                lastMessage: conv.lastMessage || "",
                                updatedAt: conv.updatedAt,
                                type: otherUser ? "user" : "company",
                                name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : (otherCompany ? otherCompany.companyName : "Unknown"),
                                profileImg: other.profileImg
                            };
                        }
                    });
                    setConversations(convMap);
                }
            } catch (err) {
                console.error("Failed to load conversations:", err);
            }
        };

        fetchConversations();
    }, [user?.id]);

    // ────────────────────────────────────────────────────────────────
    // 2.5 Handle navigation state (Auto-select contact)
    // ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (location.state?.contact && user?.id) {
            const contact = location.state.contact;
            handleSelectContact({
                id: contact.id,
                name: contact.name,
                avatar: contact.avatar,
                headline: contact.headline || "Company Recruiter",
                contactType: contact.contactType || "user"
            });
        }
    }, [location.state, user?.id]);

    // ────────────────────────────────────────────────────────────────
    // 3. Auto-scroll to bottom
    // ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // ────────────────────────────────────────────────────────────────
    // 4. Socket — listen for incoming messages
    // ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !activeConversationId) return;

        // Join the socket room for this conversation
        socket.emit("joinRoom", activeConversationId);

        const handleNewMessage = (msg) => {
            if (msg.conversationId === activeConversationId) {
                setMessages((prev) => [...prev, msg]);
                // Update preview
                setConversations((prev) => ({
                    ...prev,
                    [selectedContact?.id]: {
                        ...prev[selectedContact?.id],
                        lastMessage: msg.content,
                        updatedAt: msg.createdAt,
                    },
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, activeConversationId, selectedContact?.id]);

    // ────────────────────────────────────────────────────────────────
    // 5. Select a contact → get/create conversation → load messages
    // ────────────────────────────────────────────────────────────────
    const handleSelectContact = useCallback(async (contact) => {
        if (!user?.id || selectedContact?.id === contact.id) return;

        setSelectedContact(contact);
        setMessages([]);
        setLoading(true);

        try {
            // Get or create conversation
            const convRes = await api.post("/users/chat/conversation", {
                senderId: user.id,
                senderType: "user",
                receiverId: contact.id,
                receiverType: contact.contactType || "user",
            });
            const convJson = convRes.data;
            if (!convJson.success) throw new Error("Conversation creation failed");

            const convId = convJson.data.id;
            setActiveConversationId(convId);

            // Update conversations preview map
            setConversations((prev) => ({
                ...prev,
                [contact.id]: {
                    ...prev[contact.id],
                    conversationId: convId,
                },
            }));

            // Load messages
            const msgRes = await api.get(`/users/chat/messages/${convId}`);
            const msgJson = msgRes.data;
            if (msgJson.success) {
                setMessages(msgJson.data);
            }
        } catch (err) {
            console.error("Failed to open conversation:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, selectedContact?.id]);

    // ────────────────────────────────────────────────────────────────
    // 6. Send message
    // ────────────────────────────────────────────────────────────────
    const handleSend = async () => {
        if ((!input.trim() && !file) || !activeConversationId || !user?.id || sending) return;

        const content = input.trim();
        const currentFile = file;

        setInput("");
        setFile(null);
        setSending(true);

        let mediaUrl = null;
        let mediaType = null;

        if (currentFile) {
            mediaType = currentFile.type.startsWith("image/") ? "image" : "pdf";
            // Convert to base64 for demo purposes
            mediaUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(currentFile);
            });
        }

        // Optimistic UI
        const optimisticMsg = {
            id: `temp-${Date.now()}`,
            conversationId: activeConversationId,
            senderId: user.id,
            senderType: "user",
            senderUserId: user.id,
            senderCompanyId: null,
            content,
            mediaUrl,
            mediaType,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            const res = await api.post("/users/chat/message", {
                conversationId: activeConversationId,
                senderId: user.id,
                senderType: "user",
                content,
                mediaUrl,
                mediaType
            });
            const json = res.data;
            if (json.success) {
                // Replace optimistic message with real one
                setMessages((prev) =>
                    prev.map((m) => (m.id === optimisticMsg.id ? json.data : m))
                );
                // Update preview
                setConversations((prev) => ({
                    ...prev,
                    [selectedContact?.id]: {
                        ...prev[selectedContact?.id],
                        lastMessage: content || (mediaType === "image" ? "📷 Photo" : "📄 PDF Document"),
                        updatedAt: json.data.createdAt,
                    },
                }));
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            // Rollback optimistic
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        } finally {
            setSending(false);
        }
    };

    // ────────────────────────────────────────────────────────────────
    // 7. Filter connections for sidebar
    // ────────────────────────────────────────────────────────────────
    const filteredContacts = connections.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-container")) setShowOptions(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // ────────────────────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────────────────────
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
                {/* ══════════════════ SIDEBAR ══════════════════ */}
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
                                        { icon: <BiUserCircle className="me-2 text-success" />, label: "All Connections", type: "all" },
                                        { icon: <BiBriefcase className="me-2 text-primary" />, label: "Jobs (Coming Soon)", type: "all" },
                                        { icon: <BiEnvelope className="me-2 text-info" />, label: "Inbox (Coming Soon)", type: "all" },
                                        { icon: <BiStar className="me-2 text-warning" />, label: "Starred (Coming Soon)", type: "all" },
                                        { icon: <BiArchive className="me-2 text-secondary" />, label: "Archived (Coming Soon)", type: "all" },
                                        { icon: <BiCog className="me-2 text-dark" />, label: "Settings (Coming Soon)", type: "all" },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="dropdown-item py-2 px-3 d-flex align-items-center text-muted"
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                                background: filterType === item.type ? "#e9f5ff" : "transparent",
                                                fontWeight: filterType === item.type ? "600" : "normal",
                                            }}
                                            onClick={() => { setFilterType(item.type); setShowOptions(false); }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f7fa")}
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
                                style={{ color: COLORS.accent, fontSize: "1.2rem", marginRight: "8px" }}
                            />
                            <input
                                type="text"
                                className="form-control border-0 bg-transparent shadow-none"
                                placeholder="Search connections…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: "15px", color: COLORS.textDark }}
                            />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-grow-1 overflow-auto">
                        {/* Merge filteredContacts and existing conversations with companies */}
                        {(() => {
                            // Map contacts for consistent UI
                            const contactsList = filteredContacts.map(c => ({
                                id: c.id,
                                name: `${c.firstName} ${c.lastName}`,
                                avatar: c.profileImg || DEFAULT_AVATAR,
                                headline: c.headline,
                                contactType: "user"
                            }));

                            // Add companies from existing conversations that aren't in contactsList
                            Object.keys(conversations).forEach(contactId => {
                                if (conversations[contactId].type === "company") {
                                    contactsList.push({
                                        id: contactId,
                                        name: conversations[contactId].name,
                                        avatar: conversations[contactId].profileImg || DEFAULT_AVATAR,
                                        headline: "Company",
                                        contactType: "company"
                                    });
                                }
                            });

                            if (contactsList.length === 0) {
                                return <div className="text-center py-5 text-muted">No contacts found</div>;
                            }

                            return contactsList.map((contact) => {
                                const preview = conversations[contact.id];
                                const isSelected = selectedContact?.id === contact.id;
                                const { name, avatar, headline } = contact;

                                return (
                                    <div
                                        key={contact.id}
                                        className="d-flex align-items-center p-3 border-bottom"
                                        style={{
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                            background: isSelected ? "#ffffff" : "transparent",
                                            borderLeft: isSelected
                                                ? `3px solid ${COLORS.accent}`
                                                : "3px solid transparent",
                                        }}
                                        onClick={() =>
                                            handleSelectContact(contact)
                                        }
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = "#edf2fb";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                            <img
                                                src={avatar}
                                                alt={name}
                                                width="46"
                                                height="46"
                                                className="rounded-circle me-3"
                                                style={{ objectFit: "cover" }}
                                                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6
                                                    className="mb-0 text-truncate"
                                                    style={{ fontWeight: 600, color: COLORS.textDark }}
                                                >
                                                    {name}
                                                </h6>
                                                {preview?.updatedAt && (
                                                    <small className="text-muted ms-1" style={{ whiteSpace: "nowrap" }}>
                                                        {formatTime(preview.updatedAt)}
                                                    </small>
                                                )}
                                            </div>
                                            <small
                                                className="text-truncate d-block"
                                                style={{ color: COLORS.textMuted, fontSize: "13px" }}
                                            >
                                                {preview?.lastMessage || headline || "Start a conversation"}
                                            </small>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* ══════════════════ CHAT AREA ══════════════════ */}
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
                                        alt={selectedContact.name}
                                        width="44"
                                        height="44"
                                        className="rounded-circle me-2"
                                        style={{ objectFit: "cover" }}
                                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                    />
                                    <div>
                                        <h6 className="fw-semibold mb-0" style={{ color: COLORS.textDark }}>
                                            {selectedContact.name}
                                        </h6>
                                        {selectedContact.headline && (
                                            <small className="text-muted">{selectedContact.headline}</small>
                                        )}
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
                                    <div className="text-center py-5 text-muted">
                                        <div className="spinner-border spinner-border-sm me-2" />
                                        Loading messages…
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
                                            const isMe = msg.senderUserId === user?.id || msg.senderId === user?.id;
                                            const msgDate = new Date(msg.createdAt).toLocaleDateString();
                                            const showDate = msgDate !== lastDate;
                                            lastDate = msgDate;

                                            return (
                                                <React.Fragment key={msg.id}>
                                                    {/* Date separator */}
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

                                                    {/* Bubble */}
                                                    <div
                                                        className={`d-flex mb-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                                                    >
                                                        <div
                                                            className="p-2 px-3 rounded-3 position-relative"
                                                            style={{
                                                                backgroundColor: isMe ? COLORS.chatMe : COLORS.chatOther,
                                                                color: COLORS.textDark,
                                                                maxWidth: "70%",
                                                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                                                opacity: msg._optimistic ? 0.7 : 1,
                                                            }}
                                                        >
                                                            {/* Media Attachment Rendering */}
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
                                                                        {msg._optimistic ? "✔" : "✔✔"}
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
                                style={{ borderColor: COLORS.border, backgroundColor: COLORS.card }}
                            >
                                {/* Emoji picker */}
                                <div className="position-relative">
                                    <BiSmile
                                        className="fs-5 text-muted me-3"
                                        role="button"
                                        style={{ cursor: "pointer" }}
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
                                                    style={{ fontSize: "1.4rem", cursor: "pointer" }}
                                                    onClick={() => {
                                                        setInput((prev) => prev + emoji);
                                                        setShowEmoji(false);
                                                    }}
                                                >
                                                    {emoji}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* File upload (UI only — attachment sending not hooked to API in this build) */}
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
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    style={{ display: "none" }}
                                    onChange={(e) => setFile(e.target.files[0])}
                                />

                                {/* Text input */}
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={file ? `📎 ${file.name}` : "Type a message…"}
                                    className="form-control"
                                    style={{
                                        borderRadius: "25px",
                                        borderColor: COLORS.border,
                                        padding: "10px 15px",
                                        fontSize: "15px",
                                        color: COLORS.textDark,
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    disabled={sending}
                                />

                                {/* Send button */}
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
                                        opacity: sending || (!input.trim() && !file) ? 0.6 : 1,
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!sending) e.currentTarget.style.transform = "scale(1.1)";
                                    }}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    <BiSend size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        // Empty state — logo shown via background image
                        <div
                            className="d-flex flex-column align-items-center justify-content-end h-100 pb-5"
                            style={{ color: COLORS.textMuted }}
                        >
                            <p className="mt-auto mb-4 text-muted" style={{ fontSize: "15px" }}>
                                Select a connection to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message;
