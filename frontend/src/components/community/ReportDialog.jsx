import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportDialog({
  report,
  open,
  onClose,
  onUpdated,
}) {

  const [status, setStatus] = useState("");

  useEffect(() => {
    if (report) {
      setStatus(report.status);
    }
  }, [report]);

  if (!open || !report) return null;

  const saveStatus = async () => {

    try {

      await axios.patch(
        `http://127.0.0.1:5000/police/report/${report.report_id}/status`,
        {
          status
        }
      );

      alert("Status updated successfully.");

      onUpdated();

      onClose();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.error ||
        "Failed to update report."
      );

    }

  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          Report Details
        </h2>

        <div className="space-y-5">

          <div>
            <p className="text-sm text-gray-500">
              Location
            </p>
            <p className="font-semibold">
              {report.location_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Category
            </p>
            <p>{report.category}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Description
            </p>
            <p>{report.description}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Priority
            </p>
            <p>{report.priority}</p>
          </div>

          <div>

            <p className="text-sm text-gray-500 mb-2">
              Status
            </p>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3"
            >

              <option value="PENDING">
                PENDING
              </option>

              <option value="IN_PROGRESS">
                IN_PROGRESS
              </option>

              <option value="RESOLVED">
                RESOLVED
              </option>

            </select>

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={saveStatus}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );

}