import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
    FiHome,
    FiActivity,
    FiMap,
    FiFileText,
    FiX,
    FiShield,
    FiUsers
} from "react-icons/fi";

export default function Sidebar({ isOpen, onClose }) {

    const { user } = useAuth();
    const role = user?.role;

    const links =
        role === "ADMIN"
            ? [
                {
                    to: "/",
                    label: "Dashboard",
                    icon: FiHome
                },
                {
                    to: "/prediction",
                    label: "Crime Analysis",
                    icon: FiActivity
                },
                {
                    to: "/patrol",
                    label: "Patrol Optimization",
                    icon: FiMap
                },
                {
                    to: "/reports",
                    label: "Community Reports",
                    icon: FiFileText
                },
                {
                    to: "/admin-management",
                    label: "Admin Management",
                    icon: FiUsers
                }
            ]
            : [
                {
                    to: "/police",
                    label: "Dashboard",
                    icon: FiHome
                },
                {
                    to: "/prediction",
                    label: "Crime Analysis",
                    icon: FiActivity
                },
                {
                    to: "/patrol",
                    label: "Patrol Optimization",
                    icon: FiMap
                },
                {
                    to: "/reports",
                    label: "Community Reports",
                    icon: FiFileText
                }
            ];

    return (
        <aside
            className={`
                fixed left-0 top-0 bottom-0 z-[2000]
                w-72 bg-slate-900 text-white shadow-2xl
                transform transition-transform duration-200
                ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
            `}
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-6
                    py-5
                    border-b
                    border-slate-700
                "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
                            w-9
                            h-9
                            rounded-lg
                            bg-blue-600
                            flex
                            items-center
                            justify-center
                            font-bold
                        "
                    >
                        CI
                    </div>

                    <div>

                        <div className="font-semibold">
                            Crime Intelligence
                        </div>

                        <div className="text-xs text-slate-400">
                            {role === "ADMIN"
                                ? "Administration"
                                : "Police Operations"}
                        </div>

                    </div>

                </div>

                <button
                    onClick={onClose}
                    className="
                        p-2
                        rounded-lg
                        hover:bg-slate-800
                    "
                    aria-label="Close menu"
                >
                    <FiX size={20} />
                </button>

            </div>


            {/* POLICE STATION */}

            {role === "POLICE" && (

                <div
                    className="
                        mx-4
                        mt-5
                        rounded-xl
                        bg-slate-800
                        px-4
                        py-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-slate-400
                        "
                    >

                        <FiShield size={14} />

                        Assigned station

                    </div>

                    <div
                        className="
                            mt-1
                            text-sm
                            font-semibold
                        "
                    >
                        {user?.police_station || "Not assigned"}
                    </div>

                </div>

            )}


            {/* NAVIGATION */}

            <nav
                className="
                    px-4
                    py-5
                    space-y-2
                "
            >

                {links.map(
                    ({
                        to,
                        label,
                        icon: Icon
                    }) => (

                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            end={
                                to === "/" ||
                                to === "/police"
                            }
                            className={({ isActive }) =>
                                `
                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                text-sm
                                font-medium
                                transition
                                ${
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }
                                `
                            }
                        >

                            <Icon size={18} />

                            {label}

                        </NavLink>

                    )
                )}

            </nav>

        </aside>
    );
}