import { Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout.jsx";
// import Home from "../pages/company/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import UserManagement from "../pages/admin/UserManagement.jsx";
import CompanyManagement from "../pages/admin/CompanyManagement.jsx";
import Message from "../pages/user/Messages.jsx";
import Notification from "../pages/admin/Notification.jsx";
import JobManagement from "../pages/admin/JobManagement.jsx";
import ContentModeration from "../pages/admin/ContentModeration.jsx";
import SystemSettings from "../pages/admin/SystemSettings.jsx";
import MyProfile from "../pages/admin/Profile.jsx";

// Guard: if logged in as an admin account, allow access.
// Otherwise redirect to admin login.
function AdminPanelGuard({ children }) {
    const { user } = useAuth();
    // Use role check since admin is static for now or part of user model
    const isAdmin = user?.role === "admin" || user?.panel === "admin";

    if (!user?.id && !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    if (user?.id && user?.panel !== "admin") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

export default function AdminRoutes() {
    return (
        <Route
            path="/admin"
            element={
                <AdminPanelGuard>
                    <AdminLayout />
                </AdminPanelGuard>
            }
        >

            {/* Default route → /company */}
            <Route index element={<AdminDashboard />} />

            {/* Explicit dashboard route → /company/dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/companies" element={<CompanyManagement />} />
            <Route path="/admin/chats" element={<Message />} />
            <Route path="/admin/notifications" element={<Notification />} />
            <Route path="/admin/jobs" element={<JobManagement />} />
            <Route path="/admin/moderation" element={<ContentModeration />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/profile" element={<MyProfile />} />
        </Route>
    );
}
