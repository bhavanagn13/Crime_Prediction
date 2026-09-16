export default function PatrolDetails({ station, vehicles }) {
  if (!station || !vehicles) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <p className="text-gray-500">
          Select a police station to view patrol details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">

      <h2 className="text-2xl font-bold text-slate-800 mb-5">
        🚔 {station}
      </h2>

      {Object.entries(vehicles).map(([vehicleName, vehicle]) => (

        <div key={vehicleName} className="mb-6">

          <h3 className="text-lg font-semibold mb-3">
            {vehicleName}
          </h3>
          <p className="text-sm text-gray-500 mb-3">
    Distance: {vehicle.distance_km} km • Duration: {vehicle.duration_min} min
</p>

          <div className="space-y-2">

            {vehicle.stops.map((spot, index) => (

              <div
                key={index}
                className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-slate-50"
              >

                <div>

                  <div className="font-medium">
                    {spot.area_name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {spot.grid_id}
                  </div>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    spot.risk_level === 2
                      ? "bg-red-100 text-red-700"
                      : spot.risk_level === 1
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {spot.risk_level === 2
                    ? "High"
                    : spot.risk_level === 1
                    ? "Medium"
                    : "Low"}
                </span>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>
  );
}