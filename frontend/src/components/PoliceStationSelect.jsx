import { useMemo, useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";

// Police stations that must NOT appear in Patrol Optimisation dropdown
const EXCLUDED_STATIONS = new Set([
  "Adugodi Traffic PS",
  "Airport Traffic PS",
  "Ashoknagar Traffic PS",
  "BIAL PS",
  "Banasawadi Traffic PS",
  "Banashankari Traffic PS",
  "Basavanagudi Traffic PS",
  "Bellanduru Traffic PS",
  "Byatrarayanapura Traffic PS",
  "Chickpet Traffic PS",
  "Chikkajala Traffic PS",
  "City Market Traffic PS",
  "Cubbonpark Traffic PS",
  "Devanahalli Traffic PS",
  "Electronic City Traffic PS",
  "HSR Lay Out Traffic PS",
  "Halasur Gate Traffic PS",
  "Halasur Traffic PS",
  "Hebbal Traffic PS",
  "Hennur Traffic PS",
  "High Grounds Traffic PS",
  "Hulimavu Traffic PS",
  "Jalahalli Traffic PS",
  "Jayanagar Traffic PS",
  "K G Halli Traffic PS",
  "K.R.Puram Traffic PS",
  "Kamakshipalya Traffic PS",
  "Kengeri Traffic PS",
  "Kumaraswamy Layout Traffic PS",
  "Madivala Traffic PS",
  "Magadi Road Traffic PS",
  "Mahadevapura Traffic PS",
  "Malleshwaram Traffic PS",
  "Mico Layout Traffic PS",
  "Peenya Traffic PS",
  "Pulakeshinagar Traffic PS",
  "R.T.Nagar Traffic PS",
  "Rajajinagar Traffic PS",
  "Sadashivanagar Traffic PS",
  "Shivajinagar Traffic PS",
  "Thalaghattapura Traffic PS",
  "Upparpet Traffic PS",
  "V V Puram Traffic PS",
  "Vijayanagar Traffic PS",
  "Whitefield Traffic PS",
  "Wilsongarden Traffic PS",
  "Yelahanka Traffic PS",
  "Yeshwanthapura Traffic PS",
  "Basavanagudi Women PS",
  "Bagalur PS",
  "Electronic City PS",
  "H.A.L. PS",
  "Mahalakshmipuram PS",
  "Pulakeshinagar PS",
  "S.J. Park PS",
  "Shivajinagar PS",
  "South CEN Crime PS",
  "Srirampura PS",
  "Subramanyapura PS",
  "Thalaghattapura PS",
  "Vyalikaval PS",
  "Whitefield CEN Crime PS",
  "Wilsongarden PS",
  "Yelahanka PS",
  "North CEN Crime PS"
]);

export default function PoliceStationSelect({
  stations,
  selectedStation,
  onSelect,
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // First remove excluded stations, then apply search
  const filteredStations = useMemo(() => {
    const allowedStations = stations.filter(
      (station) => !EXCLUDED_STATIONS.has(station.trim())
    );

    if (!search.trim()) {
      return allowedStations;
    }

    return allowedStations.filter((station) =>
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
        <div className="absolute mt-2 w-full rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl max-h-72 overflow-y-auto z-30">

          {filteredStations.length > 0 ? (

            filteredStations.map((station) => (
            <button
  key={station}
  onClick={() => handleSelect(station)}
  className="w-full px-4 py-3 text-left text-slate-200 bg-slate-900 hover:bg-slate-700 hover:text-white transition-colors duration-150"
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