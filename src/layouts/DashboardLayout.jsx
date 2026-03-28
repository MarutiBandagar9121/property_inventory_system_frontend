import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
        <Sidebar />
      <main className="flex-1 overflow-auto p-16 bg-gray-200">
        <Outlet />
      </main>
    </div>
  );
}
