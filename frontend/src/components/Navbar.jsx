import { FiMenu } from "react-icons/fi";

export default function Navbar({ onMenuClick }) {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">

      {/* Left Section */}

      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <FiMenu size={24} />
        </button>

        <div>

          <h2 className="text-2xl font-semibold text-slate-800">
            Crime Intelligence Dashboard
          </h2>

          <p className="text-gray-500">
            AI-Based Predictive Crime Analysis
          </p>

        </div>

      </div>

      {/* Right Section */}

      <div className="text-right">

        <div className="font-semibold text-slate-700">
          Administrator
        </div>

        <div className="text-sm text-gray-500">
          Bengaluru City Police
        </div>

      </div>

    </header>
  );
}