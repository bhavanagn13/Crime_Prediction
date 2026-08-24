import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function HawkesSidebar() {

    const [data, setData] = useState(null);

    useEffect(() => {

        axios
            .get("http://localhost:5000/hawkes-heatmap")
            .then((res) => {

                setData(res.data);

            })
            .catch(console.error);

    }, []);

    const stats = useMemo(() => {

        if (!data)
            return null;

        const values = data.heatmap.map(d => d.intensity);

        const max = Math.max(...values);

        const avg =
            values.reduce((a, b) => a + b, 0) /
            values.length;

        return {

            activeGrids: values.length,

            maxIntensity: max.toFixed(2),

            avgIntensity: avg.toFixed(2),

            hotspotCount: data.top_hotspots.length

        };

    }, [data]);

    if (!data || !stats) {

        return (

            <div className="flex items-center justify-center h-full">

                Loading...

            </div>

        );

    }

    return (

        <div className="flex flex-col gap-5 h-full overflow-y-auto">

            {/* ---------------- Top Hotspots ---------------- */}

            <div className="bg-white rounded-xl shadow-md p-4">

                <h2 className="text-xl font-bold mb-4">
     Top 10 High-Intensity Areas
</h2>

                {

                    data.top_hotspots.slice(0, 10).map((spot, index) => (

                        <div
                            key={spot.grid_id}
                            className="border-b last:border-none py-2"
                        >

                            <div className="font-semibold">

                                {index + 1}. {spot.area}

                            </div>

                            <div className="text-sm text-gray-500">

                                {spot.station}

                            </div>

                            <div className="text-red-600 text-sm">

                                Intensity : {spot.intensity.toFixed(2)}

                            </div>

                        </div>

                    ))

                }

            </div>

          

        </div>

    );

}