import { useEffect, useRef,useState } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";




export default function GCNGraph() {

    const [graph, setGraph] = useState({
        nodes: [],
        links: []
    });
    const fgRef = useRef();
    useEffect(() => {

        axios
            .get("http://localhost:5000/gcn-graph")
            .then(res => setGraph(res.data))
            .catch(console.error);

    }, []);

    return (

        <div
            style={{
                height: "700px",
                width: "100%"
            }}
        >

            <ForceGraph2D
ref={fgRef}
                graphData={graph}

                nodeLabel={node => `
Grid : ${node.id}

Area : ${node.area}

Station : ${node.station}

Risk : ${
node.risk === 2
? "High"
: node.risk === 1
? "Medium"
: "Low"
}
`}

                nodeColor={node => {

                    if (node.risk === 2) return "#ef4444";

                    if (node.risk === 1) return "#f59e0b";

                    return "#22c55e";

                }}

                nodeRelSize={8}

                linkWidth={2}

            />

        </div>

    );

}