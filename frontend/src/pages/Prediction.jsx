import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Prediction() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPrediction, setSelectedPrediction] = useState(null);

    const rowsPerPage = 25;

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await api.get("/predict-all");
                if (mounted) setPredictions(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Prediction load failed:", err);
                if (mounted) {
                    setError(
                        err.response?.data?.error ||
                        "Unable to load crime analysis."
                    );
                    setPredictions([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, riskFilter]);

    const getRiskLabel = (value) =>
        value === 2 ? "High" : value === 1 ? "Medium" : "Low";

    const filteredPredictions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return predictions.filter((item) => {
            const matchesSearch =
                !query ||
                String(item.grid_id || "").toLowerCase().includes(query) ||
                String(item.area_name || "").toLowerCase().includes(query) ||
                String(item.police_station || "").toLowerCase().includes(query);

            const matchesRisk =
                riskFilter === "All" ||
                (riskFilter === "High" && item.risk_level === 2) ||
                (riskFilter === "Medium" && item.risk_level === 1) ||
                (riskFilter === "Low" && item.risk_level === 0);

            return matchesSearch && matchesRisk;
        });
    }, [predictions, search, riskFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPredictions.length / rowsPerPage)
    );

    const currentRows = filteredPredictions.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Crime Analysis
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {predictions.length} analysed grids
                    </p>
                </div>

                {loading && (
                    <div className="bg-white rounded-xl border p-8 text-center">
                        Loading crime analysis...
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                        <h2 className="text-lg font-semibold text-red-700">
                            Unable to load crime analysis
                        </h2>
                        <p className="text-slate-500 mt-2">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-5 flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search grid, area or police station..."
                                className="flex-1 border rounded-lg px-4 py-2"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="border rounded-lg px-4 py-2"
                            >
                                <option>All</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-800 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Grid ID</th>
                                        <th className="px-4 py-3 text-left">Area</th>
                                        <th className="px-4 py-3 text-left">Police Station</th>
                                        <th className="px-4 py-3 text-left">Risk</th>
                                        <th className="px-4 py-3 text-left">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.map((item) => (
                                        <tr key={item.grid_id} className="border-b">
                                            <td className="px-4 py-3">{item.grid_id}</td>
                                            <td className="px-4 py-3">{item.area_name}</td>
                                            <td className="px-4 py-3">{item.police_station}</td>
                                            <td className="px-4 py-3 font-semibold">
                                                <span className={
                                                    item.risk_level === 2
                                                        ? "text-red-600"
                                                        : item.risk_level === 1
                                                            ? "text-yellow-600"
                                                            : "text-green-600"
                                                }>
                                                    {getRiskLabel(item.risk_level)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setSelectedPrediction(item)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-5 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {selectedPrediction && (
                    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold">Prediction Details</h2>
                                <button
                                    onClick={() => setSelectedPrediction(null)}
                                    className="text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <p><strong>Grid:</strong> {selectedPrediction.grid_id}</p>
                                <p><strong>Area:</strong> {selectedPrediction.area_name}</p>
                                <p><strong>Police Station:</strong> {selectedPrediction.police_station}</p>
                                <p>
                                    <strong>Final Risk:</strong>{" "}
                                    {getRiskLabel(selectedPrediction.risk_level)}
                                </p>
                                <p>
                                    <strong>Hawkes Intensity:</strong>{" "}
                                    {Number(selectedPrediction.details?.hawkes || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
