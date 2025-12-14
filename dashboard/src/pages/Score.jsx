import React, { useState } from "react";
import { API_URLS } from "../config/api";   // ✅ CORRECTION ICI

export default function Score() {
    const [scores, setScores] = useState([]);
    const [error, setError] = useState(null);

    const loadScores = async () => {
        try {
            const res = await fetch(`${API_URLS.score}/score`);
            const data = await res.json();
            setScores(data);
        } catch {
            setError("Erreur API");
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Score de gravité</h1>

            <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={loadScores}
            >
                Charger les scores
            </button>

            {error && <div className="text-red-600">{error}</div>}

            <table className="min-w-full bg-white shadow rounded mt-4">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">ID</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Niveau</th>
                </tr>
                </thead>

                <tbody>
                {scores.map((s) => (
                    <tr key={s.fissure_id} className="border-t">
                        <td className="p-2">{s.fissure_id}</td>
                        <td className="p-2">{s.score}</td>
                        <td className="p-2">
                <span className="px-2 py-1 rounded bg-red-100 text-red-700">
                  {s.niveau}
                </span>
                        </td>
                    </tr>
                ))}

                {scores.length === 0 && (
                    <tr>
                        <td colSpan="3" className="p-4 text-center text-gray-400 italic">
                            Aucune donnée
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
