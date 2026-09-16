import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ReportDialog({
  report,
  open,
  onClose,
  onUpdated,
}) {
  const [status, setStatus] = useState("");
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setStatus(report.status || "PENDING");
    }
  }, [report]);

  if (!open || !report) return null;

  const saveStatus = async () => {
    try {
      setSaving(true);

      await api.patch(
        `/police/report/${report.report_id}/status`,
        { status }
      );

      alert("Status updated successfully.");
      await onUpdated();
      onClose();
    } catch (err) {
      console.error("Status update error:", err);
      alert(
        err.response?.data?.error ||
          "Failed to update report."
      );
    } finally {
      setSaving(false);
    }
  };

  const validateReport = async () => {
  try {
    setValidating(true);

    await api.patch(
      `/police/report/${report.report_id}/validate`
    );

    alert("Report validated successfully.");

    await onUpdated();
    onClose();

  } catch (err) {
    console.error("Report validation error:", err);

    alert(
      err.response?.data?.error ||
        "Failed to validate report."
    );

  } finally {
    setValidating(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Report Details
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Review the citizen submission before taking action.
            </p>
          </div>

          {report.validated && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
              ✓ Validated
            </span>
          )}
        </div>

        <div className="space-y-6">

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
              Citizen Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="font-semibold text-slate-800 mt-1">
                  {report.citizen_name || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="font-semibold text-slate-800 mt-1 break-all">
                  {report.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-semibold text-slate-800 mt-1">
                  {report.phone_number || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Report ID</p>
                <p className="font-semibold text-slate-800 mt-1">
                  #{report.report_id}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Incident Information
            </h3>

            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-slate-800 mt-1">
                {report.location_name || report.address || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold text-slate-800 mt-1">
                {report.category}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-slate-700 mt-1 whitespace-pre-wrap">
                {report.description || "No description provided."}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p className="font-semibold text-slate-800 mt-1">
                {report.priority}
              </p>
            </div>
          </section>

          <section>
            <p className="text-sm text-gray-500 mb-2">Status</p>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
            >
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          {!report.validated && (
            <button
              onClick={validateReport}
              disabled={validating || saving}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {validating ? "Validating..." : "✓ Validate Report"}
            </button>
          )}

          <button
            onClick={saveStatus}
            disabled={saving || validating}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
