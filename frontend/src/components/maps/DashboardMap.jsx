import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import axios from "axios";

import HeatmapLayer from "./HeatmapLayer";
import MapLegend from "../MapLegend";
import PredictionLayer from "./PredictionLayer";

// ======================================================
// Fix Leaflet size after fullscreen changes
// ======================================================

function MapResizeHandler({ isFullscreen }) {
    const map = useMap();

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);

        return () => clearTimeout(timer);
    }, [isFullscreen, map]);

    return null;
}

// ======================================================
// Dashboard Map
// ======================================================

export default function DashboardMap() {

    const [heatData, setHeatData] = useState([]);
    const [hotspots, setHotspots] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const mapWrapperRef = useRef(null);

    // ==================================================
    // LOAD MAP DATA
    // ==================================================

    useEffect(() => {

        axios
            .get("http://localhost:5000/heatmap-data")
            .then(res => {
                console.log("KDE Heatmap Data:", res.data);
                setHeatData(res.data);
            })
            .catch(err => {
                console.error("Failed to load heatmap data:", err);
            });

        axios
            .get("http://localhost:5000/predict-all")
            .then(res => {
                console.log("Prediction Data:", res.data);
                setHotspots(res.data);
            })
            .catch(err => {
                console.error("Failed to load prediction data:", err);
            });

    }, []);

    // ==================================================
    // FULLSCREEN
    // ==================================================

    const toggleFullscreen = async () => {

        try {

            if (!document.fullscreenElement) {

                await mapWrapperRef.current?.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch (error) {

            console.error("Fullscreen error:", error);

        }

    };

    // ==================================================
    // HANDLE ESC / BROWSER FULLSCREEN CHANGE
    // ==================================================

    useEffect(() => {

        const handleFullscreenChange = () => {

            setIsFullscreen(
                document.fullscreenElement === mapWrapperRef.current
            );

        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };

    }, []);

    // ==================================================
    // UI
    // ==================================================

    return (

        <div
            ref={mapWrapperRef}
            className={
                isFullscreen
                    ? "fixed inset-0 z-[9999] bg-slate-950"
                    : "relative w-full"
            }
        >

            {/* ==================================================
                FULLSCREEN BUTTON
            ================================================== */}

            <button
                type="button"
                onClick={toggleFullscreen}
                title={
                    isFullscreen
                        ? "Exit fullscreen"
                        : "View map fullscreen"
                }
                aria-label={
                    isFullscreen
                        ? "Exit fullscreen"
                        : "View map fullscreen"
                }
                className="
                    absolute
                    top-4
                    right-4
                    z-[10000]

                    w-11
                    h-11

                    flex
                    items-center
                    justify-center

                    rounded-lg

                    bg-slate-900
                    text-white

                    border
                    border-slate-500

                    shadow-xl

                    hover:bg-slate-800
                    hover:border-cyan-400
                    hover:text-cyan-300

                    transition-all
                    duration-200
                "
            >

                {isFullscreen ? (

                    /* EXIT FULLSCREEN */
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M8 3v5H3" />
                        <path d="M3 8l5-5" />
                        <path d="M16 21v-5h5" />
                        <path d="M21 16l-5 5" />
                    </svg>

                ) : (

                    /* ENTER FULLSCREEN */
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M8 3H3v5" />
                        <path d="M3 3l5 5" />
                        <path d="M16 3h5v5" />
                        <path d="M21 3l-5 5" />
                        <path d="M8 21H3v-5" />
                        <path d="M3 21l5-5" />
                        <path d="M16 21h5v-5" />
                        <path d="M21 21l-5-5" />
                    </svg>

                )}

            </button>


            {/* ==================================================
                MAP
            ================================================== */}

            <MapContainer
                center={[12.9716, 77.5946]}
                zoom={11}
                style={{
                    height: isFullscreen
                        ? "100vh"
                        : "650px",

                    width: "100%",

                    borderRadius: isFullscreen
                        ? "0px"
                        : "12px"
                }}
            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapResizeHandler
                    isFullscreen={isFullscreen}
                />

                {/* KDE */}
                {/* <HeatmapLayer
                    data={heatData}
                /> */}

                {/* PREDICTED HOTSPOTS */}
                <PredictionLayer
                    hotspots={hotspots}
                />

                {/* LEGEND */}
                <MapLegend />

            </MapContainer>

        </div>
    );
}