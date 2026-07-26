import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";
import PatrolCard from "../components/PatrolCard";
import PatrolMap from "../components/PatrolMap";
import PatrolStationList from "../components/PatrolStationList";
import PatrolDetails from "../components/PatrolDetails";

export default function Patrol() {

  const [patrols, setPatrols] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);

  useEffect(() => {

    axios
        .get("http://127.0.0.1:5000/police-stations")
        .then((res) => {

            setStations(res.data.stations);

            if (res.data.stations.length > 0) {
                setSelectedStation(res.data.stations[0]);
            }

        })
        .catch((err) => {
        console.error(err);
        setLoading(false);
});

}, []);

  useEffect(() => {
    if (!selectedStation) return;

    setLoading(true);

    axios
  .post("http://127.0.0.1:5000/patrol-optimization", {
    police_station: selectedStation,
  })
  .then((res) => {

    setPatrols(res.data.patrols);
    
    setLoading(false);

  })
  .catch((err) => {

    console.error(err);

    setLoading(false);

  });
  }, [selectedStation]);
  return (
<DashboardLayout>

    <h1 className="text-3xl font-bold mb-6">
        Patrol Optimization
    </h1>

    {loading ? (

        <p>Loading patrol routes...</p>

    ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT COLUMN */}

           <div>

   <PatrolStationList
    stations={stations}
    selectedStation={selectedStation}
    onSelect={setSelectedStation}
/>

    <PatrolDetails
        station={selectedStation}
        vehicles={patrols}
    />

</div>

            {/* RIGHT COLUMN */}

            <div>

                <PatrolMap
                    station={selectedStation}
                    vehicles={patrols}
                />

            </div>

        </div>

    )}

</DashboardLayout>

  );

}