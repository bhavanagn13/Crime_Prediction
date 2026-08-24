import { CircleMarker, Popup } from "react-leaflet";

export default function PredictionLayer({ hotspots }) {

    // Only show AI-predicted HIGH-RISK locations
    const highRiskSpots = hotspots.filter(
        spot => spot.risk_level === 2
    );

    return (
        <>
            {highRiskSpots.map((spot, index) => {

                const lat = spot?.coordinates?.lat;
                const lng = spot?.coordinates?.lng;

                // Ignore invalid coordinates
                if (
                    lat === undefined ||
                    lng === undefined ||
                    lat === 0 ||
                    lng === 0
                ) {
                    return null;
                }

                return (
                    <div key={spot.grid_id || index}>

                        {/* Outer glow */}
                        <CircleMarker
                            center={[lat, lng]}
                            radius={16}
                            pathOptions={{
                                color: "#ff3333",
                                fillColor: "#ff3333",
                                fillOpacity: 0.12,
                                weight: 2,
                                className: "prediction-glow"
                            }}
                        />

                        {/* Main glowing spot */}
                        <CircleMarker
                            center={[lat, lng]}
                            radius={7}
                            pathOptions={{
                                color: "#ff0000",
                                fillColor: "#ff2222",
                                fillOpacity: 0.9,
                                weight: 2
                            }}
                        >

                            <Popup>

                                <b>AI Predicted Hotspot</b>

                                <hr />

                                <b>Area:</b>{" "}
                                {spot.area_name}

                                <br />

                                <b>Risk:</b>{" "}
                                High

                                <br />

                                <b>Grid:</b>{" "}
                                {spot.grid_id}

                                <br />

                                <b>Police Station:</b>{" "}
                                {spot.police_station}

                            </Popup>

                        </CircleMarker>

                    </div>
                );

            })}
        </>
    );
}