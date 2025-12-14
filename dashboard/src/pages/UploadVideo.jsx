import React, { useState } from "react";
import { API_URLS } from "../config/api";   // ✅ CORRECTION ICI

export default function UploadVideo() {
    const [file, setFile] = useState(null);
    const [responseJson, setResponseJson] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Veuillez sélectionner une vidéo.");
            return;
        }

        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URLS.ingestion}/video/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setResponseJson(data);
        } catch (err) {
            setError("Erreur lors de l'upload.");
        }

        setLoading(false);
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Upload vidéo</h1>

            <form
                onSubmit={handleUpload}
                className="bg-white p-4 shadow rounded space-y-4"
            >
                <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="border p-2 rounded w-full"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {loading ? "Envoi..." : "Uploader"}
                </button>
            </form>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
            )}

            {responseJson && (
                <pre className="bg-black text-white p-4 rounded text-sm">
          {JSON.stringify(responseJson, null, 2)}
        </pre>
            )}
        </div>
    );
}
