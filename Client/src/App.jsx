import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import UserRoutes from "./routes/UserRoutes";
import CompanyRoutes from "./routes/CompanyRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import { useSocket } from "./context/SocketContext";
import { useToast } from "./context/ToastContext";

export default function App() {
  const socket = useSocket();
  const { showToast } = useToast();

  useEffect(() => {
    if (socket) {
      socket.on("new_notification", (data) => {
        console.log("🔔 Global notification:", data);
        showToast(`${data.title}: ${data.message}`, "info");
      });

      return () => socket.off("new_notification");
    }
  }, [socket, showToast]);

  return (
    <Routes>
      {/* Redirect root to login page */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {UserRoutes()}
      {CompanyRoutes()}
      {AdminRoutes()}
      {AuthRoutes()}
    </Routes>
  );
}
