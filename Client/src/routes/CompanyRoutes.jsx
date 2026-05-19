import { Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CompanyLayout from "../layouts/CompanyLayout";
import Home from "../pages/company/Dashboard";
import Jobs from "../pages/company/Job";
import MyNetwork from "../pages/company/MyNetwork";
import Messages from "../pages/company/Messages";
import Notifications from "../pages/company/Notification";
import AIResume from "../pages/company/AIResume";
import JobManagement from "../pages/company/JobManagement";
import CompanyAnalytics from "../pages/company/Analytics";
import InterviewSchedule from "../pages/company/InterviewSchedule";
import ViewApplicants from "../pages/company/ViewApplicants";
import CompanyProfile from "../pages/company/Profile";
import CompanyRegister from "../pages/company/Register";
import Settings from "../pages/user/Settings";
import InterviewRoom from "../pages/company/InterviewRoom";
import PremiumPlans from "../pages/PremiumPlans";

// Guard: if logged in as a user account, redirect to user home.
// Only triggers when user is actually authenticated (has an id).
function CompanyPanelGuard({ children }) {
    const { user } = useAuth();
    if (user?.id && user?.panel === "user") {
        return <Navigate to="/user/home" replace />;
    }
    return children;
}

export default function CompanyRoutes() {
    return (
        <Route
            path="/company"
            element={
                <CompanyPanelGuard>
                    <CompanyLayout />
                </CompanyPanelGuard>
            }
        >
            {/* Default route → /company */}
            <Route index element={<Home />} />

            {/* Explicit dashboard route → /company/dashboard */}
            <Route path="dashboard" element={<Home />} />

            {/* COMMON PAGES */}
            <Route path="mynetwork" element={<MyNetwork />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="ai-resume" element={<AIResume />} />

            <Route path="register" element={<CompanyRegister />} />
            <Route path="job-posting" element={<JobManagement />} />
            <Route path="view-applicants" element={<ViewApplicants />} />
            <Route path="view-applicants/:jobId" element={<ViewApplicants />} />
            <Route path="analytics" element={<CompanyAnalytics />} />
            <Route path="interview-schedule" element={<InterviewSchedule />} />
            <Route path="interview/:id" element={<InterviewRoom />} />
            <Route path="premium" element={<PremiumPlans role="company" />} />
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="settings" element={<Settings role="company" />} />
        </Route>
    );
}
