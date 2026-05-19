import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon issue in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onPositionChange }: MapPickerProps) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('button')) {
        return;
      }
      onPositionChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const prevPosition = useRef<[number, number] | null>(null);

  // Automatically fly to position if it changes from outside
  useEffect(() => {
    if (position) {
      const changed = !prevPosition.current || 
                      prevPosition.current[0] !== position[0] || 
                      prevPosition.current[1] !== position[1];
      if (changed) {
        map.setView(position, map.getZoom());
        prevPosition.current = [position[0], position[1]];
      }
    }
  }, [position, map]);

  // Fix the grey map/partial tile issue inside Modals
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

function MapControls({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const divRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (divRef.current) {
      L.DomEvent.disableClickPropagation(divRef.current);
    }
  }, []);

  if (!position) return null;

  return (
    <div ref={divRef} className="absolute bottom-2 right-2 z-[1000]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.setView(position, 16);
        }}
        className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-orange-600 border border-gray-200 hover:bg-orange-50 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4 12H2"/><path d="M22 12h-2"/></svg>
        Trở về vị trí của bạn
      </button>
    </div>
  );
}

export default function MapPicker({ position, onPositionChange }: MapPickerProps) {
  const defaultPosition: [number, number] = [21.0285, 105.8542]; // Hanoi default

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
      <MapContainer
        center={position || defaultPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0','mt1','mt2','mt3']}
        />
        <LocationMarker position={position} onPositionChange={onPositionChange} />
        <MapControls position={position} />
      </MapContainer>
      <div className="absolute top-2 right-2 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm text-xs text-gray-600 font-medium z-[1000] pointer-events-none">
        Click vào bản đồ để chọn vị trí
      </div>
    </div>
  );
}
