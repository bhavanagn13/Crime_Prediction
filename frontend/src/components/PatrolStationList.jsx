export default function PatrolStationList({
  stations,
  selectedStation,
  onSelect,
}) {
  return (
    <div className="bg-white rounded-xl shadow">

      <div className="px-5 py-4 border-b">

        <h2 className="text-lg font-bold">
          Police Stations
        </h2>

      </div>

      <div className="max-h-80 overflow-y-auto">

        {stations.map((station) => (

          <button
            key={station}
            onClick={() => onSelect(station)}
            className={`w-full text-left px-5 py-4 border-b transition
            ${
              selectedStation === station
                ? "bg-blue-100 font-semibold text-blue-700"
                : "hover:bg-slate-50"
            }`}
          >

            🚔 {station}

          </button>

        ))}

      </div>

    </div>
  );
}