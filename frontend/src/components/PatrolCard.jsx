export default function PatrolCard({
  station,
  vehicles,
  selected,
  onClick,
})  {
  return (
<div
  onClick={onClick}
  className={`rounded-xl shadow p-6 mb-6 cursor-pointer transition-all
    ${
      selected
        ? "bg-blue-50 border-2 border-blue-500"
        : "bg-white hover:shadow-lg"
    }`}
>

      <h2 className="text-2xl font-bold text-slate-800 mb-5">
        🚔 {station}
      </h2>

      {Object.entries(vehicles).map(([vehicleName, hotspots]) => (

        <div key={vehicleName} className="mb-6">

          <h3 className="text-lg font-semibold mb-3">
            {vehicleName}
          </h3>

          <div className="space-y-2">

            {hotspots.map((spot, index) => (

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