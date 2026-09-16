import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function MyReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyReports();
  }, []);

  const loadMyReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/citizen/my-reports"
      );

      setReports(response.data || []);
    } catch (err) {
      console.error("My reports error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.error ||
            "Unable to load your reports."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const statusClass = (status) => {
    switch (status) {
      case "RESOLVED":
        return "status resolved";

      case "IN_PROGRESS":
        return "status progress";

      case "REJECTED":
        return "status rejected";

      default:
        return "status pending";
    }
  };

  return (
    <div className="my-reports-page">

      <div className="my-reports-header">

        <button
          className="back-button"
          onClick={() => navigate("/citizen")}
        >
          ← Back
        </button>

        <div>
          <h1>My Reports</h1>

          <p>
            Track incidents that you have reported
            through the community safety portal.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadMyReports}
        >
          ↻ Refresh
        </button>

      </div>


      {loading && (
        <div className="state-card">
          <div className="loader"></div>
          <p>Loading your reports...</p>
        </div>
      )}


      {!loading && error && (
        <div className="state-card error-card">

          <h2>Unable to load reports</h2>

          <p>{error}</p>

          <button onClick={loadMyReports}>
            Try Again
          </button>

        </div>
      )}


      {!loading &&
        !error &&
        reports.length === 0 && (

          <div className="state-card">

            <div className="empty-icon">
              +
            </div>

            <h2>No reports yet</h2>

            <p>
              You haven't submitted any incident
              reports yet.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/citizen-report")
              }
            >
              Report an Incident
            </button>

          </div>
        )}


      {!loading &&
        !error &&
        reports.length > 0 && (

          <div className="reports-container">

            <div className="reports-summary">

              <div>
                <span>Total Reports</span>

                <strong>
                  {reports.length}
                </strong>
              </div>

              <div>
                <span>Active</span>

                <strong>
                  {
                    reports.filter(
                      (r) =>
                        r.status === "PENDING" ||
                        r.status === "IN_PROGRESS"
                    ).length
                  }
                </strong>
              </div>

              <div>
                <span>Resolved</span>

                <strong>
                  {
                    reports.filter(
                      (r) =>
                        r.status === "RESOLVED"
                    ).length
                  }
                </strong>
              </div>

            </div>


            <div className="reports-list">

              {reports.map((report) => (

                <div
                  className="report-item"
                  key={report.report_id}
                >

                  <div className="report-item-top">

                    <div>

                      <span className="category">
                        {report.category}
                      </span>

                      <h2>
                        {report.location_name ||
                          report.address ||
                          "Location not specified"}
                      </h2>

                    </div>

                    <span
                      className={statusClass(
                        report.status
                      )}
                    >
                      {(report.status || "PENDING")
                        .replace("_", " ")}
                    </span>

                  </div>


                  <p className="description">
                    {report.description ||
                      "No description provided."}
                  </p>


                  <div className="report-meta">

                    <div>
                      <span>Report ID</span>
                      <strong>
                        #{report.report_id}
                      </strong>
                    </div>

                    <div>
                      <span>Police Station</span>
                      <strong>
                        {report.nearest_police_station ||
                          "Assigned by authorities"}
                      </strong>
                    </div>

                    <div>
                      <span>Submitted</span>
                      <strong>
                        {formatDate(
                          report.reported_at
                        )}
                      </strong>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}


      <style>{`

        .my-reports-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 32px 48px 60px;
          color: #172033;
        }

        .my-reports-header {
          max-width: 1200px;
          margin: 0 auto 30px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 24px;
          align-items: center;
        }

        .my-reports-header h1 {
          margin: 0 0 6px;
          font-size: 30px;
        }

        .my-reports-header p {
          margin: 0;
          color: #68758a;
        }

        .back-button,
        .refresh-button {
          border: 1px solid #d8deea;
          background: white;
          color: #25324a;
          padding: 11px 17px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 14px;
        }

        .back-button:hover,
        .refresh-button:hover {
          background: #f0f4fa;
        }

        .reports-container {
          max-width: 1200px;
          margin: auto;
        }

        .reports-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 22px;
        }

        .reports-summary div {
          background: white;
          border: 1px solid #e0e5ee;
          border-radius: 12px;
          padding: 20px;
        }

        .reports-summary span {
          display: block;
          color: #7b8799;
          font-size: 12px;
          margin-bottom: 7px;
        }

        .reports-summary strong {
          font-size: 27px;
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .report-item {
          background: white;
          border: 1px solid #e0e5ee;
          border-radius: 14px;
          padding: 22px;
          box-shadow: 0 3px 12px rgba(30,45,70,0.05);
        }

        .report-item-top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .category {
          display: inline-block;
          background: #eef3ff;
          color: #315bea;
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .report-item h2 {
          margin: 10px 0 0;
          font-size: 19px;
        }

        .description {
          color: #606c80;
          line-height: 1.6;
          margin: 17px 0;
        }

        .report-meta {
          border-top: 1px solid #edf0f5;
          padding-top: 15px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .report-meta span {
          display: block;
          color: #8a94a5;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .report-meta strong {
          font-size: 13px;
          color: #364257;
        }

        .status {
          white-space: nowrap;
          height: fit-content;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .status.pending {
          background: #fff7df;
          color: #9a6b00;
        }

        .status.progress {
          background: #eaf2ff;
          color: #2860c7;
        }

        .status.resolved {
          background: #e8f8ef;
          color: #16804b;
        }

        .status.rejected {
          background: #ffeaea;
          color: #c43d3d;
        }

        .state-card {
          max-width: 650px;
          margin: 80px auto;
          background: white;
          border: 1px solid #e0e5ee;
          border-radius: 14px;
          padding: 42px;
          text-align: center;
        }

        .state-card p {
          color: #68758a;
        }

        .error-card {
          border-color: #efcccc;
        }

        .error-card h2 {
          color: #b32626;
        }

        .state-card button {
          border: none;
          background: #315bea;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
        }

        .primary-button {
          margin-top: 10px;
        }

        .empty-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: #eef3ff;
          color: #315bea;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .loader {
          width: 28px;
          height: 28px;
          margin: 0 auto 12px;
          border: 3px solid #e0e5ee;
          border-top-color: #315bea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {

          .my-reports-page {
            padding: 24px 18px;
          }

          .my-reports-header {
            grid-template-columns: 1fr;
          }

          .reports-summary {
            grid-template-columns: 1fr;
          }

          .report-meta {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

      </div>
    
  );
}