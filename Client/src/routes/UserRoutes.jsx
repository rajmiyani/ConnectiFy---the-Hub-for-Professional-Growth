import { Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserLayout from "../layouts/UserLayout";
import Home from "../pages/user/Home";
import Jobs from "../pages/user/Job";
import MyNetwork from "../pages/user/MyNetwork";
import Messages from "../pages/user/Messages";
import Notifications from "../pages/user/Notification";
import AIResume from "../pages/user/AIResume";
import ResumeTemplates from "../pages/user/ResumeTemplates";
import JobDetails from "../pages/user/JobDetails";
import SavedItems from "../components/user/SavedItems";
import Profile from "../components/user/Profile";
import CompanyProfile from "../pages/company/Profile";
import Settings from "../pages/user/Settings";
import MockInterview from "../pages/user/MockInterview";
import MyInterviews from "../pages/user/MyInterviews";
import InterviewRoom from "../pages/company/InterviewRoom";
import DoubtSolver from "../pages/user/DoubtSolver";
import DailyQuiz from "../pages/user/DailyQuiz";
import PremiumPlans from "../pages/PremiumPlans";

// Guard: if logged in as a company account, redirect to company dashboard.
// Only triggers when user is actually authenticated (has an id).
function UserPanelGuard({ children }) {
    const { user } = useAuth();
    if (user?.id && user?.panel === "company") {
        return <Navigate to="/company/dashboard" replace />;
    }
    return children;
}

export default function UserRoutes() {
    return (
        <Route
            path="/user"
            element={
                <UserPanelGuard>
                    <UserLayout />
                </UserPanelGuard>
            }
        >
            <Route index element={<Home />} />           {/* /user */}
            <Route path="home" element={<Home />} />     {/* /user/home */}

            {/* COMMON PAGES */}
            <Route path="mynetwork" element={<MyNetwork />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="ai-resume" element={<AIResume />} />
            <Route path="resume-templates" element={<ResumeTemplates />} />

            <Route path="job-details/:id" element={<JobDetails />} />
            <Route path="saved-items" element={<SavedItems />} />
            <Route path="profile" element={<Profile mode="own" />} />
            <Route path="profile/:username" element={<Profile mode="view" />} />
            <Route path="company/:companyId" element={<CompanyProfile mode="view" />} />
            <Route path="mock-interview" element={<MockInterview />} />
            <Route path="interviews" element={<MyInterviews />} />
            <Route path="doubt-solver" element={<DoubtSolver />} />
            <Route path="daily-quiz" element={<DailyQuiz />} />
            <Route path="interview/:id" element={<InterviewRoom role="candidate" />} />
            <Route path="premium" element={<PremiumPlans role="user" />} />
            <Route path="settings" element={<Settings role="user" />} />
        </Route>
    );
}
