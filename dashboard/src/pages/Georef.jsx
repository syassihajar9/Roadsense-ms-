import { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import MapView from "../components/MapView";
import { API_URLS } from "../config/api";

/* =========================
   Page Géoréférencement
========================= */
export default function Georef() {
  const [response, setResponse] = useState(null);
  const [points, setPoints] = useState([]);

  const [form, setForm] = useState({
    image_id: "",
    lon: "",
    lat: "",
  });

  const [fromDetection, setFromDetection] = useState(false);

  /* =========================
     AUTO-CHARGEMENT DEPUIS
     LA DÉTECTION IA
  ========================= */
  useEffect(() => {
    const stored = localStorage.getItem("last_georef");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    if (!parsed || parsed.length === 0) return;

    const p = parsed[0];

    setForm({
      image_id: p.image_id || "",
      lon: p.lon,
      lat: p.lat,
    });

    setPoints(parsed);
    setFromDetection(true);
  }, []);

  /* =========================
     SOUMISSION POSTGIS
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      image_id: form.image_id,
      lon: parseFloat(form.lon),
      lat: parseFloat(form.lat),
    };

    try {
      const res = await fetch(`${API_URLS.georef}/georef`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);

      // Ajout point si manuel
      if (!fromDetection) {
        setPoints([{ lat: payload.lat, lon: payload.lon }]);
      }
    } catch (err) {
      console.error("❌ Erreur géoréférencement :", err);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* FORMULAIRE */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-3">
            <FaMapMarkerAlt /> Géoréférencement d’une image
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            {/* IMAGE ID */}
            <input
              readOnly={fromDetection}
              className={`w-full rounded-md px-3 py-2 border 
                ${fromDetection
                  ? "bg-slate-950 text-slate-400 cursor-not-allowed border-slate-700"
                  : "bg-slate-950 text-slate-100 border-slate-700"}`}
              value={form.image_id}
              placeholder="image_id"
            />

            {/* COORDONNÉES */}
            <div className="flex gap-2">
              <input
                readOnly={fromDetection}
                className={`w-1/2 rounded-md px-3 py-2 border
                  ${fromDetection
                    ? "bg-slate-950 text-slate-400 cursor-not-allowed border-slate-700"
                    : "bg-slate-950 text-slate-100 border-slate-700"}`}
                value={form.lon}
                placeholder="Longitude"
              />

              <input
                readOnly={fromDetection}
                className={`w-1/2 rounded-md px-3 py-2 border
                  ${fromDetection
                    ? "bg-slate-950 text-slate-400 cursor-not-allowed border-slate-700"
                    : "bg-slate-950 text-slate-100 border-slate-700"}`}
                value={form.lat}
                placeholder="Latitude"
              />
            </div>

            
          </form>
        </div>

        {/* RÉPONSE API */}
        {response && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Réponse API
            </h3>
            <pre className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-64 overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* CARTE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">
          Carte des points géoréférencés
        </h3>
        <MapView points={points} />
      </div>
    </div>
  );
}
