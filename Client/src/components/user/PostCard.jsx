"use client";
import React, { useState } from "react";
import {
    FaImage,
    FaVideo,
    FaPenNib,
    FaCalendarAlt,
    FaBriefcase,
} from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const PostCard = ({ onPostCreated }) => {
    const { user } = useAuth();
    const COLORS = {
        primary: "#004E89",
        accent: "#0096C7",
        background: "#F4F7FB",
        card: "#FFFFFF",
        text: "#1E1E1E",
        border: "#E0E0E0",
    };

    const postOptions = [
        { icon: <FaImage color={COLORS.accent} />, label: "Add Photo" },
        { icon: <FaVideo color={COLORS.accent} />, label: "Add Video" },
        { icon: <FaPenNib color={COLORS.accent} />, label: "Write Article" },
        { icon: <FaCalendarAlt color={COLORS.accent} />, label: "Add Event" },
    ];

    const [showPostModal, setShowPostModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [mediaType, setMediaType] = useState("text"); // text, image, video, article
    const [mediaUrls, setMediaUrls] = useState([]);
    const [articleData, setArticleData] = useState({ title: "", content: "" });
    const [eventData, setEventData] = useState({ title: "", description: "", date: "", location: "" });
    const [isPosting, setIsPosting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaUrls([reader.result]);
                setShowUploadModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePost = async (type = "post") => {
        setIsPosting(true);
        try {
            let res;
            const body = { userId: user?.id };

            if (type === "post") {
                const postBody = { ...body, content: postContent, mediaType, mediaUrls };
                res = await api.post("/users/posts", postBody);
            } else if (type === "article") {
                const articleBody = { ...body, title: articleData.title, articleContent: articleData.content, mediaType: "article" };
                res = await api.post("/users/posts", articleBody);
            } else if (type === "event") {
                const eventBody = { ...body, ...eventData };
                res = await api.post("/users/posts/events", eventBody);
            }

            if (res.data.success) {
                setShowPostModal(false);
                setShowArticleModal(false);
                setShowEventModal(false);
                setPostContent("");
                setMediaUrls([]);
                setArticleData({ title: "", content: "" });
                setEventData({ title: "", description: "", date: "", location: "" });
                if (onPostCreated) onPostCreated();
            }
        } catch (error) {
            console.error("Error posting:", error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <>
            {/* Main Post Card */}
            <div
                className="card shadow-sm mb-4 border-0"
                style={{
                    borderRadius: "20px",
                    backgroundColor: COLORS.card,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
            >
                <div className="card-body">
                    {/* Post input */}
                    <textarea
                        className="form-control mb-3"
                        placeholder="What's on your mind?"
                        rows="3"
                        readOnly
                        onClick={() => setShowPostModal(true)}
                        style={{
                            borderRadius: "15px",
                            backgroundColor: COLORS.background,
                            border: `1px solid ${COLORS.border}`,
                            color: COLORS.text,
                            cursor: "pointer",
                        }}
                    ></textarea>

                    {/* Post options */}
                    <div
                        className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3"
                        style={{
                            borderTop: `1px solid ${COLORS.border}`,
                            paddingTop: "10px",
                        }}
                    >
                        <button className="btn d-flex align-items-center gap-2"
                            style={{ border: "none", background: "transparent", color: COLORS.text, fontWeight: 500 }}
                            onClick={() => { setMediaType("image"); setShowUploadModal(true); }}>
                            <FaImage color={COLORS.accent} /> Add Photo
                        </button>
                        <button className="btn d-flex align-items-center gap-2"
                            style={{ border: "none", background: "transparent", color: COLORS.text, fontWeight: 500 }}
                            onClick={() => { setMediaType("video"); setShowUploadModal(true); }}>
                            <FaVideo color={COLORS.accent} /> Add Video
                        </button>
                        <button className="btn d-flex align-items-center gap-2"
                            style={{ border: "none", background: "transparent", color: COLORS.text, fontWeight: 500 }}
                            onClick={() => setShowArticleModal(true)}>
                            <FaPenNib color={COLORS.accent} /> Write Article
                        </button>
                        <button className="btn d-flex align-items-center gap-2"
                            style={{ border: "none", background: "transparent", color: COLORS.text, fontWeight: 500 }}
                            onClick={() => setShowEventModal(true)}>
                            <FaCalendarAlt color={COLORS.accent} /> Add Event
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <Modal show={showPostModal} onHide={() => setShowPostModal(false)} size="xl" centered backdrop="static">
                <Modal.Header closeButton style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "1rem 2rem" }}>
                    <Modal.Title style={{ fontWeight: "600", color: COLORS.text, fontSize: "1.3rem" }}>Create a Post</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: "1.5rem 2rem", backgroundColor: COLORS.card }}>
                    {/* Profile Info */}
                    <div className="d-flex align-items-center mb-3">
                        <img
                            src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                            alt="profile"
                            style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${COLORS.border}` }}
                        />
                        <div className="ms-3">
                            <h6 className="mb-0" style={{ color: COLORS.text, fontWeight: 600, fontSize: "1rem" }}>{user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (user?.name || "Member")}</h6>
                            <select className="form-select form-select-sm mt-1" style={{ width: "140px", borderRadius: "20px", border: `1px solid ${COLORS.border}`, color: COLORS.accent, fontWeight: 500 }}>
                                <option>Anyone</option>
                                <option>Connections only</option>
                                <option>Only me</option>
                            </select>
                        </div>
                    </div>

                    <textarea
                        className="form-control"
                        placeholder="What do you want to talk about?"
                        rows="6"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        style={{ borderRadius: "12px", backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: "1rem", padding: "1rem", resize: "none", boxShadow: "none" }}
                    ></textarea>

                    {mediaUrls.length > 0 && (
                        <div className="mt-3">
                            {mediaType === "image" ? (
                                <img src={mediaUrls[0]} style={{ maxWidth: "100%", borderRadius: "12px" }} alt="preview" />
                            ) : (
                                <video src={mediaUrls[0]} controls style={{ maxWidth: "100%", borderRadius: "12px" }} />
                            )}
                            <button className="btn btn-sm btn-danger mt-2" onClick={() => setMediaUrls([])}>Remove</button>
                        </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center flex-wrap mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                        <div className="d-flex align-items-center gap-4 flex-wrap">
                            <button className="btn d-flex align-items-center gap-2" style={{ background: "transparent", border: "none", color: COLORS.text, fontWeight: 500 }} onClick={() => { setMediaType("image"); setShowUploadModal(true); }}>
                                <FaImage size={18} color={COLORS.accent} /> Photo
                            </button>
                            <button className="btn d-flex align-items-center gap-2" style={{ background: "transparent", border: "none", color: COLORS.text, fontWeight: 500 }} onClick={() => { setMediaType("video"); setShowUploadModal(true); }}>
                                <FaVideo size={18} color={COLORS.accent} /> Video
                            </button>
                        </div>
                        <button
                            className="btn fw-semibold"
                            disabled={isPosting || (!postContent.trim() && mediaUrls.length === 0)}
                            onClick={() => handlePost("post")}
                            style={{ backgroundColor: COLORS.accent, color: "#fff", border: "none", borderRadius: "25px", padding: "8px 24px", transition: "0.3s" }}
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Write Article Modal */}
            <Modal show={showArticleModal} onHide={() => setShowArticleModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Write an Article</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <input
                        type="text"
                        className="form-control mb-3 border-0 bg-light fs-4 fw-bold"
                        placeholder="Article Title"
                        value={articleData.title}
                        onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                        style={{ borderRadius: "10px" }}
                    />
                    <textarea
                        className="form-control border-0 bg-light"
                        placeholder="Write your article here..."
                        rows="12"
                        value={articleData.content}
                        onChange={(e) => setArticleData({ ...articleData, content: e.target.value })}
                        style={{ borderRadius: "12px", resize: "none" }}
                    ></textarea>
                    <div className="text-end mt-4">
                        <Button
                            disabled={isPosting || !articleData.title.trim() || !articleData.content.trim()}
                            onClick={() => handlePost("article")}
                            style={{ backgroundColor: COLORS.accent, border: "none", borderRadius: "20px", padding: "8px 30px" }}
                        >
                            Publish Article
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Add Event Modal */}
            <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create an Event</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Event Title</label>
                        <input
                            type="text"
                            className="form-control"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Date & Time</label>
                        <input
                            type="datetime-local"
                            className="form-control"
                            value={eventData.date}
                            onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Location</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Online or physical location"
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Description</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        ></textarea>
                    </div>
                    <Button
                        className="w-100"
                        disabled={isPosting || !eventData.title.trim() || !eventData.date}
                        onClick={() => handlePost("event")}
                        style={{ backgroundColor: COLORS.accent, border: "none", borderRadius: "20px" }}
                    >
                        Create Event
                    </Button>
                </Modal.Body>
            </Modal>

            {/* Upload Modal */}
            <Modal
                show={showUploadModal}
                onHide={() => setShowUploadModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Upload {mediaType}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-5">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/685/685686.png"
                        alt="upload"
                        style={{ width: "80px", marginBottom: "15px", opacity: 0.8 }}
                    />
                    <h6 className="mb-2" style={{ color: COLORS.text }}>
                        Select {mediaType} to begin
                    </h6>
                    <input
                        type="file"
                        accept={mediaType === "image" ? "image/*" : "video/*"}
                        id="mediaUpload"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <Button
                        onClick={() => document.getElementById("mediaUpload").click()}
                        style={{
                            backgroundColor: COLORS.accent,
                            border: "none",
                            borderRadius: "20px",
                            padding: "8px 20px",
                        }}
                    >
                        Select from computer
                    </Button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default PostCard;
