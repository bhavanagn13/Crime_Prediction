import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function CitizenCommunityReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/citizen/community-reports");

      setReports(response.data || []);
    } catch (err) {
      console.error("Community reports error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(
          err.response?.data?.error ||
            "Unable to load community reports."
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
    <div className="citizen-page">

      <div className="citizen-topbar">
        <button
          className="back-button"
          onClick={() => navigate("/citizen")}
        >
          ← Back
        </button>

        <div>
          <h1>Community Reports</h1>

          <p>
            View safety-related incidents reported by
            members of the community.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadReports}
        >
          ↻ Refresh
        </button>
      </div>


      {loading && (
        <div className="citizen-state">
          <div className="loader"></div>
          <p>Loading community reports...</p>
        </div>
      )}


      {!loading && error && (
        <div className="citizen-error">
          <strong>Unable to load reports</strong>
          <p>{error}</p>

          <button onClick={loadReports}>
            Try Again
          </button>
        </div>
      )}


      {!loading && !error && reports.length === 0 && (
        <div className="citizen-empty">
          <div className="empty-icon">✓</div>

          <h2>No community reports</h2>

          <p>
            There are currently no community safety
            reports available.
          </p>
        </div>
      )}


      {!loading && !error && reports.length > 0 && (
        <div className="community-reports-grid">

          {reports.map((report) => (

            <div
              className="community-report-card"
              key={report.report_id}
            >

              <div className="report-card-header">

                <div>
                  <span className="report-category">
                    {report.category}
                  </span>

                  <h2>
                    {report.location_name ||
                      "Location not specified"}
                  </h2>
                </div>

                <span className={statusClass(report.status)}>
                  {(report.status || "PENDING")
                    .replace("_", " ")}
                </span>

              </div>


              <div className="report-description">
                {report.description ||
                  "No description provided."}
              </div>


              <div className="report-details">

                <div>
                  <span>Reported</span>
                  <strong>
                    {formatDate(report.reported_at)}
                  </strong>
                </div>

                {report.latitude &&
                  report.longitude && (
                    <div>
                      <span>Location</span>
                      <strong>
                        {Number(report.latitude).toFixed(4)},
                        {" "}
                        {Number(report.longitude).toFixed(4)}
                      </strong>
                    </div>
                  )}

              </div>

            </div>

          ))}

        </div>
      )}


      <style>{`

        .citizen-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 32px 48px 60px;
          box-sizing: border-box;
          color: #172033;
        }

        .citizen-topbar {
          max-width: 1200px;
          margin: 0 auto 30px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 24px;
          align-items: center;
        }

        .citizen-topbar h1 {
          margin: 0 0 6px;
          font-size: 30px;
          font-weight: 700;
        }

        .citizen-topbar p {
          margin: 0;
          color: #68758a;
          font-size: 15px;
        }

        .back-button,
        .refresh-button {
          border: 1px solid #d8deea;
          background: white;
          color: #25324a;
          padding: 11px 17px;
          border-radius: 9px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }

        .back-button:hover,
        .refresh-button:hover {
          background: #f0f4fa;
        }

        .community-reports-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(340px, 1fr)
          );
          gap: 20px;
        }

        .community-report-card {
          background: white;
          border: 1px solid #e0e5ee;
          border-radius: 14px;
          padding: 22px;
          box-shadow: 0 3px 12px rgba(30, 45, 70, 0.06);
        }

        .report-card-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }

        .report-category {
          display: inline-block;
          color: #315bea;
          background: #eef3ff;
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .report-card-header h2 {
          margin: 11px 0 0;
          font-size: 18px;
          color: #1d2940;
        }

        .status {
          white-space: nowrap;
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

        .report-description {
          margin-top: 18px;
          color: #5d697c;
          line-height: 1.6;
          font-size: 14px;
        }

        .report-details {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #edf0f5;
          display: flex;
          gap: 30px;
        }

        .report-details div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .report-details span {
          font-size: 11px;
          color: #8a94a5;
          text-transform: uppercase;
        }

        .report-details strong {
          font-size: 13px;
          color: #364257;
        }

        .citizen-state,
        .citizen-empty,
        .citizen-error {
          max-width: 700px;
          margin: 80px auto;
          text-align: center;
          background: white;
          border: 1px solid #e0e5ee;
          border-radius: 14px;
          padding: 40px;
        }

        .citizen-error {
          border-color: #f0cccc;
        }

        .citizen-error strong {
          color: #b32626;
        }

        .citizen-error p {
          color: #68758a;
        }

        .citizen-error button {
          border: none;
          background: #315bea;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
        }

        .empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8f8ef;
          color: #16804b;
          font-size: 24px;
          font-weight: bold;
        }

        .citizen-empty h2 {
          margin-bottom: 8px;
        }

        .citizen-empty p {
          color: #68758a;
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

          .citizen-page {
            padding: 24px 18px;
          }

          .citizen-topbar {
            grid-template-columns: 1fr;
          }

          .community-reports-grid {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

      </div>
    
  );
}