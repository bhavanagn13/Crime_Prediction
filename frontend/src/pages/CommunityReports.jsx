import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";
import PoliceStationSelect from "../components/PoliceStationSelect";
import ReportCard from "../components/community/ReportCard";
import ReportDialog from "../components/community/ReportDialog";
import CommunityMap
from "../components/community/CommunityMap";

export default function CommunityReports() {

    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState("");
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
const [dialogOpen, setDialogOpen] = useState(false);

const pendingCount = reports.filter(
    (r) => r.status === "PENDING"
).length;

const inProgressCount = reports.filter(
    (r) => r.status === "IN_PROGRESS"
).length;

const resolvedCount = reports.filter(
    (r) => r.status === "RESOLVED"
).length;

const totalReports = reports.length;

    // Load police stations
    useEffect(() => {

        axios
            .get("http://127.0.0.1:5000/police-stations")
            .then((res) => {

                setStations(res.data.stations);

                if (res.data.stations.length > 0) {
                    setSelectedStation(res.data.stations[0]);
                }

            })
            .catch(console.error);

    }, []);

    // Load reports whenever station changes
    useEffect(() => {

        if (!selectedStation) return;

        setLoading(true);

        axios
            .get("http://127.0.0.1:5000/police/reports", {
                params: {
                    station: selectedStation
                }
            })
            .then((res) => {

                setReports(res.data);

                setLoading(false);

            })
            .catch((err) => {

                console.error(err);

                setLoading(false);

            });

    }, [selectedStation]);

    return (

        <DashboardLayout>

            <h1 className="text-3xl font-bold mb-6">
                Community Reports
            </h1>

            <PoliceStationSelect
                stations={stations}
                selectedStation={selectedStation}
                onSelect={setSelectedStation}
            />
<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-6">

    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">

        <p className="text-sm text-gray-500">
            Total Reports
        </p>

        <h2 className="text-3xl font-bold mt-2">
            {totalReports}
        </h2>

    </div>

    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">

        <p className="text-sm text-gray-500">
            Pending
        </p>

        <h2 className="text-3xl font-bold text-red-600 mt-2">
            {pendingCount}
        </h2>

    </div>

    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">

        <p className="text-sm text-gray-500">
            In Progress
        </p>

        <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {inProgressCount}
        </h2>

    </div>

    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">

        <p className="text-sm text-gray-500">
            Resolved
        </p>

        <h2 className="text-3xl font-bold text-green-600 mt-2">
            {resolvedCount}
        </h2>

    </div>

</div>
            <div className="grid lg:grid-cols-10 gap-6 mt-6">

    <div className="lg:col-span-4 space-y-5">

        {loading ? (

            <p>Loading reports...</p>

        ) : reports.length===0 ? (

            <div className="bg-white rounded-xl shadow p-6">

                No reports found.

            </div>

        ) : (

            reports.map(report=>(

                <ReportCard

                    key={report.report_id}

                    report={report}

                    onView={(report)=>{

                        setSelectedReport(report);
                        setDialogOpen(true);

                    }}

                />

            ))

        )}

    </div>

    <div className="lg:col-span-6">

        <CommunityMap

            reports={reports}

        />

    </div>

</div>
<ReportDialog
    report={selectedReport}
    open={dialogOpen}
    onClose={() => {
        setDialogOpen(false);
        setSelectedReport(null);
    }}
    onUpdated={() => {

        axios
            .get("http://127.0.0.1:5000/police/reports", {
                params: {
                    station: selectedStation
                }
            })
            .then((res) => {

                setReports(res.data);

            });

    }}
/>

        </DashboardLayout>

    );

}