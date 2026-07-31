import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatmapLayer({ data }) {

    const map = useMap();

    useEffect(() => {

        if (!data || data.length === 0) return;

        const points = data.map(point => [
            point.lat,
            point.lng,
            point.weight
        ]);

        const heatLayer = L.heatLayer(points, {

            radius: 25,
            blur: 20,
            maxZoom: 17,

            gradient: {
                0.2: "blue",
                0.4: "lime",
                0.6: "yellow",
                0.8: "orange",
                1.0: "red"
            }

        });

        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };

    }, [data, map]);

    return null;
}