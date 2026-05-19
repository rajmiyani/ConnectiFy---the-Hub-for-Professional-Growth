import { Outlet } from "react-router-dom";
import Header from "../components/admin/Header";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      {/* FIXED SIDEBAR */}
      <Sidebar />

      {/* FIXED HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <main
        style={{
          marginLeft: 84,      // Sidebar width
          marginTop: 70,       // Header height
          height: "calc(100vh - 70px)",
          overflowY: "auto",   // ✅ Only content scrolls
          background: "#f3f2ef",
          padding: 24,
        }}
      >
        {children}
      <Outlet />
      </main>
    </div>
  );
}