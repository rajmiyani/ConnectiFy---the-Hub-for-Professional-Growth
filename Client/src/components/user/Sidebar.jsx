import React from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaEnvelope, FaBriefcase, FaBookmark, FaMapMarkerAlt, FaRobot, FaCrown, FaCalendarAlt, FaRegFileAlt, FaPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const Sidebar = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({ connections: 0, profileViews: 0 });
  const [isStatsLoading, setIsStatsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      setIsStatsLoading(true);
      try {
        const res = await api.get(`/users/profile/${user.id}`);
        const data = res.data;
        if (data.success) {
          setStats({
            connections: data.data.connections || 0,
            profileViews: data.data.profileViews || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching sidebar stats:", error);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
  }, [user?.id]);

  // 🎨 Color Palette
  const COLORS = {
    primary: "#004E89",
    accent: "#0096C7",
    background: "#F4F7FB",
    card: "#FFFFFF",
    textDark: "#1E1E1E",
    border: "#E0E0E0",
  };

  return (
    <aside className="col-lg-12 mb-4">
      {/* Profile Card */}
      <div
        className="card shadow-sm border-0 text-center mb-4"
        style={{
          borderRadius: "18px",
          backgroundColor: COLORS.card,
          boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {/* Cover Banner with Dummy Image */}
        <div
          style={{
            height: "90px",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=60')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))",
            }}
          ></div>
        </div>

        {/* Profile Image */}
        <div className="mx-auto position-relative" style={{ marginTop: "-45px" }}>
          <img
            src={user?.profileImg || user?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
            alt="Profile"
            width="80"
            height="80"
            className="rounded-circle border border-3 border-white shadow-sm"
            style={{
              objectFit: "cover",
              backgroundColor: "#fff",
            }}
          />
        </div>

        {/* User Info */}
        <div className="card-body pb-3">
          <h6 className="fw-bold mb-0" style={{ color: COLORS.textDark }}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (user?.name || "User")}
          </h6>
          <small className="text-muted d-block mb-1">
            {user?.headline || "ConnectiFy User"}
          </small>
          <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>
            {user?.email || ""}
          </small>

          <div className="d-flex justify-content-center align-items-center text-muted">
            <FaMapMarkerAlt className="me-1" size={12} />
            <small>{user?.city ? `${user.city}, ${user.country || "India"}` : (user?.location || "India")}</small>
          </div>
        </div>

        {/* Divider */}
        <hr
          className="my-2"
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            margin: "0 25px",
          }}
        />

        {/* Stats Section */}
        <div className="px-3 pb-3">
          <div className="d-flex justify-content-between text-center">
            <div
              className="flex-fill"
              style={{
                borderRight: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="text-muted small">Profile Views</div>
              <div className="fw-bold" style={{ color: COLORS.accent }}>
                {isStatsLoading ? "..." : stats.profileViews}
              </div>
            </div>
            <div className="flex-fill">
              <div className="text-muted small">Connections</div>
              <div className="fw-bold" style={{ color: COLORS.accent }}>
                {isStatsLoading ? "..." : stats.connections}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Strip */}
        <div
          style={{
            height: "5px",
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px",
          }}
        ></div>
      </div>

      {/* Quick Links Card */}
      <div
        className="card shadow-sm p-3 border-0"
        style={{
          borderRadius: "16px",
          backgroundColor: COLORS.card,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h6 className="mb-3 fw-semibold" style={{ color: COLORS.textDark }}>
          Quick Links
        </h6>
        <div className="list-group list-group-flush">
          {[
            { to: "/user/mynetwork", icon: <FaUsers />, text: "My Network" },
            { to: "/user/messages", icon: <FaEnvelope />, text: "Messaging" },
            { to: "/user/jobs", icon: <FaBriefcase />, text: "Jobs" },
            { to: "/user/interviews", icon: <FaCalendarAlt />, text: "My Interviews" },
            { to: "/user/doubt-solver", icon: <FaRobot />, text: "AI Doubt Solver" },
            { to: "/user/daily-quiz", icon: <FaPlus />, text: "Daily Quiz" },
            { to: "/user/saved-items", icon: <FaBookmark />, text: "Saved Items" },
            { to: "/user/resume-templates", icon: <FaRegFileAlt />, text: "Resume Templates" },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="list-group-item list-group-item-action d-flex align-items-center gap-2 border-0 py-2 px-2"
              style={{
                borderRadius: "10px",
                color: COLORS.textDark,
                backgroundColor: "transparent",
                transition: "0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.background;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ color: COLORS.primary, fontSize: "1.1rem" }}>
                {item.icon}
              </span>
              <span className="fw-medium">{item.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
