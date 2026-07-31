import { Routes, Route } from "react-router-dom";

import AdminDashboard from "../pages/AdminDashboard";
import Prediction from "../pages/Prediction";
import Patrol from "../pages/Patrol";
import CitizenReport from "../pages/CitizenReport";
import CommunityReports from "../pages/CommunityReports";
import AIModelPage from "../pages/AIModelPage";

export default function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/"
        element={<AdminDashboard />}
      />

      <Route
        path="/prediction"
        element={<Prediction />}
      />

      <Route
    path="/patrol"
    element={<Patrol />}
/>

<Route
    path="/citizen-report"
    element={<CitizenReport />}
/>

<Route
    path="/community-reports"
    element={<CommunityReports />}
/>

<Route
    path="/ai-models"
    element={<AIModelPage />}
/>

    </Routes>
  );
}