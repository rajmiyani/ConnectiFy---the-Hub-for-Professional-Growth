import { Route } from "react-router-dom";

import Login from "../pages/user/Login";
import RegisterMain from "../pages/user/RegisterMain";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";
import OTPVerification from "../pages/user/OTPVerification";
import AdminLogin from "../pages/admin/Login";

export default function AuthRoutes() {
  return (
    <>
      {/* For Users, Companies */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<RegisterMain />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="otp-verification" element={<OTPVerification />} />


      {/* For Admin */}
      <Route path="admin/login" element={<AdminLogin />} />
    </>
  );
}