import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Detection from "./pages/Detection";
import UploadVideo from "./pages/UploadVideo";
import Georef from "./pages/Georef";
import Score from "./pages/Score";
import Priorisation from "./pages/Priorisation";
import ExportSIG from "./pages/ExportSIG";
import Decision from "./pages/Decision"; // ✅

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Navbar />

        <main className="flex-1 flex flex-col bg-slate-950">
          <header className="h-14 border-b border-slate-800 flex items-center px-6">
            <h2 className="text-lg font-semibold text-slate-100">
              RoadSense Dashboard
            </h2>
          </header>

          <section className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/detect" element={<Detection />} />
              <Route path="/upload" element={<UploadVideo />} />
              <Route path="/georef" element={<Georef />} />
              <Route path="/score" element={<Score />} />
              <Route path="/priorisation" element={<Priorisation />} />
              <Route path="/decision" element={<Decision />} /> {/* ✅ */}
              <Route path="/export" element={<ExportSIG />} />
            </Routes>
          </section>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
