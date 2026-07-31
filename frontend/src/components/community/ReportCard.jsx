export default function ReportCard({ report, onView }) {

  const priorityColor = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-green-100 text-green-700",
  };

  const statusColor = {
    PENDING: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
  };

  return (

    <div className="bg-white rounded-xl shadow border p-6 hover:shadow-lg transition">

      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-xl font-bold">
            📍 {report.location_name}
          </h2>

          <p className="text-gray-500 mt-1">
            {report.category}
          </p>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            priorityColor[report.priority] || "bg-gray-100"
          }`}
        >
          {report.priority}
        </span>

      </div>

      <p className="mt-5 text-gray-700">
        {report.description}
      </p>

      <div className="grid grid-cols-2 gap-6 mt-6">

        <div>

          <p className="text-xs uppercase text-gray-400">
            Status
          </p>

          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
              statusColor[report.status] || "bg-gray-100"
            }`}
          >
            {report.status.replace("_", " ")}
          </span>

        </div>

        <div>

          <p className="text-xs uppercase text-gray-400">
            Reported
          </p>

          <p className="mt-2 text-gray-700">
            {new Date(report.reported_at).toLocaleDateString()}
          </p>

        </div>

      </div>

      <div className="mt-6 flex justify-end">

        <button
          onClick={() => onView(report)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View Details
        </button>

      </div>

    </div>

  );

}