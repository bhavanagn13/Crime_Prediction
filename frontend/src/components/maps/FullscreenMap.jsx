import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";

function MapResizeHandler({ isFullscreen }) {
  const map = useMap();

  useEffect(() => {
    // Give the browser time to finish resizing the container
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  return null;
}

export default function FullscreenMap({
  children,
  title = "Map",
  className = "",
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = useRef(null);

  // Escape key closes fullscreen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  // Prevent dashboard from scrolling behind fullscreen map
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  return (
    <div
      ref={mapWrapperRef}
      className={`
        relative
        ${isFullscreen ? "fixed inset-0 z-[9999] bg-[#080d14] p-0" : ""}
        ${className}
      `}
    >
      {/* Fullscreen header */}
      {isFullscreen && (
        <div
          className="
            absolute
            top-0
            left-0
            right-0
            z-[10000]
            flex
            items-center
            justify-between
            px-5
            py-3
            bg-[#0b111a]/95
            backdrop-blur-md
            border-b
            border-slate-700
          "
        >
          <div>
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>

            <p className="text-xs text-slate-400">
              Fullscreen Map View
            </p>
          </div>

          <button
            onClick={() => setIsFullscreen(false)}
            className="
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-lg
              bg-slate-800
              hover:bg-slate-700
              text-white
              border
              border-slate-600
              transition
            "
          >
            <span className="text-lg">✕</span>
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* Fullscreen button */}
      {!isFullscreen && (
        <button
          onClick={() => setIsFullscreen(true)}
          title="Open fullscreen"
          className="
            absolute
            top-3
            right-3
            z-[1000]
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-lg
            bg-[#0b111a]/90
            hover:bg-[#162231]
            text-white
            border
            border-slate-600
            shadow-lg
            backdrop-blur-sm
            transition
          "
        >
          <span className="text-xl">⛶</span>
        </button>
      )}

      {/* Map */}
      <div
        className={
          isFullscreen
            ? "w-full h-screen"
            : "w-full"
        }
      >
        {children}

        {isFullscreen && (
          <MapResizeHandler isFullscreen={isFullscreen} />
        )}
      </div>
    </div>
  );
}