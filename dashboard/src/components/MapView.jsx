import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// ==========================
// ICÔNES PAR PRIORITÉ
// ==========================
const icons = {
  CRITIQUE: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  HAUTE: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  MOYENNE: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  FAIBLE: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
};

// ==========================
// ZOOM AUTOMATIQUE
// ==========================
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const bounds = L.latLngBounds(
      points.map((p) => [p.lat, p.lon])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [points, map]);

  return null;
}

// ==========================
// MAP VIEW
// ==========================
export default function MapView({ points }) {
  const center =
    points.length > 0
      ? [points[0].lat, points[0].lon]
      : [33.5731, -7.5898];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-96 w-full rounded-xl border border-slate-800"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ZOOM AUTO */}
      <FitBounds points={points} />

      {/* MARKERS */}
      {points.map((p, idx) => (
        <Marker
          key={idx}
          position={[p.lat, p.lon]}
          icon={icons[p.priorite] || icons.FAIBLE}
        >
          <Popup>
            <div className="text-xs space-y-1">
              <div><b>Image :</b> {p.image_id}</div>
              <div><b>Score :</b> {p.score}</div>
              <div><b>Priorité :</b> {p.priorite}</div>
              <div>
                ({p.lat.toFixed(5)}, {p.lon.toFixed(5)})
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
