import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import DashboardLayout from "../layouts/DashboardLayout";
import PoliceStationSelect from "../components/PoliceStationSelect";
import ReportCard from "../components/community/ReportCard";
import ReportDialog from "../components/community/ReportDialog";
import CommunityMap from "../components/community/CommunityMap";


export default function CommunityReports() {

    const { user } = useAuth();

    const isAdmin = user?.role === "ADMIN";
    const isPolice = user?.role === "POLICE";


    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState("");

    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedReport, setSelectedReport] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);


    // ======================================================
    // LOAD POLICE STATIONS
    // ADMIN ONLY
    // ======================================================

    useEffect(() => {

        if (!isAdmin) {
            return;
        }

        api
            .get("/police-stations")
            .then((res) => {

                console.log(
                    "POLICE STATIONS RESPONSE:",
                    res.data
                );

                const stationList =
                    Array.isArray(res.data?.stations)
                        ? res.data.stations
                        : [];

                setStations(stationList);

                if (stationList.length > 0) {

                    setSelectedStation(
                        stationList[0]
                    );

                }

            })
            .catch((error) => {

                console.error(
                    "Failed to load police stations:",
                    error
                );

                setStations([]);

            });

    }, [isAdmin]);


    // ======================================================
    // NORMALIZE REPORT RESPONSE
    // ======================================================

    const normalizeReports = (data) => {

        /*
         * Backend may return:
         *
         * 1. [ report1, report2, ... ]
         *
         * OR
         *
         * 2. {
         *      reports: [ report1, report2, ... ]
         *    }
         *
         * Always convert it into an array.
         */

        if (Array.isArray(data)) {

            return data;

        }

        if (Array.isArray(data?.reports)) {

            return data.reports;

        }

        console.warn(
            "Unexpected reports API response:",
            data
        );

        return [];
    };


    // ======================================================
    // LOAD REPORTS
    // ======================================================

    useEffect(() => {

        if (!user) {
            return;
        }


        // --------------------------------------------------
        // ADMIN
        // --------------------------------------------------

        if (isAdmin && !selectedStation) {

            setLoading(false);

            return;
        }


        setLoading(true);


        let request;


        // --------------------------------------------------
        // POLICE
        //
        // Do NOT send station parameter.
        //
        // Backend determines station from authenticated
        // police account.
        // --------------------------------------------------

        if (isPolice) {

            request = api.get(
                "/police/reports"
            );

        }


        // --------------------------------------------------
        // ADMIN
        //
        // Admin can select station.
        // --------------------------------------------------

        else if (isAdmin) {

            request = api.get(
                "/police/reports",
                {
                    params: {
                        station: selectedStation
                    }
                }
            );

        }


        // --------------------------------------------------
        // OTHER ROLES
        // --------------------------------------------------

        if (!request) {

            setReports([]);
            setLoading(false);

            return;
        }


        request
            .then((res) => {

                console.log(
                    "REPORTS API RESPONSE:",
                    res.data
                );


                const reportList =
                    normalizeReports(res.data);


                setReports(reportList);

            })
            .catch((error) => {

                console.error(
                    "Failed to load reports:",
                    error
                );

                if (error.response) {

                    console.error(
                        "Reports error status:",
                        error.response.status
                    );

                    console.error(
                        "Reports error data:",
                        error.response.data
                    );

                }

                setReports([]);

            })
            .finally(() => {

                setLoading(false);

            });

    }, [
        user,
        isAdmin,
        isPolice,
        selectedStation
    ]);


    // ======================================================
    // REFRESH REPORTS AFTER STATUS UPDATE
    // ======================================================

    const reloadReports = async () => {

        try {

            let response;


            // --------------------------------------------------
            // POLICE
            // --------------------------------------------------

            if (isPolice) {

                response = await api.get(
                    "/police/reports"
                );

            }


            // --------------------------------------------------
            // ADMIN
            // --------------------------------------------------

            else if (isAdmin) {

                if (!selectedStation) {
                    return;
                }

                response = await api.get(
                    "/police/reports",
                    {
                        params: {
                            station: selectedStation
                        }
                    }
                );

            }


            if (response) {

                console.log(
                    "REFRESH REPORTS RESPONSE:",
                    response.data
                );


                const reportList =
                    normalizeReports(response.data);


                setReports(reportList);

            }

        } catch (error) {

            console.error(
                "Failed to refresh reports:",
                error
            );

            if (error.response) {

                console.error(
                    "Refresh error status:",
                    error.response.status
                );

                console.error(
                    "Refresh error data:",
                    error.response.data
                );

            }

        }

    };


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <DashboardLayout>

            <div className="flex items-center justify-between mb-6">

                <div>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Community Reports
                    </h1>

                    {isPolice && user?.police_station && (

                        <p className="text-gray-500 mt-1">
                            Reports for {user.police_station}
                        </p>

                    )}

                </div>

            </div>


            {/* ==================================================
                ADMIN STATION SELECTOR
               ================================================== */}

            {isAdmin && (

                <PoliceStationSelect
                    stations={stations}
                    selectedStation={selectedStation}
                    onSelect={setSelectedStation}
                />

            )}


            {/* ==================================================
                REPORT STATISTICS
               ================================================== */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-6">


                {/* TOTAL */}

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">

                    <p className="text-sm text-gray-500">
                        Total Reports
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {reports.length}
                    </h2>

                </div>


                {/* PENDING */}

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">

                    <p className="text-sm text-gray-500">
                        Pending
                    </p>

                    <h2 className="text-3xl font-bold text-red-600 mt-2">

                        {
                            reports.filter(
                                (r) =>
                                    r.status === "PENDING"
                            ).length
                        }

                    </h2>

                </div>


                {/* IN PROGRESS */}

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">

                    <p className="text-sm text-gray-500">
                        In Progress
                    </p>

                    <h2 className="text-3xl font-bold text-yellow-600 mt-2">

                        {
                            reports.filter(
                                (r) =>
                                    r.status === "IN_PROGRESS"
                            ).length
                        }

                    </h2>

                </div>


                {/* RESOLVED */}

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">

                    <p className="text-sm text-gray-500">
                        Resolved
                    </p>

                    <h2 className="text-3xl font-bold text-green-600 mt-2">

                        {
                            reports.filter(
                                (r) =>
                                    r.status === "RESOLVED"
                            ).length
                        }

                    </h2>

                </div>

            </div>


            {/* ==================================================
                REPORTS + MAP
               ================================================== */}

            <div className="grid lg:grid-cols-10 gap-6 mt-6">


                {/* ==================================================
                    REPORT LIST
                   ================================================== */}

                <div className="lg:col-span-4 space-y-5">

                    {loading ? (

                        <p className="text-gray-500">
                            Loading reports...
                        </p>

                    ) : reports.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-6 text-gray-500">

                            No reports found.

                        </div>

                    ) : (

                        reports.map((report) => (

                           <ReportCard
    key={report.report_id}
    report={report}

    onView={(report) => {

        setSelectedReport(report);

        setDialogOpen(true);

    }}

    onDelete={async (report) => {

        try {

            await api.delete(
                `/police/report/${report.report_id}`
            );

            alert(
                "Resolved report deleted successfully."
            );

            await reloadReports();

        } catch (error) {

            console.error(
                "Delete report error:",
                error
            );

            alert(
                error.response?.data?.error ||
                "Failed to delete report."
            );

        }

    }}
/>

                        ))

                    )}

                </div>


                {/* ==================================================
                    MAP
                   ================================================== */}

                <div className="lg:col-span-6">

                    <CommunityMap
                        reports={reports}
                    />

                </div>

            </div>


            {/* ==================================================
                REPORT DIALOG
               ================================================== */}

            <ReportDialog

                report={selectedReport}

                open={dialogOpen}

                onClose={() => {

                    setDialogOpen(false);

                    setSelectedReport(null);

                }}

                onUpdated={reloadReports}

            />

        </DashboardLayout>

    );

}