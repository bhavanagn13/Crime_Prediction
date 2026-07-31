import {
    FaChartBar,
    FaMapMarkedAlt,
    FaRoute,
    FaClipboardList,
    FaRegEdit,
    FaBrain,
    FaTimes
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {

    return (

        <aside
            className={`
                fixed z-[2000] 
                top-0
                left-0
                h-screen
                w-64
                bg-slate-900
                text-white
                z-50
                shadow-2xl
                transform
                transition-transform
                duration-300
                ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}
        >

            {/* Header */}

            <div className="flex items-center justify-between p-6 border-b border-slate-700">

                <div>

                    <h1 className="text-xl font-bold">

                        🛡 Bengaluru Police

                    </h1>

                    <p className="text-sm text-slate-400 mt-1">

                        CrimeVision AI

                    </p>

                </div>

                <button
                    onClick={onClose}
                    className="text-xl hover:text-red-400 transition"
                >
                    <FaTimes />
                </button>

            </div>

            {/* Navigation */}

            <nav className="mt-6">

                <SidebarItem
                    to="/"
                    icon={<FaChartBar />}
                    title="Dashboard"
                    onClose={onClose}
                />

                <SidebarItem
                    to="/prediction"
                    icon={<FaMapMarkedAlt />}
                    title="Prediction"
                    onClose={onClose}
                />

                <SidebarItem
    to="/ai-models"
    icon={<FaBrain />}
    title="AI Model Visualizations"
    onClose={onClose}
/>

                <SidebarItem
                    to="/patrol"
                    icon={<FaRoute />}
                    title="Patrol Routes"
                    onClose={onClose}
                />

               <SidebarItem
    to="/community-reports"
    icon={<FaClipboardList />}
    title="Community Reports"
    onClose={onClose}
/>

<SidebarItem
    to="/citizen-report"
    icon={<FaRegEdit />}
    title="Citizen Report"
    onClose={onClose}
/>



            </nav>

        </aside>

    );

}

function SidebarItem({ icon, title, to, onClose }) {

    return (

        <NavLink
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                    isActive
                        ? "bg-slate-800 border-l-4 border-blue-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
            }
        >

            <span className="text-lg">
                {icon}
            </span>

            <span className="font-medium">
                {title}
            </span>

        </NavLink>

    );

}