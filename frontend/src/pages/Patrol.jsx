import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../layouts/DashboardLayout";
import PatrolMap from "../components/PatrolMap";
import PoliceStationSelect from "../components/PoliceStationSelect";
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

    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Patrol Optimization
      </h1>

      {loading ? (

        <p>Loading patrol routes...</p>

      ) : (

        <>

          <PoliceStationSelect
            stations={stations}
            selectedStation={selectedStation}
            onSelect={setSelectedStation}
          />

          <div className="grid lg:grid-cols-10 gap-6">

            {/* Left Panel */}

            <div className="lg:col-span-3">

              <PatrolDetails
                station={selectedStation}
                vehicles={patrols}
              />

            </div>

            {/* Right Panel */}

            <div className="lg:col-span-7">

              <PatrolMap
                station={selectedStation}
                vehicles={patrols}
              />

            </div>

          </div>

        </>

      )}

    </div>

  </DashboardLayout>
);

}