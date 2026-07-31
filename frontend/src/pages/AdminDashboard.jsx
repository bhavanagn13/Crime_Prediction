import { useEffect, useState } from "react";
import api from "../services/api";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";
import DashboardChart from "../components/DashboardChart";
import CrimeTrendChart from "../components/charts/CrimeTrendChart";
import DashboardMap from "../components/maps/DashboardMap";
import LSTMPredictionDistribution from "../components/models/LSTMPredictionDistribution";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
    total_grids: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0,
    citizen_reports: 0,
    police_stations: 0,
});

    const [trendData, setTrendData] = useState([]);

    useEffect(() => {

    async function loadStatistics() {

        try {

            const response = await api.get("/dashboard-analytics");

            setStats(response.data.cards);

setTrendData(response.data.crime_trend);

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

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">

    <DashboardCard
        title="Total Grids"
        value={stats.total_grids}
        color="#2563EB"
    />

    <DashboardCard
        title="High Risk"
        value={stats.high_risk}
        color="#DC2626"
    />

    <DashboardCard
        title="Medium Risk"
        value={stats.medium_risk}
        color="#F59E0B"
    />

    <DashboardCard
        title="Low Risk"
        value={stats.low_risk}
        color="#16A34A"
    />

    <DashboardCard
    title="Citizen Reports"
    value={stats.citizen_reports}
    color="#7C3AED"
/>

<DashboardCard
    title="Police Stations"
    value={stats.police_stations}
    color="#4338CA"
/>

</div>

<div className="grid grid-cols-2 gap-6 mt-8">

    <DashboardChart title="Crime Trend">

        <CrimeTrendChart
            data={trendData}
        />

    </DashboardChart>

   <DashboardChart title="AI Predicted Risk Distribution">

    <LSTMPredictionDistribution />

</DashboardChart>

</div>
</div>
     <DashboardMap />
    </DashboardLayout>
    
  );
}