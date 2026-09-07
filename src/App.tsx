import { useEffect, useState } from "react";
import "./App.css";
import { Sidebar, type Screen } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./screens/Dashboard";
import { loadDashboardData } from "./data/db";
import { computeDashboardStats, type DashboardStats } from "./lib/dashboard";
import type { DashboardData } from "./types";

function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "CAVIRA";
    loadDashboardData()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  const stats: DashboardStats | null = data ? computeDashboardStats(data) : null;

  const counts = {
    projets: data?.projets.filter((p) => p.statut !== "termine" && p.statut !== "abandonne").length ?? 0,
    calendrier: data?.etapes.filter((e) => e.date_cible).length ?? 0,
    objectifs: data?.objectifs.length ?? 0,
    backlog: 0,
  };

  return (
    <div className="app-shell">
      <Sidebar screen={screen} onNavigate={setScreen} counts={counts} streakJours={stats?.streakJours ?? 0} />
      <div className="app-main">
        <TopBar />
        <div className="app-content">
          {error && <div className="app-error">Erreur de chargement : {error}</div>}
          {!error && !data && <div className="app-loading">Chargement…</div>}
          {data && stats && screen === "dashboard" && <Dashboard data={data} stats={stats} />}
        </div>
      </div>
    </div>
  );
}

export default App;
