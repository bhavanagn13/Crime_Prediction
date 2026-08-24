import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import PatrolMap from "../components/PatrolMap";
import PoliceStationSelect from "../components/PoliceStationSelect";
import PatrolDetails from "../components/PatrolDetails";

export default function Patrol() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const isPolice = user?.role === "POLICE";

    const [patrols, setPatrols] = useState({});
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStations = async () => {
            try {
                const res = await api.get("/police-stations");
                const list = res.data?.stations || [];
                setStations(list);

                if (isPolice) {
                    setSelectedStation(user?.police_station || list[0] || "");
                } else if (isAdmin) {
                    setSelectedStation((current) => current || list[0] || "");
                }
            } catch (err) {
                console.error("Station load failed:", err);
                setError(err.response?.data?.error || "Unable to load police station.");
            }
        };

        if (user) loadStations();
    }, [user, isPolice, isAdmin]);

    useEffect(() => {
        if (!user) return;

        if (isAdmin && !selectedStation) return;

        const loadPatrol = async () => {
            setLoading(true);
            setError("");

            try {
                const payload = isAdmin
                    ? { police_station: selectedStation }
                    : {}; // backend gets police station from session

                const res = await api.post("/patrol-optimization", payload);

                setPatrols(res.data?.patrols || {});
                if (isPolice && res.data?.police_station) {
                    setSelectedStation(res.data.police_station);
                }
            } catch (err) {
                console.error("Patrol load failed:", err);
                setPatrols({});
                setError(
                    err.response?.data?.error ||
                    "Unable to load patrol routes."
                );
            } finally {
                setLoading(false);
            }
        };

        loadPatrol();
    }, [user, isAdmin, isPolice, selectedStation]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Patrol Optimization
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isPolice
                            ? `Optimized patrol routes for ${user?.police_station || "your station"}`
                            : "Select a police station to view its optimized patrol routes."}
                    </p>
                </div>

                {isAdmin && (
                    <PoliceStationSelect
                        stations={stations}
                        selectedStation={selectedStation}
                        onSelect={setSelectedStation}
                    />
                )}

                {loading && (
                    <div className="bg-white rounded-xl border p-8 text-center">
                        Loading patrol routes...
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid lg:grid-cols-10 gap-6">
                        <div className="lg:col-span-3">
                            <PatrolDetails
                                station={selectedStation || user?.police_station}
                                vehicles={patrols}
                            />
                        </div>

                        <div className="lg:col-span-7">
                            <PatrolMap
                                station={selectedStation || user?.police_station}
                                vehicles={patrols}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
