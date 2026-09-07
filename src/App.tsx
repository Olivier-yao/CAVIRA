import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Sidebar, type Screen } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./screens/Dashboard";
import { Projets } from "./screens/Projets";
import { FicheProjet } from "./screens/FicheProjet";
import { loadAppData } from "./data/db";
import { computeDashboardStats, type DashboardStats } from "./lib/dashboard";
import type { AppData } from "./types";

function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [openProjetId, setOpenProjetId] = useState<string | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    return loadAppData()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    document.title = "CAVIRA";
    refreshData();
  }, [refreshData]);

  const stats: DashboardStats | null = data ? computeDashboardStats(data) : null;

  const counts = {
    projets: data?.projets.filter((p) => p.statut !== "termine" && p.statut !== "abandonne").length ?? 0,
    calendrier: data?.etapes.filter((e) => e.date_cible).length ?? 0,
    objectifs: data?.objectifs.length ?? 0,
    backlog: 0,
  };

  function openProjet(id: string) {
    setOpenProjetId(id);
  }

  function backToProjets() {
    setOpenProjetId(null);
    setScreen("projets");
  }

  function handleSidebarNavigate(next: Screen) {
    setOpenProjetId(null);
    setScreen(next);
  }

  return (
    <div className="app-shell">
      <Sidebar screen={screen} onNavigate={handleSidebarNavigate} counts={counts} streakJours={stats?.streakJours ?? 0} />
      <div className="app-main">
        <TopBar />
        <div className="app-content">
          {error && <div className="app-error">Erreur de chargement : {error}</div>}
          {!error && !data && <div className="app-loading">Chargement…</div>}
          {data && stats && !openProjetId && screen === "dashboard" && (
            <Dashboard data={data} stats={stats} onOpenProjet={openProjet} />
          )}
          {data && !openProjetId && screen === "projets" && <Projets data={data} onOpenProjet={openProjet} />}
          {data && openProjetId && (
            <FicheProjet data={data} projetId={openProjetId} onBack={backToProjets} onDataChanged={refreshData} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
