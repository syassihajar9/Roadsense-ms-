import { Link, useLocation } from "react-router-dom";
import {
    FaUpload,
    FaSearch,
    FaMapMarkerAlt,
    FaChartBar,
    FaListOl,
    FaGlobe,
    FaTachometerAlt,
    FaBalanceScale   // 👈 NOUVELLE ICÔNE
} from "react-icons/fa";

const navItems = [
    { to: "/detect", label: "Détection fissures", icon: <FaSearch /> },
    { to: "/georef", label: "Géoréférencement", icon: <FaMapMarkerAlt /> },
    { to: "/score", label: "Score de gravité", icon: <FaChartBar /> },

    // ✅ NOUVELLE FONCTIONNALITÉ
    { to: "/decision", label: "Aide à la décision", icon: <FaBalanceScale /> },

    { to: "/export", label: "Export SIG", icon: <FaGlobe /> },
];

export default function Navbar() {
    const location = useLocation();

    return (
        <aside className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800">
                <h1 className="text-xl font-bold text-sky-400">RoadSense</h1>
                <p className="text-xs text-slate-400">Monitoring des routes</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                ${
                                active
                                    ? "bg-sky-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4 py-3 text-xs text-slate-500 border-t border-slate-800">
                © 2025 RoadSense
            </div>
        </aside>
    );
}
