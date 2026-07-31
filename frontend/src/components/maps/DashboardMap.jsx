import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import axios from "axios";
import HeatmapLayer from "./HeatmapLayer";
import MapLegend from "../MapLegend";
import PredictionLayer from "./PredictionLayer";

export default function DashboardMap() {

    const [heatData, setHeatData] = useState([]);
    const [hotspots, setHotspots] = useState([]);

    useEffect(() => {

        axios
            .get("http://localhost:5000/heatmap-data")
            .then(res => {

                console.log(res.data);

                setHeatData(res.data);

            });

        axios
        .get("http://localhost:5000/predict-all")
        .then(res => {
            setHotspots(res.data);
        });

    }, []);

    return (

        <MapContainer
            center={[12.9716,77.5946]}
            zoom={11}
            style={{
                height:"650px",
                width:"100%",
                borderRadius:"12px"
            }}
        >

            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <HeatmapLayer
    data={heatData}
/>
<PredictionLayer
    hotspots={hotspots}
/>
<MapLegend />

        </MapContainer>

    );

}