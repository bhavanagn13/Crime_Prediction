import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatmapLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    const points = data
      .map((p) => [
        Number(p.lat),
        Number(p.lng),
        Math.max(0, Math.min(1, Number(p.weight) || 0)),
      ])
      .filter(([lat, lng]) =>
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= 12.7 && lat <= 13.2 &&
        lng >= 77.3 && lng <= 77.9
      );

    if (!points.length) return;

    const heat = L.heatLayer(points, {
      radius: 34,
      blur: 24,
      maxZoom: 13,
      minOpacity: 0.35,
      max: 1,
      gradient: {
        0.00: "#123B73",
        0.20: "#1769AA",
        0.40: "#00B8D9",
        0.58: "#7DE3F4",
        0.72: "#FFE66D",
        0.84: "#FF9F43",
        0.93: "#FF5A36",
        1.00: "#EF233C",
      },
    });

    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [map, data]);

  return null;
}
