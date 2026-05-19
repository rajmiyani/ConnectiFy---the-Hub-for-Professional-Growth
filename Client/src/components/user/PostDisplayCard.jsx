import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import {
  FaEllipsisV,
  FaThumbsUp,
  FaRegCommentDots,
  FaShareAlt,
  FaTimes,
  FaPaperPlane,
  FaBookmark,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

import { useToast } from "../../context/ToastContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../utils/api";

const COLORS = {
  primary: "#004E89",
  accent: "#0096C7",
  success: "#28a745",
  info: "#17a2b8",
  warning: "#ffc107",
  danger: "#dc3545"
};

const PostDisplayCard = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const socket = useSocket();
  const [isLoading, setIsLoading] = React.useState(false);

  // No more hardcoded user ID

  const [posts, setPosts] = useState([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const [postComments, setPostComments] = useState({}); // { postId: comments[] }
  const [loadingComments, setLoadingComments] = useState({});

  React.useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/users/posts");
        const data = response.data;
        if (data.success) {
          const postsWithInteractions = data.data.map((post) => ({
            ...post,
            liked: post.likes?.some(l => l.userId === user?.id) ?? false,
            saved: post.savedBy?.some(s => s.userId === user?.id) ?? false,
            likesCount: post._count?.likes ?? post.likes?.length ?? 0,
            commentsCount: post._count?.comments ?? post.comments?.length ?? 0,
            sharesCount: post.sharesCount ?? 0,
          }));
          setPosts(postsWithInteractions);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchPosts();
  }, [user?.id, refreshTrigger]);

  // Socket Listener for Real-time posts
  React.useEffect(() => {
    if (!socket) return;

    socket.on("newPost", (newPost) => {
      setPosts((prev) => {
        if (prev.find((p) => p.id === newPost.id)) return prev;

        const postWithInteractions = {
          ...newPost,
          liked: newPost.likes?.some(l => l.userId === user?.id) ?? false,
          saved: newPost.savedBy?.some(s => s.userId === user?.id) ?? false,
          likesCount: newPost._count?.likes ?? newPost.likes?.length ?? 0,
          commentsCount: newPost._count?.comments ?? newPost.comments?.length ?? 0,
          sharesCount: newPost.sharesCount ?? 0,
        };
        return [postWithInteractions, ...prev];
      });
    });

    return () => socket.off("newPost");
  }, [socket, user?.id]);

  // 🔹 Profile click logic (MERGED)
  const handleProfileClick = (post) => {
    if (post.type === "company") {
      navigate(`/user/company/${encodeURIComponent(post.companyId || "tech-innovations")}`);
      return;
    }

    if (post.type === "user") {
      if (post.userId === user?.id) {
        navigate("/user/profile");
      } else {
        navigate(`/user/profile/${encodeURIComponent(post.userName)}`);
      }
    }
  };

  // 🔹 Fetch comments for a post
  const fetchComments = async (postId) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.get(`/users/interaction/comments/${postId}`);
      const data = res.data;
      if (data.success) {
        setPostComments(prev => ({ ...prev, [postId]: data.data }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // 🔹 Toggle comment box and fetch comments
  const handleCommentToggle = (postId) => {
    if (showCommentBox === postId) {
      setShowCommentBox(null);
    } else {
      setShowCommentBox(postId);
      if (!postComments[postId]) {
        fetchComments(postId);
      }
    }
  };

  // 🔹 Submit comment
  const handleCommentSubmit = async (e, postId) => {
    if (e) e.preventDefault();
    if (!comment.trim() || !user?.id) return;

    try {
      const res = await api.post("/users/interaction/comment", { postId, userId: user.id, content: comment });
      const data = res.data;
      if (data.success) {
        showToast("✅ Comment posted successfully!", "success");
        setComment("");
        // Update local counts in posts list
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
        // Add new comment to local comments list if it's already fetched
        if (postComments[postId]) {
          setPostComments(prev => ({
            ...prev,
            [postId]: [data.data, ...prev[postId]]
          }));
        } else {
          fetchComments(postId);
        }
      }
    } catch (error) {
      showToast("❌ Failed to post comment", "error");
    }
  };

  const handleLike = async (postId) => {
    if (!user?.id) return;
    try {
      const res = await api.post("/users/interaction/like", { postId, userId: user.id });
      const data = res.data;
      if (data.success) {
        setPosts(prev => prev.map(p =>
          p.id === postId ? {
            ...p,
            liked: data.liked,
            likesCount: data.liked ? p.likesCount + 1 : p.likesCount - 1
          } : p
        ));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSave = async (postId) => {
    if (!user?.id) return;
    try {
      const res = await api.post("/users/interaction/save-post", { postId, userId: user.id });
      const data = res.data;
      if (data.success) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: data.saved } : p));
        showToast(data.saved ? "💾 Post saved!" : "🗑️ Removed from saved", "info");
      }
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  // 🔹 Delete post (only own post)
  const handleDeletePost = async (postId) => {
    if (!user?.id) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await api.delete(`/users/posts/${postId}`, { data: { userId: user.id } });
      const data = res.data;
      if (data.success) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        showToast("🗑️ Post deleted successfully!", "success");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("❌ Failed to delete post", "error");
    }
  };

  // 🔹 Copy Link functionality
  const handleCopyLink = (postId) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast("🔗 Link copied to clipboard!", "success");
    });
  };

  // 🔹 Not interested (local hide)
  const handleNotInterested = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast("❌ Post hidden from feed", "info");
  };

  return (
    <>
      {isLoading ? (
        [1, 2].map(i => (
          <div key={i} className="card shadow-sm mb-4 border-0" style={{ borderRadius: "20px" }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="skeleton skeleton-circle" style={{ width: 55, height: 55 }}></div>
                <div className="ms-3 flex-grow-1">
                  <div className="skeleton skeleton-title mb-1" style={{ width: "40%" }}></div>
                  <div className="skeleton skeleton-text" style={{ width: "25%", height: "10px" }}></div>
                </div>
              </div>
              <div className="skeleton skeleton-text" style={{ width: "100%" }}></div>
              <div className="skeleton skeleton-text" style={{ width: "90%" }}></div>
              <div className="skeleton skeleton-rect mt-3" style={{ height: "250px" }}></div>
              <div className="d-flex justify-content-between mt-4 border-top pt-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className="skeleton" style={{ width: "60px", height: "20px" }}></div>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="card shadow-sm mb-4 position-relative border-0"
            style={{ borderRadius: "20px" }}
          >
            {/* HEADER CONTROLS */}
            <div
              className="position-absolute d-flex align-items-center"
              style={{ top: 12, right: 12, gap: 8 }}
            >
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  className="border-0 bg-transparent p-2 rounded-circle"
                >
                  <FaEllipsisV className="text-secondary fs-5" />
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm rounded-4 border-0 py-2">
                  <Dropdown.Item onClick={() => handleSave(post.id)} className="py-2 px-3">
                    <span className="me-2">{post.saved ? "🔖" : "💾"}</span>
                    {post.saved ? "Unsave Post" : "Save Post"}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleCopyLink(post.id)} className="py-2 px-3">
                    <span className="me-2">🔗</span> Copy Link to Post
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleNotInterested(post.id)} className="py-2 px-3">
                    <span className="me-2">❌</span> Not Interested
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => showToast("🔔 Notifications enabled", "success")} className="py-2 px-3">
                    <span className="me-2">🔔</span> Turn on Notifications
                  </Dropdown.Item>
                  {post.userId === user?.id && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => handleDeletePost(post.id)} className="py-2 px-3 text-danger">
                        <span className="me-2">🗑️</span> Delete Post
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* CARD BODY */}
            <div className="card-body mt-2">
              {/* USER / COMPANY INFO */}
              <div
                className="d-flex align-items-center mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => handleProfileClick(post)}
              >
                <img
                  src={post.user?.profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.firstName || "User"}`}
                  alt="avatar"
                  className="rounded-circle me-3 border"
                  width="55"
                  height="55"
                />
                <div>
                  <h6 className="mb-0 fw-bold hover-underline">
                    {post.user?.firstName} {post.user?.lastName}
                  </h6>
                  <small className="text-muted">
                    {post.user?.headline || "ConnectiFy User"} • {new Date(post.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>

              {/* CONTENT */}
              <p>{post.content}</p>

              {/* MEDIA */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                post.mediaType === "video" ? (
                  <video src={post.mediaUrls[0]} controls className="img-fluid rounded mb-3" />
                ) : (
                  <img
                    src={post.mediaUrls[0]}
                    alt="post"
                    className="img-fluid rounded mb-3"
                  />
                )
              )}

              {/* ACTIONS */}
              <div className="d-flex justify-content-between border-top pt-3 flex-wrap">
                <button
                  className="btn bg-transparent border-0 d-flex align-items-center"
                  onClick={() => handleLike(post.id)}
                  style={{ color: post.liked ? COLORS.primary : "inherit" }}
                >
                  <FaThumbsUp className="me-2" /> {post.likesCount > 0 && post.likesCount} Like
                </button>
                <button
                  className="btn bg-transparent border-0 d-flex align-items-center"
                  onClick={() => handleCommentToggle(post.id)}
                >
                  <FaRegCommentDots className="text-success me-2" /> {post.commentsCount > 0 && post.commentsCount} Comment
                </button>
                <button
                  className="btn bg-transparent border-0 d-flex align-items-center"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'ConnectiFy Post', text: post.content, url: window.location.href });
                    } else {
                      showToast("🔗 Link copied to clipboard!", "success");
                    }
                  }}
                >
                  <FaShareAlt className="text-warning me-2" /> Share
                </button>
                <button className="btn bg-transparent border-0 d-flex align-items-center" onClick={() => showToast("🚀 Feature coming soon!", "info")}>
                  <FaPaperPlane className="text-info me-2" /> Send
                </button>
                <button
                  className="btn bg-transparent border-0 d-flex align-items-center"
                  onClick={() => handleSave(post.id)}
                  style={{ color: post.saved ? "red" : "inherit" }}
                >
                  <FaBookmark className="me-2" /> Save
                </button>
              </div>

              {/* COMMENT BOX */}
              {showCommentBox === post.id && (
                <div className="mt-3 border-top pt-3">
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="d-flex gap-2 mb-3">
                    <img
                      src={user?.profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || "User"}`}
                      alt="avatar"
                      className="rounded-circle border"
                      width="35"
                      height="35"
                    />
                    <div className="flex-grow-1 position-relative">
                      <input
                        className="form-control rounded-pill pe-5 shadow-none border-light bg-light"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        autoFocus
                        style={{ fontSize: '14px' }}
                      />
                      <button
                        type="submit"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-primary p-0 pe-3"
                        style={{ textDecoration: 'none' }}
                        disabled={!comment.trim()}
                      >
                        <FaPaperPlane size={14} />
                      </button>
                    </div>
                  </form>

                  {/* COMMENTS LIST */}
                  <div className="comments-list mt-2" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                    {loadingComments[post.id] ? (
                      <div className="text-center py-2">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                        <span className="ms-2 small text-muted">Loading comments...</span>
                      </div>
                    ) : postComments[post.id]?.length > 0 ? (
                      postComments[post.id].map((c) => (
                        <div key={c.id} className="d-flex mb-3 gap-2">
                          <img
                            src={c.user?.profileImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.firstName || "User"}`}
                            alt="avatar"
                            className="rounded-circle border align-self-start mt-1"
                            width="32"
                            height="32"
                          />
                          <div className="p-2 px-3 rounded-4 flex-grow-1" style={{ background: '#F0F2F5' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0 fw-bold" style={{ fontSize: '13px' }}>
                                {c.user?.firstName} {c.user?.lastName}
                              </h6>
                              <small className="text-muted" style={{ fontSize: '11px' }}>
                                {new Date(c.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                            <p className="mb-0 mt-1" style={{ fontSize: '13px', color: '#1c1e21' }}>{c.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3">
                        <FaRegCommentDots className="text-light fs-2 mb-2" />
                        <p className="small text-muted mb-0">No comments yet. Be the first to start the conversation!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      <style>
        {`
          .hover-underline:hover {
            text-decoration: underline;
            color: #0073b1;
          }
        `}
      </style>
    </>
  );
};

export default PostDisplayCard;
