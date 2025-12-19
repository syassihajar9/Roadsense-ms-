import { useState } from "react";
import axios from "axios";
import {
  FaExclamationTriangle,
  FaEuroSign,
  FaClock,
  FaChartLine,
} from "react-icons/fa";

/* =========================
   Page Aide à la décision
========================= */
export default function Decision() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     Charger le cas réel
  ========================= */
  const loadDecision = async () => {
    setLoading(true);
    setError(null);

    try {
      // 🔑 Récupération de la détection réelle
      const detection = JSON.parse(
        localStorage.getItem("last_detection")
      );

      if (!detection) {
        throw new Error(
          "Aucune détection trouvée. Veuillez analyser une image."
        );
      }

      const response = await axios.post(
        "http://localhost:9004/score",
        detection,
        { headers: { "Content-Type": "application/json" } }
      );

      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors du calcul décisionnel");
    } finally {
      setLoading(false);
    }
  };

  const scoreResult = data?.score_result;
  const simulation = data?.simulation;

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      {/* TITRE */}
      <h1 className="text-3xl font-bold text-blue-400">
        Aide à la décision
      </h1>

      <p className="text-slate-400 mt-2 max-w-2xl">
        Estimation du coût, du risque et de la priorité
        d’intervention à partir des dommages détectés par l’IA.
      </p>

      {/* BOUTON */}
      <button
        onClick={loadDecision}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-blue-600 rounded-lg
                   hover:bg-blue-700 transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Analyse en cours..." : "Charger un cas réel"}
      </button>

      {/* ERREUR */}
      {error && (
        <p className="mt-4 text-red-400 font-semibold">
          {error}
        </p>
      )}

      {/* =========================
           RÉSULTAT DÉCISIONNEL
      ========================= */}
      {scoreResult && simulation && (
        <div className="mt-10 max-w-3xl mx-auto
                        bg-gradient-to-br from-slate-800 to-slate-900
                        border border-slate-700 rounded-2xl
                        p-6 shadow-xl">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">
              Résumé décisionnel
            </h2>

            <span className="px-4 py-1 rounded-full text-sm font-bold
                             bg-red-600/20 text-red-400
                             border border-red-500/40">
              {scoreResult.priorite}
            </span>
          </div>

          {/* SCORE CENTRAL */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-red-500
                            bg-slate-900 flex flex-col items-center
                            justify-center shadow-inner">
              <span className="text-4xl font-extrabold">
                {scoreResult.score}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Score de gravité
              </span>
            </div>
          </div>

          {/* IMPACTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DecisionItem
              icon={<FaEuroSign />}
              label="Coût estimé"
              value={`${simulation.estimated_cost} €`}
              color="text-yellow-400"
            />

            <DecisionItem
              icon={<FaClock />}
              label="Risque à 30 jours"
              value={`${simulation.risk_30_days} %`}
              color="text-orange-400"
            />

            <DecisionItem
              icon={<FaClock />}
              label="Risque à 60 jours"
              value={`${simulation.risk_60_days} %`}
              color="text-red-400"
            />
          </div>

          {/* RECOMMANDATION */}
          <div className="mt-6 p-4 rounded-lg
                          bg-red-600/10 border border-red-500/30
                          flex items-center gap-3
                          text-red-400 font-semibold">
            <FaExclamationTriangle />
            {simulation.recommendation}
          </div>

          {/* FOOTER INFO */}
          <p className="text-xs text-slate-500 mt-4 text-center">
            Les indicateurs sont calculés automatiquement à partir
            des dommages détectés par l’IA.
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================
   Composant Impact
========================= */
function DecisionItem({ icon, label, value, color }) {
  return (
    <div className="bg-slate-900 rounded-xl p-4
                    border border-slate-700
                    flex items-center gap-3">
      <div className={`text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
