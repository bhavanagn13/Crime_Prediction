import React, { useEffect, useState } from "react";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import axios from "axios";

export default function AIPredictionMap() {

    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        axios
            .get("http://localhost:5000/predict-all")
            .then((res) => {

                console.log("AI predictions received:", res.data);

                if (Array.isArray(res.data)) {
                    setPredictions(res.data);
                } else {
                    setPredictions([]);
                    setError("Invalid prediction data received.");
                }

            })
            .catch((err) => {

                console.error("AI prediction map error:", err);

                setError("Unable to load AI predictions.");

            })
            .finally(() => {

                setLoading(false);

            });

    }, []);

    const highRiskSpots = predictions.filter((spot) => {

        const risk = Number(spot?.risk_level);

        const lat = Number(spot?.coordinates?.lat);
        const lng = Number(spot?.coordinates?.lng);

        return (
            risk === 2 &&
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= 12.7 &&
            lat <= 13.2 &&
            lng >= 77.3 &&
            lng <= 77.9
        );

    });

    if (loading) {

        return (
            <div
                className="flex items-center justify-center bg-white"
                style={{ height: "650px" }}
            >
                <p className="text-slate-500">
                    Loading AI predicted hotspots...
                </p>
            </div>
        );

    }

    if (error) {

        return (
            <div
                className="flex items-center justify-center bg-white"
                style={{ height: "650px" }}
            >
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );

    }

    return (

        <div className="relative">

            {/* Small information badge */}
{/* 
            <div
                className="absolute z-[1000] top-4 left-4 bg-white rounded-lg shadow-md px-4 py-3"
                style={{ zIndex: 1000 }}
            >

                <div className="font-semibold text-slate-800">
                    AI Predicted High-Risk Areas
                </div>

                <div className="text-sm text-slate-500">
                    {highRiskSpots.length} high-risk grids
                </div>

            </div> */}


            <MapContainer
                center={[12.9716, 77.5946]}
                zoom={11}
                scrollWheelZoom={true}
                style={{
                    height: "650px",
                    width: "100%"
                }}
            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

{highRiskSpots.map((spot, index) => {

    const lat = Number(spot.coordinates.lat);
    const lng = Number(spot.coordinates.lng);

    return (
        <React.Fragment key={spot.grid_id || index}>

            <CircleMarker
                center={[lat, lng]}
                radius={16}
                pathOptions={{
                    color: "#ef4444",
                    fillColor: "#ef4444",
                    fillOpacity: 0.12,
                    opacity: 0.35,
                    weight: 2,
                    className: "ai-hotspot-glow"
                }}
            />

            <CircleMarker
                center={[lat, lng]}
                radius={7}
                pathOptions={{
                    color: "#b91c1c",
                    fillColor: "#ef4444",
                    fillOpacity: 0.9,
                    opacity: 1,
                    weight: 2
                }}
            >

                <Popup>

                    <div className="text-sm">

                        <div className="font-bold text-red-600 mb-2">
                            AI Predicted Hotspot
                        </div>

                        <div>
                            <b>Area:</b>{" "}
                            {spot.area_name || "Unknown"}
                        </div>

                        <div>
                            <b>Police Station:</b>{" "}
                            {spot.police_station || "Unknown"}
                        </div>

                        <div>
                            <b>Grid ID:</b>{" "}
                            {spot.grid_id}
                        </div>

                        <div>
                            <b>Risk:</b> High
                        </div>

                    </div>

                </Popup>

            </CircleMarker>

        </React.Fragment>
    );

})}

            </MapContainer>

        </div>

    );

}