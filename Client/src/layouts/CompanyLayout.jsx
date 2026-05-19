import Header from "../components/company/Header";
import { Outlet } from "react-router-dom";

export default function CompanyLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
