import { useMemo, useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";

export default function PoliceStationSelect({
  stations,
  selectedStation,
  onSelect,
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredStations = useMemo(() => {
    if (!search.trim()) return stations;

    return stations.filter((station) =>
      station.toLowerCase().includes(search.toLowerCase())
    );
  }, [stations, search]);

  const handleSelect = (station) => {
    onSelect(station);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="relative w-full">

      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Police Station
      </label>

      <div className="relative">

        <FiSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          type="text"
          value={open ? search : selectedStation || ""}
          placeholder="Search police station..."
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <FiChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={20}
        />

      </div>

      {open && (

        <div className="absolute mt-2 w-full rounded-xl border bg-white shadow-xl max-h-72 overflow-y-auto z-30">

          {filteredStations.length > 0 ? (

            filteredStations.map((station) => (

              <button
                key={station}
                onClick={() => handleSelect(station)}
                className="w-full px-4 py-3 text-left hover:bg-slate-100 transition"
              >
                🚔 {station}
              </button>

            ))

          ) : (

            <div className="px-4 py-3 text-gray-500">
              No stations found
            </div>

          )}

        </div>

      )}

    </div>
  );
}