import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";

import L from "leaflet";

const reportIcon = new L.Icon({

    iconUrl: "/markers/marker-icon-2x-red.png",
    shadowUrl: "/markers/marker-shadow.png",

    iconSize: [25,41],
    iconAnchor: [12,41]

});

export default function CommunityMap({ reports }) {

    const center =
        reports.length > 0
            ? [
                Number(reports[0].latitude),
                Number(reports[0].longitude)
              ]
            : [12.9716,77.5946];

    return (

        <div className="bg-white rounded-xl shadow p-4">

            <h2 className="text-xl font-bold mb-4">

                Community Report Map

            </h2>

            <MapContainer

                center={center}
                zoom={13}

                style={{

                    height:"70vh",
                    width:"100%",
                    borderRadius:"12px"

                }}

            >

                <TileLayer

                    attribution="&copy; OpenStreetMap"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />

                {reports.map(report=>(

                    <Marker

                        key={report.report_id}

                        position={[

                            Number(report.latitude),
                            Number(report.longitude)

                        ]}

                        icon={reportIcon}

                    >

                        <Popup>

                            <strong>

                                {report.location_name}

                            </strong>

                            <br/>

                            {report.category}

                            <br/>

                            {report.status}

                        </Popup>

                    </Marker>

                ))}

            </MapContainer>

        </div>

    );

}