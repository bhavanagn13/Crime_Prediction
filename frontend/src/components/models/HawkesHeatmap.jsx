import { useEffect, useState } from "react";
import axios from "axios";

import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

const INITIAL_VIEW_STATE = {
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 10.8,
    pitch: 0,
    bearing: 0
};

export default function HawkesHeatmap() {

    const [data, setData] = useState(null);
    const heatLayer =
    data &&
    new HeatmapLayer({

        id: "hawkes-heatmap",

        data: data.heatmap,

        getPosition: d => [d.lng, d.lat],

        getWeight: d => d.intensity,

        radiusPixels: 80,

        intensity: 2,

        threshold: 0.08,

        aggregation: "SUM",

        colorRange: [
            [0, 0, 255],
            [0, 255, 255],
            [0, 255, 0],
            [255, 255, 0],
            [255, 140, 0],
            [255, 0, 0]
        ]
    });

    useEffect(() => {

        axios
            .get("http://localhost:5000/hawkes-heatmap")
            .then((res) => {

                console.log(res.data);

                setData(res.data);
                    console.log(
    Math.max(...res.data.heatmap.map(d => d.intensity))
);

console.log(
    Math.min(...res.data.heatmap.map(d => d.intensity))
);

            })
            .catch(console.error);

    }, []);



    return (
<div
    className="relative"
    style={{
        width: "100%",
        height: "700px",
        overflow: "hidden"
    }}
>

            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                layers={heatLayer ? [heatLayer] : []}
                 style={{
        width: "100%",
        height: "100%",position: "absolute",
        inset: 0

    }}
            >

                <Map
    reuseMaps
    style={{
        width: "100%",
        height: "100%"
    }}
    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
/>

            </DeckGL>

        </div>

    );

}