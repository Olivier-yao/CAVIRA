import type { ReactNode } from "react";
import "./Sidebar.css";
import {
  IconBacklog,
  IconCalendrier,
  IconObjectifs,
  IconParametres,
  IconPremierLancement,
  IconProjets,
  IconRecherche,
  IconRoadmap,
  IconRoutine,
  IconVueGlobale,
} from "./icons";

export type Screen =
  | "dashboard"
  | "projets"
  | "calendrier"
  | "roadmap"
  | "routine"
  | "objectifs"
  | "backlog"
  | "recherche"
  | "parametres"
  | "premier-lancement";

interface NavItem {
  screen: Screen;
  label: string;
  icon: ReactNode;
  count?: number;
}

interface SidebarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  counts: { projets: number; calendrier: number; objectifs: number; backlog: number };
  streakJours: number;
}

export function Sidebar({ screen, onNavigate, counts, streakJours }: SidebarProps) {
  const pilotage: NavItem[] = [
    { screen: "dashboard", label: "Vue globale", icon: <IconVueGlobale /> },
    { screen: "projets", label: "Projets", icon: <IconProjets />, count: counts.projets },
    { screen: "calendrier", label: "Calendrier", icon: <IconCalendrier />, count: counts.calendrier },
    { screen: "roadmap", label: "Roadmap", icon: <IconRoadmap /> },
    { screen: "routine", label: "Routine", icon: <IconRoutine /> },
  ];
  const vision: NavItem[] = [
    { screen: "objectifs", label: "Objectifs", icon: <IconObjectifs />, count: counts.objectifs },
    { screen: "backlog", label: "Backlog d'idées", icon: <IconBacklog />, count: counts.backlog },
  ];
  const ressources: NavItem[] = [
    { screen: "recherche", label: "Recherche notes", icon: <IconRecherche /> },
    { screen: "parametres", label: "Paramètres", icon: <IconParametres /> },
    { screen: "premier-lancement", label: "Premier lancement", icon: <IconPremierLancement /> },
  ];

  const renderItem = (item: NavItem) => {
    const active = item.screen === screen;
    return (
      <button
        key={item.screen}
        className={`nav-item${active ? " nav-item--active" : ""}`}
        onClick={() => onNavigate(item.screen)}
      >
        <span className="nav-item__icon">{item.icon}</span>
        <span className="nav-item__label">{item.label}</span>
        {item.count !== undefined && <span className="nav-item__count">{item.count}</span>}
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <div className="sidebar__section">
          <div className="sidebar__section-title">Pilotage</div>
          {pilotage.map(renderItem)}
        </div>
        <div className="sidebar__section">
          <div className="sidebar__section-title">Vision</div>
          {vision.map(renderItem)}
        </div>
        <div className="sidebar__section">
          <div className="sidebar__section-title">Ressources</div>
          {ressources.map(renderItem)}
        </div>
      </nav>
      <div className="streak-card">
        <div className="streak-card__title">Régularité</div>
        <div className="streak-card__row">
          <span className="streak-card__number">{streakJours}</span>
          <span className="streak-card__label">jours d'affilée</span>
        </div>
        <div className="streak-card__bars">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={`streak-card__bar${i < Math.min(streakJours, 10) ? " streak-card__bar--on" : ""}`} />
          ))}
        </div>
      </div>
    </aside>
  );
}
