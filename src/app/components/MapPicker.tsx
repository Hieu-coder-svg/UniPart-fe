import { useEffect } from "react";
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
      onPositionChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Automatically fly to position if it changes from outside
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
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
      </MapContainer>
      <div className="absolute top-2 right-2 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm text-xs text-gray-600 font-medium z-[1000] pointer-events-none">
        Click vào bản đồ để chọn vị trí
      </div>
    </div>
  );
}
