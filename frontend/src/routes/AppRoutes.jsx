import { Routes, Route } from "react-router-dom";

import AdminDashboard from "../pages/AdminDashboard";
import Prediction from "../pages/Prediction";
import Patrol from "../pages/Patrol";

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

    </Routes>
  );
}