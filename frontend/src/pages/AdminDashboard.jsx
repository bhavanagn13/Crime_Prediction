import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LabelList
} from "recharts";

import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import HawkesHeatmap from "../components/models/HawkesHeatmap";
import HawkesSidebar from "../components/models/HawkesSidebar";
import KDEHeatmap from "../components/models/KDEHeatmap";
import AIPredictionMap from "../components/models/AIPredictionMap";

export default function AdminDashboard() {

    const [stats, setStats] = useState({
        total_grids: 0,
        high_risk: 0,
        medium_risk: 0,
        low_risk: 0,
        citizen_reports: 0,
        police_stations: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        let mounted = true;

        api.get("/dashboard-analytics")
            .then((response) => {

                if (mounted) {
                    setStats(
                        response.data?.cards || {}
                    );
                }

            })
            .catch((error) => {

                console.error(
                    "Dashboard analytics failed:",
                    error
                );

            })
            .finally(() => {

                if (mounted) {
                    setLoading(false);
                }

            });

        return () => {
            mounted = false;
        };

    }, []);


    // =========================================================
    // RISK DISTRIBUTION DATA
    // =========================================================

    const riskData = [
        {
            name: "High Risk",
            value: Number(stats.high_risk) || 0,
        },
        {
            name: "Medium Risk",
            value: Number(stats.medium_risk) || 0,
        },
        {
            name: "Low Risk",
            value: Number(stats.low_risk) || 0,
        },
    ];

    const riskColors = [
        "#EF4444",
        "#F59E0B",
        "#22C55E"
    ];


    // =========================================================
    // DATA OVERVIEW
    // =========================================================

    const overviewData = [
    {
        name: "Analysed Grids",
        value: Number(stats.total_grids) || 0,
    },
    {
        name: "Police Stations",
        value: Number(stats.police_stations) || 0,
    },
    {
        name: "Citizen Reports",
        value: Number(stats.citizen_reports) || 0,
    },
    {
        name: "High Risk",
        value: Number(stats.high_risk) || 0,
    },
    {
        name: "Medium Risk",
        value: Number(stats.medium_risk) || 0,
    },
    {
        name: "Low Risk",
        value: Number(stats.low_risk) || 0,
    },
];

    const totalRiskGrids =
        riskData.reduce(
            (sum, item) => sum + item.value,
            0
        );


    return (

        <DashboardLayout>

            <div className="space-y-8">

                {/* ===================================================== */}
                {/* HEADER */}
                {/* ===================================================== */}

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">
                        Crime Intelligence Dashboard
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Real-time crime risk, intensity and hotspot analysis.
                    </p>

                </div>


                {/* ===================================================== */}
                {/* RISK DISTRIBUTION + DATA OVERVIEW */}
                {/* ===================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                    {/* ================================================= */}
                    {/* RISK DISTRIBUTION */}
                    {/* ================================================= */}

                    <section className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        p-6
                    ">

                        <div className="mb-4">

                            <h2 className="
                                text-xl
                                font-bold
                                text-slate-800
                            ">
                                Risk Distribution
                            </h2>

                            <p className="
                                text-sm
                                text-slate-500
                                mt-1
                            ">
                                Distribution of analysed grids by predicted risk level.
                            </p>

                        </div>


                        {loading ? (

                            <div className="
                                h-[280px]
                                flex
                                items-center
                                justify-center
                                text-slate-400
                            ">
                                Loading risk data...
                            </div>

                        ) : (

                            <div className="
                                relative
                                h-[300px]
                            ">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={riskData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={75}
                                            outerRadius={110}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                        >

                                            {riskData.map(
                                                (entry, index) => (

                                                    <Cell
                                                        key={`risk-${index}`}
                                                        fill={
                                                            riskColors[index]
                                                        }
                                                    />

                                                )
                                            )}

                                        </Pie>

                                        <Tooltip
                                            formatter={(value) => [
                                                value,
                                                "Grids"
                                            ]}
                                        />

                                    </PieChart>

                                </ResponsiveContainer>


                                {/* CENTER VALUE */}

                                <div className="
                                    absolute
                                    inset-0
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    pointer-events-none
                                ">

                                    <span className="
                                        text-3xl
                                        font-bold
                                        text-slate-800
                                    ">
                                        {totalRiskGrids.toLocaleString()}
                                    </span>

                                    <span className="
                                        text-xs
                                        text-slate-500
                                        mt-1
                                    ">
                                        Total Grids
                                    </span>

                                </div>

                            </div>

                        )}


                        {/* LEGEND */}

                        {!loading && (

                            <div className="
                                grid
                                grid-cols-3
                                gap-3
                                mt-2
                            ">

                                {riskData.map(
                                    (item, index) => {

                                        const percentage =
                                            totalRiskGrids > 0
                                                ? (
                                                    item.value /
                                                    totalRiskGrids
                                                ) * 100
                                                : 0;

                                        return (

                                            <div
                                                key={item.name}
                                                className="
                                                    text-center
                                                    rounded-xl
                                                    bg-slate-50
                                                    p-3
                                                "
                                            >

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    mb-1
                                                ">

                                                    <span
                                                        className="
                                                            w-2.5
                                                            h-2.5
                                                            rounded-full
                                                        "
                                                        style={{
                                                            backgroundColor:
                                                                riskColors[index]
                                                        }}
                                                    />

                                                    <span className="
                                                        text-xs
                                                        text-slate-500
                                                    ">
                                                        {item.name}
                                                    </span>

                                                </div>

                                                <div className="
                                                    text-lg
                                                    font-bold
                                                    text-slate-800
                                                ">
                                                    {item.value.toLocaleString()}
                                                </div>

                                                <div className="
                                                    text-xs
                                                    text-slate-400
                                                ">
                                                    {percentage.toFixed(1)}%
                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </section>


                    {/* ================================================= */}
                    {/* DATA OVERVIEW */}
                    {/* ================================================= */}

                    <section className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        p-6
                    ">

                        <div className="mb-4">

                            <h2 className="
                                text-xl
                                font-bold
                                text-slate-800
                            ">
                                Data Overview
                            </h2>

                            <p className="
                                text-sm
                                text-slate-500
                                mt-1
                            ">
                                Current scale of the crime intelligence system.
                            </p>

                        </div>


                        {loading ? (

                            <div className="
                                h-[360px]
                                flex
                                items-center
                                justify-center
                                text-slate-400
                            ">
                                Loading overview...
                            </div>

                        ) : (

                            <div className="h-[360px]">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                   <BarChart
    data={overviewData}
    margin={{
        top: 35,
        right: 20,
        left: 10,
        bottom: 55
    }}
>
    <CartesianGrid
        strokeDasharray="3 3"
        vertical={false}
        stroke="#E2E8F0"
    />

    <XAxis
        dataKey="name"
        stroke="#64748B"
        interval={0}
        angle={-25}
        textAnchor="end"
        height={70}
        tick={{
            fontSize: 11
        }}
    />

    <YAxis
        stroke="#94A3B8"
        allowDecimals={false}
    />

    <Tooltip
        formatter={(value) => [
            value.toLocaleString(),
            "Count"
        ]}
    />

    <Bar
        dataKey="value"
        fill="#3B82F6"
        radius={[8, 8, 0, 0]}
        barSize={42}
    >
        <LabelList
            dataKey="value"
            position="top"
            formatter={(value) =>
                value.toLocaleString()
            }
        />
    </Bar>

</BarChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </section>

                </div>


                {/* ===================================================== */}
                {/* AI PREDICTED HOTSPOTS */}
                {/* ===================================================== */}

                <section>

                    <div className="mb-4">

                        <h2 className="
                            text-2xl
                            font-bold
                            text-slate-800
                        ">
                            AI Predicted Hotspots
                        </h2>

                        <p className="text-slate-500 mt-1">
                            High-risk areas identified by the AI ensemble prediction model.
                        </p>

                    </div>

                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        overflow-hidden
                    ">

                        <AIPredictionMap />

                    </div>

                </section>


                {/* ===================================================== */}
                {/* KDE */}
                {/* ===================================================== */}

                <section>

                    <div className="mb-4">

                        <h2 className="
                            text-2xl
                            font-bold
                            text-slate-800
                        ">
                            KDE Crime Density
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Spatial density of historical crime activity.
                        </p>

                    </div>

                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        overflow-hidden
                    ">

                        <KDEHeatmap />

                    </div>

                </section>


                {/* ===================================================== */}
                {/* HAWKES */}
                {/* ===================================================== */}

                <section>

                    <div className="mb-4">

                        <h2 className="
                            text-2xl
                            font-bold
                            text-slate-800
                        ">
                            Hawkes Intensity
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Crime contagion intensity across Bengaluru grids.
                        </p>

                    </div>

                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        overflow-hidden
                    ">

                        <HawkesHeatmap />

                    </div>

                    <div className="mt-6">

                        <HawkesSidebar />

                    </div>

                </section>


                {/* ===================================================== */}
                {/* EXISTING SECOND KDE SECTION
                    LEFT UNCHANGED FOR NOW
                */}
                {/* ===================================================== */}

                {/* <section>

                    <div className="mb-4">

                        <h2 className="
                            text-2xl
                            font-bold
                            text-slate-800
                        ">
                            KDE Crime Density
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Spatial density of historical crime activity.
                        </p>

                    </div>

                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        overflow-hidden
                    ">

                        <KDEHeatmap />

                    </div>

                </section> */}

            </div>

        </DashboardLayout>

    );
}