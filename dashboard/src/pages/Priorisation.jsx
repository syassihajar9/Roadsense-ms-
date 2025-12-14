import React, { useState } from "react";
import { API_URLS } from "../config/api";   // ✅ CORRECTION ICI

export default function Priorisation() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            const res = await fetch(`${API_URLS.prioritisation}/prioritisation`);
            const data = await res.json();
            setItems(data.sort((a, b) => a.rang - b.rang));
        } catch {
            setError("Erreur API");
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Priorisation</h1>

            <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={loadData}
            >
                Charger la priorisation
            </button>

            {error && <div className="text-red-600">{error}</div>}

            <table className="w-full bg-white shadow rounded mt-4 text-sm">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">Rang</th>
                    <th className="p-2">ID</th>
                    <th className="p-2">Gravité</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Densité</th>
                    <th className="p-2">Localisation</th>
                </tr>
                </thead>

                <tbody>
                {items.map((i) => (
                    <tr key={i.id} className="border-t">
                        <td className="p-2">{i.rang}</td>
                        <td className="p-2">{i.id}</td>
                        <td className="p-2">{i.gravite}</td>
                        <td className="p-2">{i.score}</td>
                        <td className="p-2">{i.densite_fissures}</td>
                        <td className="p-2">{i.localisation}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
