import {
    FaChartBar,
    FaMapMarkedAlt,
    FaRoute,
    FaFileAlt,
    FaSignOutAlt
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="w-72 bg-slate-900 text-white">

            <div className="p-6 border-b border-slate-700">

                <h1 className="text-xl font-bold">

                    🚔 CrimeVision AI

                </h1>

                <p className="text-sm text-slate-400 mt-2">

                    Bengaluru City Police

                </p>

            </div>

            <nav className="mt-6">

                <SidebarItem
                    to="/"
                    icon={<FaChartBar />}
                    title="Dashboard"
                />

                <SidebarItem
                    to="/prediction"
                    icon={<FaMapMarkedAlt />}
                    title="Prediction"
                />

                <SidebarItem
                    to="/patrol"
                    icon={<FaRoute />}
                    title="Patrol Routes"
                />

                <SidebarItem
                    to="/reports"
                    icon={<FaFileAlt />}
                    title="Reports"
                />

            </nav>

        </aside>
    );
}
function SidebarItem({ icon, title, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
          isActive
            ? "bg-slate-800 border-l-4 border-blue-500 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <span className="text-lg">{icon}</span>

      <span className="font-medium">{title}</span>
    </NavLink>
  );
}