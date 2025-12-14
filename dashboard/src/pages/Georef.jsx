import { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import MapView from "../components/MapView";
import { API_URLS } from "../config/api";   // ✅ IMPORT CORRECT

export default function Georef() {
    const [response, setResponse] = useState(null);
    const [points, setPoints] = useState([]);

    const [form, setForm] = useState({
        image_id: "",
        lon: "",
        lat: "",
    });

    const handleChange = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

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

            // Ajouter point sur la carte
            setPoints((prev) => [...prev, { lat: payload.lat, lon: payload.lon }]);

        } catch (error) {
            console.error("Erreur API :", error);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Formulaire */}
            <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-3">
                        <FaMapMarkerAlt /> Géoréférencement d'une image
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                        <input
                            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-100"
                            placeholder="image_id"
                            value={form.image_id}
                            onChange={(e) => handleChange("image_id", e.target.value)}
                        />

                        <div className="flex gap-2">
                            <input
                                className="w-1/2 rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-100"
                                placeholder="Longitude"
                                value={form.lon}
                                onChange={(e) => handleChange("lon", e.target.value)}
                            />
                            <input
                                className="w-1/2 rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-100"
                                placeholder="Latitude"
                                value={form.lat}
                                onChange={(e) => handleChange("lat", e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-500 text-sm"
                        >
                            Enregistrer dans PostGIS
                        </button>
                    </form>
                </div>

                {/* Réponse API */}
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

            {/* Carte */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                    Carte des points géoréférencés
                </h3>
                <MapView points={points} />
            </div>
        </div>
    );
}
