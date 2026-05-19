import Header from "../components/user/Header";
import { Outlet, Link } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import "./UserLayout.css";

export default function UserLayout() {
  return (
    <>
      <Header />
      <Outlet />

      {/* FLOATING ACTION BUTTON - AI MOCK INTERVIEW */}
      <Link
        to="/user/mock-interview"
        className="d-flex align-items-center justify-content-center shadow-lg position-fixed bottom-0 end-0 m-4 p-0 text-white transition-all floating-ai-btn"
        style={{
          width: "60px",
          height: "60px",
          backgroundColor: "#0073b1",
          borderRadius: "50%",
          zIndex: 1050,
          textDecoration: "none",
          border: "4px solid #fff",
        }}
        title="AI Mock Interview (Practice 15 mins)"
      >
        <FaRobot size={28} />
      </Link>


    </>
  );
}
