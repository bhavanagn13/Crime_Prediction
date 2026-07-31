import { CircleMarker, Popup } from "react-leaflet";

export default function PredictionLayer({ hotspots }) {

    return (

        <>
            {hotspots.map((spot, index) => {

                let color = "#22c55e";
                let label = "Low";

                if (spot.risk_level === 1) {
                    color = "#f59e0b";
                    label = "Medium";
                }

                if (spot.risk_level === 2) {
                    color = "#ef4444";
                    label = "High";
                }

                return (

                    <CircleMarker
                        key={index}
                        center={[
                            spot.coordinates.lat,
                            spot.coordinates.lng
                        ]}
                        radius={7}
                        pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity: 0.9,
                            weight: 2
                        }}
                    >

                        <Popup>

                            <b>{spot.area_name}</b>

                            <hr />

                            <b>Risk:</b> {label}<br/>

                            <b>Grid:</b> {spot.grid_id}<br/>

                            <b>Police Station:</b><br/>

                            {spot.police_station}

                        </Popup>

                    </CircleMarker>

                );

            })}
        </>

    );

}