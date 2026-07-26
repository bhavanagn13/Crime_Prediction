import { useEffect, useState } from "react";
import axios from "axios";


import DashboardLayout from "../layouts/DashboardLayout";

export default function Prediction() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const rowsPerPage = 25;

    useEffect(() => {
        axios
            .get("http://127.0.0.1:5000/predict-all")
            .then((res) => {
                setPredictions(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, riskFilter]);

    // Helper functions

    const getRiskLabel = (value) => {
        switch (value) {
            case 2:
                return "High";
            case 1:
                return "Medium";
            default:
                return "Low";
        }
    };

    const formatHawkes = (value) => {

    if (value >= 5)
        return `High (${value.toFixed(2)})`;

    if (value >= 1)
        return `Moderate (${value.toFixed(2)})`;

    if (value > 0)
        return `Very Low (${value.toExponential(2)})`;

    return "None";
};

    const filteredPredictions = predictions.filter((item) => {

        const query = search.toLowerCase();

        const matchesSearch =
            item.grid_id.toLowerCase().includes(query) ||
            item.area_name.toLowerCase().includes(query) ||
            item.police_station.toLowerCase().includes(query);

        let matchesRisk = true;

        if (riskFilter === "High")
            matchesRisk = item.risk_level === 2;

        else if (riskFilter === "Medium")
            matchesRisk = item.risk_level === 1;

        else if (riskFilter === "Low")
            matchesRisk = item.risk_level === 0;

        return matchesSearch && matchesRisk;
    });

    const totalPages = Math.ceil(filteredPredictions.length / rowsPerPage);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    const currentRows = filteredPredictions.slice(
        indexOfFirstRow,
        indexOfLastRow
    );

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">
                Crime Predictions
            </h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <div className="flex justify-between items-center gap-4 mb-5">

                        <input
                            type="text"
                            placeholder="Search Grid ID, Area or Police Station..."
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                                <tr
                                    key={item.grid_id}
                                    className="border-b hover:bg-gray-100"
                                >
                                    <td className="px-4 py-3">{item.grid_id}</td>

                                    <td className="px-4 py-3">{item.area_name}</td>

                                    <td className="px-4 py-3">{item.police_station}</td>

                                    <td className="px-4 py-3">

                                        {item.risk_level === 2 && (
                                            <span className="text-red-600 font-semibold">
                                                High
                                            </span>
                                        )}

                                        {item.risk_level === 1 && (
                                            <span className="text-yellow-600 font-semibold">
                                                Medium
                                            </span>
                                        )}

                                        {item.risk_level === 0 && (
                                            <span className="text-green-600 font-semibold">
                                                Low
                                            </span>
                                        )}

                                    </td>

                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => {
                                                setSelectedPrediction(item);
                                                setShowModal(true);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                        >
                                            View
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                    {showModal && selectedPrediction && (
                        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                            <div className="bg-white rounded-xl shadow-xl p-6 w-[550px]">

                                <div className="flex justify-between items-center mb-5">

                                    <h2 className="text-2xl font-bold">
                                        Prediction Details
                                    </h2>

                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-2xl font-bold"
                                    >
                                        ×
                                    </button>

                                </div>

                                <div className="space-y-3">

                                    <p><strong>Grid ID:</strong> {selectedPrediction.grid_id}</p>

                                    <p><strong>Area:</strong> {selectedPrediction.area_name}</p>

                                    <p><strong>Police Station:</strong> {selectedPrediction.police_station}</p>

                                    <p>
                                        <strong>Latitude:</strong>{" "}
                                        {selectedPrediction.coordinates?.lat}
                                    </p>

                                    <p>
                                        <strong>Longitude:</strong>{" "}
                                        {selectedPrediction.coordinates?.lng}
                                    </p>

                                    <hr />

                                    <h3 className="text-lg font-bold mt-5 mb-3">
                                        Model Outputs
                                    </h3>

                                    <hr className="mb-4" />

                                    <p>
                                        <strong>LSTM (Temporal):</strong>{" "}
                                        {getRiskLabel(selectedPrediction.details?.lstm)}
                                    </p>

                                    <p>
                                        <strong>GCN (Spatial):</strong>{" "}
                                        {getRiskLabel(selectedPrediction.details?.gcn)}
                                    </p>

                                    <p>
                                        <strong>Hawkes Intensity:</strong>{" "}
                                        {formatHawkes(selectedPrediction.details?.hawkes)}
                                    </p>

                                    <hr />

                                    <h3 className="text-lg font-bold mt-6 mb-3">
                                        Fusion Result
                                    </h3>

                                    <hr className="mb-4" />

                                    <p className="mb-3">
                                        <strong>Final Risk:</strong>{" "}

                                        {selectedPrediction.risk_level === 2 && (
                                            <span className="text-red-600 font-bold">
                                                🔴 High
                                            </span>
                                        )}

                                        {selectedPrediction.risk_level === 1 && (
                                            <span className="text-yellow-600 font-bold">
                                                🟡 Medium
                                            </span>
                                        )}

                                        {selectedPrediction.risk_level === 0 && (
                                            <span className="text-green-600 font-bold">
                                                🟢 Low
                                            </span>
                                        )}

                                    </p>

                                    <p>
                                        <strong>Decision Basis:</strong>{" "}
                                        Combined spatio-temporal analysis
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}

                    <div className="flex justify-between items-center mt-6">

                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <span className="font-medium">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>

                    </div>

                </div>
            )}
        </DashboardLayout>
    );
}