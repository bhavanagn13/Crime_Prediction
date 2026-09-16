import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaMapMarkedAlt, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import Navbar from "../components/Navbar";

export default function CitizenDashboard() {

    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar hideMenu />
            <main className="p-6 md:p-8">


            {/* HEADER */}

            <div className="mb-10">

                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                    Community Safety Portal
                </p>

                <h1 className="text-3xl font-bold text-slate-800 mt-2">
                    Welcome, {user?.name || "Citizen"}
                </h1>

                <p className="text-slate-500 mt-2">
                    Stay informed, report incidents and help keep your
                    community safe.
                </p>

            </div>


            {/* OPTIONS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">

                {/* COMMUNITY REPORTS */}

                <button
                    onClick={() =>
                        navigate("/community-reports")
                    }
                    className="
                        group
                        text-left
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-7
                        shadow-sm
                        hover:shadow-lg
                        hover:-translate-y-1
                        transition-all
                    "
                >

                    <div className="
                        w-12 h-12
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                        flex items-center justify-center
                        mb-5
                    ">
                        <FaMapMarkedAlt size={21} />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        Community Reports
                    </h2>

                    <p className="text-sm text-slate-500 mt-3 leading-6">
                        View safety-related reports submitted
                        by members of the community.
                    </p>

                    <span className="
                        inline-block
                        mt-6
                        text-sm
                        font-semibold
                        text-blue-600
                        group-hover:translate-x-1
                        transition-transform
                    ">
                        View reports →
                    </span>

                </button>


                {/* MY REPORTS */}

                <button
                    onClick={() =>
                        navigate("/citizen/my-reports")
                    }
                    className="
                        group
                        text-left
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-7
                        shadow-sm
                        hover:shadow-lg
                        hover:-translate-y-1
                        transition-all
                    "
                >

                    <div className="
                        w-12 h-12
                        rounded-xl
                        bg-emerald-50
                        text-emerald-600
                        flex items-center justify-center
                        mb-5
                    ">
                        <FaClipboardList size={21} />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        My Reports
                    </h2>

                    <p className="text-sm text-slate-500 mt-3 leading-6">
                        Track the incidents and reports that
                        you have submitted.
                    </p>

                    <span className="
                        inline-block
                        mt-6
                        text-sm
                        font-semibold
                        text-emerald-600
                        group-hover:translate-x-1
                        transition-transform
                    ">
                        View my reports →
                    </span>

                </button>


                {/* REPORT INCIDENT */}

                <button
                    onClick={() =>
                        navigate("/citizen-report")
                    }
                    className="
                        group
                        text-left
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        p-7
                        shadow-sm
                        hover:shadow-lg
                        hover:-translate-y-1
                        transition-all
                    "
                >

                    <div className="
                        w-12 h-12
                        rounded-xl
                        bg-amber-50
                        text-amber-600
                        flex items-center justify-center
                        mb-5
                    ">
                        <FaExclamationTriangle size={21} />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        Report an Incident
                    </h2>

                    <p className="text-sm text-slate-500 mt-3 leading-6">
                        Submit a new incident or suspicious activity
                        report to the appropriate authorities.
                    </p>

                    <span className="
                        inline-block
                        mt-6
                        text-sm
                        font-semibold
                        text-amber-600
                        group-hover:translate-x-1
                        transition-transform
                    ">
                        Submit report →
                    </span>

                </button>

            </div>


            {/* INFORMATION */}

            <div className="
                mt-10
                max-w-6xl
                bg-blue-50
                border
                border-blue-100
                rounded-xl
                px-6
                py-5
            ">

                <p className="text-sm text-blue-800">
                    <strong>Community safety matters.</strong>{" "}
                    You can view relevant community reports,
                    track your submissions and report incidents
                    directly through this portal.
                </p>

            </div>

            </main>
        </div>
    );
}