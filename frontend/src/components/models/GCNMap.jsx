import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Polyline
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

export default function GCNMap() {

    const [graph, setGraph] = useState({
        nodes: [],
        links: []
    });

    useEffect(() => {

        axios
            .get("http://localhost:5000/gcn-graph")
            .then(res => {

                console.log(res.data);

                setGraph(res.data);

            })
            .catch(err => console.error(err));

    }, []);

    const nodeMap = useMemo(() => {

        const map = {};

        graph.nodes.forEach(node => {

            map[node.id] = node;

        });

        return map;

    }, [graph]);

    return (

       <div
    className="relative overflow-hidden rounded-xl"
    style={{
        width: "100%",
        height: "700px"
    }}
>

            {/* Legend */}

            <div
    className="absolute top-4 right-4 z-[1000] text-sm"
>

                <h3 className="font-bold mb-2">
                    Risk Level
                </h3>

                <div className="flex items-center gap-2 mb-2">

                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#ef4444"
                        }}
                    />

                    High Risk

                </div>

                <div className="flex items-center gap-2 mb-2">

                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#f59e0b"
                        }}
                    />

                    Medium Risk

                </div>

                <div className="flex items-center gap-2">

                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#22c55e"
                        }}
                    />

                    Low Risk

                </div>

            </div>
<MapContainer
    center={[12.9716, 77.5946]}
    zoom={11}
    style={{
        width: "100%",
        height: "100%",
        display: "block"
    }}
>

                <TileLayer

                    attribution="&copy; OpenStreetMap contributors"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />

                {/* GCN EDGES */}

                {

                    graph.links.map((edge, index) => {

                        const source = nodeMap[edge.source];
                        const target = nodeMap[edge.target];

                        if (!source || !target)
                            return null;

                        return (

                            <Polyline

                                key={index}

                                positions={[

                                    [source.lat, source.lng],

                                    [target.lat, target.lng]

                                ]}

                                pathOptions={{

                                    color: "#4b5563",

                                    weight: 2,

                                    opacity: 0.7

                                }}

                            />

                        );

                    })

                }

                {/* GCN NODES */}

                {

                    graph.nodes.map(node => (

                        <CircleMarker

                            key={node.id}

                            center={[

                                node.lat,

                                node.lng

                            ]}

                            radius={

                                node.risk === 2

                                    ? 10

                                    : node.risk === 1

                                        ? 8

                                        : 6

                            }

                            pathOptions={{

                                color:

                                    node.risk === 2

                                        ? "#ef4444"

                                        : node.risk === 1

                                            ? "#f59e0b"

                                            : "#22c55e",

                                fillColor:

                                    node.risk === 2

                                        ? "#ef4444"

                                        : node.risk === 1

                                            ? "#f59e0b"

                                            : "#22c55e",

                                fillOpacity: 0.9

                            }}

                        >

                            <Popup>

                                <h3
                                    style={{
                                        fontWeight: "bold"
                                    }}
                                >
                                    {node.area}
                                </h3>

                                <br />

                                <b>Grid :</b> {node.id}

                                <br />

                                <b>Station :</b> {node.station}

                                <br />

                                <b>Risk :</b>{" "}

                                {

                                    node.risk === 2

                                        ? "High"

                                        : node.risk === 1

                                            ? "Medium"

                                            : "Low"

                                }

                            </Popup>

                        </CircleMarker>

                    ))

                }

            </MapContainer>

        </div>

    );

}