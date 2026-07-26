import { useEffect, useState } from "react";
import api from "../services/api";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
    total_grids: 0,
    high: 0,
    medium: 0,
    low: 0,
});

    useEffect(() => {

    async function loadStatistics() {

        try {

            const response = await api.get("/statistics");

            setStats(response.data);

        }

        catch (error) {

            console.error(error);

        }

    }

    loadStatistics();

}, []);
  return (
    <DashboardLayout>

      <div>

<h1 className="text-4xl font-bold text-slate-800">

    Crime Intelligence Dashboard

</h1>

<p className="text-gray-500 mt-3 text-lg">

    Real-time monitoring and hotspot analytics.

</p>

<div className="grid grid-cols-4 gap-6 mt-8">

    <DashboardCard
        title="Total Grids"
        value={stats.total_grids}
        color="#2563EB"
    />

    <DashboardCard
        title="High Risk"
        value={stats.high}
        color="#DC2626"
    />

    <DashboardCard
        title="Medium Risk"
        value={stats.medium}
        color="#F59E0B"
    />

    <DashboardCard
        title="Low Risk"
        value={stats.low}
        color="#16A34A"
    />

</div>

</div>

    </DashboardLayout>
  );
}