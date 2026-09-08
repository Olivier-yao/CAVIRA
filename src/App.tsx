import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Sidebar, type Screen } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ProjetModal } from "./components/ProjetModal";
import { CommandPalette } from "./components/CommandPalette";
import { Dashboard } from "./screens/Dashboard";
import { Projets } from "./screens/Projets";
import { Calendrier } from "./screens/Calendrier";
import { Roadmap } from "./screens/Roadmap";
import { Objectifs } from "./screens/Objectifs";
import { Backlog } from "./screens/Backlog";
import { RechercheNotes } from "./screens/RechercheNotes";
import { Parametres } from "./screens/Parametres";
import { PremierLancement } from "./screens/PremierLancement";
import { FicheProjet } from "./screens/FicheProjet";
import { loadAppData } from "./data/db";
import { computeDashboardStats, type DashboardStats } from "./lib/dashboard";
import { buildCalendarEvents } from "./lib/calendrier";
import type { AppData } from "./types";

function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [openProjetId, setOpenProjetId] = useState<string | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [projetAEditerId, setProjetAEditerId] = useState<string | null>(null);
  const [paletteOuverte, setPaletteOuverte] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOuverte(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    calendrier: data ? buildCalendarEvents(data).length : 0,
    objectifs: data?.objectifs.length ?? 0,
    backlog: data?.idees.length ?? 0,
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

  function handleNoterIdee() {
    setOpenProjetId(null);
    setScreen("backlog");
  }

  async function handleProjetEnregistre(id: string) {
    setModalOuvert(false);
    setProjetAEditerId(null);
    await refreshData();
    setOpenProjetId(id);
  }

  async function handleProjetSupprime() {
    setProjetAEditerId(null);
    setOpenProjetId(null);
    setScreen("projets");
    await refreshData();
  }

  const aucunProjet = data ? data.projets.length === 0 : false;
  const montrerPremierLancement = !openProjetId && (screen === "premier-lancement" || (screen === "dashboard" && aucunProjet));

  const projetAEditer = data && projetAEditerId ? data.projets.find((p) => p.id === projetAEditerId) : undefined;
  const objectifIdsDuProjetAEditer = data && projetAEditerId
    ? data.projetObjectifs.filter((po) => po.projet_id === projetAEditerId).map((po) => po.objectif_id)
    : undefined;

  return (
    <div className="app-shell">
      <Sidebar screen={screen} onNavigate={handleSidebarNavigate} counts={counts} streakJours={stats?.streakJours ?? 0} />
      <div className="app-main">
        <TopBar onNouveauProjet={() => setModalOuvert(true)} onOpenPalette={() => setPaletteOuverte(true)} />
        <div className="app-content">
          {error && <div className="app-error">Erreur de chargement : {error}</div>}
          {!error && !data && <div className="app-loading">Chargement…</div>}
          {data && montrerPremierLancement && (
            <PremierLancement onCreerProjet={() => setModalOuvert(true)} onNoterIdee={handleNoterIdee} />
          )}
          {data && !openProjetId && !montrerPremierLancement && screen === "dashboard" && (
            <Dashboard data={data} onOpenProjet={openProjet} />
          )}
          {data && !openProjetId && screen === "projets" && <Projets data={data} onOpenProjet={openProjet} />}
          {data && !openProjetId && screen === "calendrier" && (
            <Calendrier data={data} onOpenProjet={openProjet} onDataChanged={refreshData} />
          )}
          {data && !openProjetId && screen === "roadmap" && (
            <Roadmap data={data} onOpenProjet={openProjet} onDataChanged={refreshData} />
          )}
          {data && !openProjetId && screen === "objectifs" && (
            <Objectifs data={data} onOpenProjet={openProjet} onDataChanged={refreshData} />
          )}
          {data && !openProjetId && screen === "backlog" && (
            <Backlog data={data} onOpenProjet={openProjet} onDataChanged={refreshData} />
          )}
          {data && !openProjetId && screen === "recherche" && <RechercheNotes data={data} onOpenProjet={openProjet} />}
          {data && !openProjetId && screen === "parametres" && (
            <Parametres data={data} onDataChanged={refreshData} />
          )}
          {data && openProjetId && (
            <FicheProjet
              data={data}
              projetId={openProjetId}
              onBack={backToProjets}
              onDataChanged={refreshData}
              onModifier={() => setProjetAEditerId(openProjetId)}
              onOpenProjet={openProjet}
            />
          )}
        </div>
      </div>
      {paletteOuverte && data && (
        <CommandPalette
          data={data}
          onClose={() => setPaletteOuverte(false)}
          onOpenProjet={(id) => {
            setOpenProjetId(id);
          }}
          onNavigate={handleSidebarNavigate}
        />
      )}
      {modalOuvert && data && (
        <ProjetModal data={data} onClose={() => setModalOuvert(false)} onSaved={handleProjetEnregistre} />
      )}
      {projetAEditer && data && (
        <ProjetModal
          data={data}
          projetExistant={projetAEditer}
          objectifIdsExistants={objectifIdsDuProjetAEditer}
          onClose={() => setProjetAEditerId(null)}
          onSaved={handleProjetEnregistre}
          onDeleted={handleProjetSupprime}
        />
      )}
    </div>
  );
}

export default App;
