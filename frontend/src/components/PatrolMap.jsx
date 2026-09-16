import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// ---------------------
// Marker Icons
// ---------------------

const redIcon = new L.Icon({
  iconUrl: "/markers/marker-icon-2x-red.png",
  shadowUrl: "/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const yellowIcon = new L.Icon({
  iconUrl: "/markers/marker-icon-2x-yellow.png",
  shadowUrl: "/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = new L.Icon({
  iconUrl: "/markers/marker-icon-green.png",
  shadowUrl: "/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const policeIcon = new L.Icon({
  iconUrl: "/markers/marker-icon-2x-blue.png",
  shadowUrl: "/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// ---------------------
// Auto Zoom
// ---------------------

function ChangeMapView({ hotspots, firstVehicle }) {
  const map = useMap();

  useEffect(() => {
    const bounds = [];

    if (firstVehicle?.police_station) {
      bounds.push([
        Number(firstVehicle.police_station.lat),
        Number(firstVehicle.police_station.lng),
      ]);
    }

    hotspots.forEach((spot) => {
      bounds.push([
        Number(spot.coordinates.lat),
        Number(spot.coordinates.lng),
      ]);
    });

    if (bounds.length === 0) return;

    const timer = setTimeout(() => {
      map.stop(); // stop any ongoing animation
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: false,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [hotspots, firstVehicle, map]);

  return null;
}
// ---------------------
// Component
// ---------------------

export default function PatrolMap({ station, vehicles }) {
  const hotspots = vehicles
    ? Object.values(vehicles).flatMap(vehicle => vehicle.stops)
    : [];

  const vehicleRoutes = vehicles
    ? Object.entries(vehicles).map(([vehicleName, vehicle]) => ({
      vehicleName,
      coordinates: vehicle.geometry,
    }))
    : [];

  const firstVehicle =
    vehicles && Object.keys(vehicles).length > 0
      ? Object.values(vehicles)[0]
      : null;

console.log("Vehicles:", vehicles);
console.log("First Vehicle:", firstVehicle);

if (firstVehicle?.police_station) {
  console.log("Police Station:", firstVehicle.police_station);
}

if (hotspots.length > 0) {
  console.log("First Hotspot:", hotspots[0].coordinates);
}

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={11}
      style={{
        height: "75vh",
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeMapView
        hotspots={hotspots}
        firstVehicle={firstVehicle}
      />

      {/* Vehicle Routes */}

      {vehicleRoutes.map((route, index) => (
        <Polyline
          key={route.vehicleName}
          positions={route.coordinates}
          color={index === 0 ? "blue" : "purple"}
          weight={4}
          opacity={0.8}
        />
      ))}
      {firstVehicle?.police_station && (
        <>
          {console.log(
            "Marker Position:",
            firstVehicle.police_station.lat,
            firstVehicle.police_station.lng
          )}

          <Marker
            position={[
              Number(firstVehicle.police_station.lat),
              Number(firstVehicle.police_station.lng),
            ]}
            icon={policeIcon}
          >
            <Popup>
              <strong>{firstVehicle.police_station.name}</strong>
              <br />
              Patrol Start
            </Popup>
          </Marker>
        </>
      )}

      {/* Hotspots */}

      {hotspots.map((spot, index) => {
        const markerIcon =
          spot.risk_level === 2
            ? redIcon
            : spot.risk_level === 1
              ? yellowIcon
              : greenIcon;

        return (
          <Marker
            key={`${spot.grid_id}-${spot.police_station}`}
            position={[
              spot.coordinates.lat,
              spot.coordinates.lng,
            ]}
            icon={markerIcon}
          >
            <Popup>
              <strong>{spot.area_name}</strong>

              <br />

              Grid: {spot.grid_id}

              <br />

              Police Station: {spot.police_station}

              <br />

              Risk:{" "}
              {spot.risk_level === 2
                ? "High"
                : spot.risk_level === 1
                  ? "Medium"
                  : "Low"}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}