import { FiMenu, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick, hideMenu = false }) {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const role = user?.role || "USER";

    const roleLabel = {
        ADMIN: "Administrator",
        POLICE: "Police Officer",
        CITIZEN: "Citizen"
    };

    const organizationLabel = {
        ADMIN: "System Administration",
        POLICE: user?.police_station || "Bengaluru City Police",
        CITIZEN: "Community Safety Portal"
    };

    // Get the logged-in user's name
    const displayName =
        user?.name ||
        user?.full_name ||
        user?.fullName ||
        user?.username ||
        user?.email ||
        roleLabel[role];

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">

            {/* LEFT */}
            <div className="flex items-center gap-4">

                {!hideMenu && (
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        <FiMenu size={24} />
                    </button>
                )}

                <div>
                    <h2 className="text-2xl font-semibold text-slate-800">
                        Crime Intelligence Dashboard
                    </h2>

                    <p className="text-gray-500">
                        AI-Based Crime Analysis & Public Safety
                    </p>
                </div>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6">

                <div className="text-right">

                    <div className="font-semibold text-slate-700">
                        {displayName}
                    </div>

                    <div className="text-sm text-gray-500">
                        {organizationLabel[role]}
                    </div>

                </div>

                <button
                    onClick={handleLogout}
                    className="
                        flex items-center gap-2
                        px-4 py-2
                        rounded-lg
                        border border-slate-200
                        text-slate-600
                        hover:bg-red-50
                        hover:text-red-600
                        hover:border-red-200
                        transition
                    "
                >
                    <FiLogOut size={17} />

                    <span className="font-medium">
                        Logout
                    </span>
                </button>

            </div>

        </header>
    );
}