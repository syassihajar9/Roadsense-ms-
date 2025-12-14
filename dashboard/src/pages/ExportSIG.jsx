import React, { useState } from "react";
import { API_URLS } from "../config/api";   // ✅ CORRECTION ICI

export default function ExportSIG() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const download = async (format) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URLS.export}/export?format=${format}`);
            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = format === "geojson" ? "roadsense.geojson" : "roadsense.zip";
            a.click();
        } catch {
            setError("Erreur lors du téléchargement.");
        }

        setLoading(false);
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Export SIG</h1>

            <div className="space-x-2">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                    onClick={() => download("geojson")}
                >
                    GeoJSON
                </button>

                <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                    onClick={() => download("shapefile")}
                >
                    Shapefile
                </button>
            </div>

            {error && <div className="text-red-600">{error}</div>}
        </div>
    );
}
