import React from "react";
import ReactDOM from "react-dom/client";

// Import correct du fichier API
import { API_URLS } from "./config/api";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App api={API_URLS} />
    </React.StrictMode>
);
