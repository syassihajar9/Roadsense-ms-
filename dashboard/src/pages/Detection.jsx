import { useState, useEffect } from "react";
import { API_URLS } from "../config/api";
import MapView from "../components/MapView";

/* =========================
   Page Detection
========================= */
export default function Detection() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [scoreResult, setScoreResult] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);




  /* =========================
     Détection YOLO
  ========================= */
  const handleDetect = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Veuillez choisir une image");
      return;
    }

    try {
      setLoading(true);
      setData(null);
      setScoreResult(null);

      const formData = new FormData();

      // 🔴 CORRECTION MAJEURE ICI
      // FastAPI attend "file", PAS "image"
      formData.append("file", file);

      const res = await fetch(`${API_URLS.detection}/detect`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const json = await res.json();
      console.log("✅ Résultat détection :", json);
      
      const normalizedData = {
  image_id: json.image_id,
  damages: json.damages ?? json.detections ?? [],
  annotated_image_url:
    json.annotated_image_url ??
    json.annotated_image ??
    null,
};

setData(normalizedData);
    } catch (err) {
      console.error("❌ Erreur détection :", err);
      alert("Erreur lors de l'analyse (voir console)");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Calcul score gravité
  ========================= */
  const handleSendToScore = async () => {
    if (!data || !data.damages || data.damages.length === 0) return;

    try {
      setScoreLoading(true);
      setScoreResult(null);

      const d = data.damages[0];

      const classMap = {
        pothole: 0,
        crack: 1,
        open_manhole: 2,
      };

      const className = d.class
        ?.toLowerCase()
        ?.replace(" ", "_")
        ?.trim();

      const classId = classMap[className] ?? 0;

      const payload = {
        image_id: data.image_id, // ✅ ID backend
        class_id: classId,
        confidence: d.confidence,
        bbox: d.bbox,
        lon: -7.5898,
        lat: 33.5731,
      };
      localStorage.setItem("last_detection", JSON.stringify(payload));

      const res = await fetch(`${API_URLS.score}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur calcul score");

      const json = await res.json();
      console.log("✅ Résultat score :", json);

  const lat = Number(json.score_result.location?.latitude);
const lon = Number(json.score_result.location?.longitude);

setScoreResult({
  score: json.score_result.score,
  priorite: json.score_result.priorite,
  location: { lat, lon },
});
// 🔑 SAUVEGARDE POUR LA PAGE GÉORÉFÉRENCEMENT
localStorage.setItem(
  "last_georef",
  JSON.stringify([
    {
      lat,
      lon,
      image_id: data.image_id,
      score: json.score_result.score,
      priorite: json.score_result.priorite,
    },
  ])
);

// ✅ AJOUT AUTOMATIQUE SUR LA CARTE
if (Number.isFinite(lat) && Number.isFinite(lon)) {
  setMapPoints((prev) => [
    ...prev,
    {
      lat,
      lon,
      image_id: data.image_id,
      score: json.score_result.score,
      priorite: json.score_result.priorite,
    },
  ]);
}


    } catch (err) {
      console.error("❌ Erreur score :", err);
      alert("Erreur lors du calcul du score");
    } finally {
      setScoreLoading(false);
    }
  };

  /* =========================
     Helpers
  ========================= */
  const totalDamages = data?.damages?.length ?? 0;

  const mainType =
    totalDamages > 0 ? data.damages[0].class : "Aucun dommage";

  const maxConfidence =
    totalDamages > 0
      ? `${Math.max(
          ...data.damages.map((d) => d.confidence * 100)
        ).toFixed(1)} %`
      : "0 %";

  /* =========================
     UI
  ========================= */
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 text-slate-100">
      <h1 className="text-3xl font-bold">
        Détection des dommages routiers
      </h1>

      {/* Upload */}
      <form
        onSubmit={handleDetect}
        className="flex gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="flex-1 bg-slate-800 p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 px-6 py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Analyse..." : "Analyser"}
        </button>
      </form>

      {/* Résultats YOLO */}
      {data && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Dommages détectés" value={totalDamages} />
            <KpiCard title="Type principal" value={mainType} />
            <KpiCard title="Confiance max" value={maxConfidence} />
          </div>

          {/* Image + détails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              {data.annotated_image_url ? (
                <img
                  src={`${API_URLS.detection}${data.annotated_image_url}`}
                  alt="annotated"
                  className="rounded w-full"
                />
              ) : (
                <p className="text-slate-400 text-sm">
                  Image annotée non disponible
                </p>
              )}
            </div>

            <div className="space-y-3">
              {data.damages.map((d, i) => (
                <div
                  key={i}
                  className="bg-slate-900 p-4 rounded-lg border border-slate-800"
                >
                  <p className="font-semibold">{d.class}</p>
                  <p className="text-xs text-slate-400">
                    Confiance : {(d.confidence * 100).toFixed(1)} %
                  </p>
                  <p className="text-xs text-slate-500">
                    bbox : [{d.bbox.map((v) => Math.round(v)).join(", ")}]
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton score */}
          <button
            type="button"
            onClick={handleSendToScore}
            disabled={scoreLoading || totalDamages === 0}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold"
          >
            {scoreLoading
              ? "Calcul du score..."
              : "Calculer le score de gravité"}
          </button>

          {/* Résultat score */}
          {scoreResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-slate-400 mb-3">
                Score de gravité
              </p>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs text-slate-500">Gravité</p>
                  <p className="text-2xl font-bold text-white">
                    {scoreResult.score}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Priorité</p>
                  <span className="px-3 py-1 rounded text-sm font-semibold bg-blue-600">
                    {scoreResult.priorite.toUpperCase()}
                  </span>
                </div>

                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-500">Localisation</p>
                  <p className="text-sm text-slate-300">
                    {scoreResult.location.lat}, {scoreResult.location.lon}
                  </p>
                </div>
              </div>
            </div>
          )}
        {mapPoints.length > 0 && (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mt-4">
    <p className="text-sm text-slate-400 mb-2">
      Carte des dommages détectés
    </p>

    <MapView points={mapPoints} />
  </div>
)}


        </>
      )}
    </div>
  );
}

/* =========================
   KPI Card
========================= */
function KpiCard({ title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-blue-400 mt-2">{value}</p>
    </div>
  );
}
