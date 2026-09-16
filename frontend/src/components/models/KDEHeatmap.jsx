import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import api from "../../services/api";
import HeatmapLayer from "../maps/HeatmapLayer";

export default function KDEHeatmap() {
    const [data, setData] = useState([]);

    useEffect(() => {
        let mounted = true;

        api.get("/heatmap-data")
            .then((res) => {
                if (!mounted) return;
                const points = Array.isArray(res.data) ? res.data : [];
                // Keep the dashboard responsive while preserving the KDE pattern.
                const step = Math.max(1, Math.ceil(points.length / 8000));
                setData(points.filter((_, index) => index % step === 0));
            })
            .catch((err) => console.error("KDE heatmap failed:", err));

        return () => { mounted = false; };
    }, []);

    return (
        <div className="w-full h-[620px]">
            <MapContainer
                center={[12.9716, 77.5946]}
                zoom={10.8}
                scrollWheelZoom
                className="w-full h-full"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <HeatmapLayer data={data} />
            </MapContainer>
        </div>
    );
}
