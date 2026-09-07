import type { Categorie, StatutEtape, StatutProjet } from "../types";

const STATUT_PROJET_LABEL: Record<StatutProjet, string> = {
  idee: "Idée",
  preparation: "En préparation",
  en_cours: "En cours",
  pause: "Pause",
  termine: "Terminé",
  abandonne: "Abandonné",
};

const STATUT_PROJET_COLOR: Record<StatutProjet, string> = {
  idee: "var(--text-3)",
  preparation: "var(--cyan)",
  en_cours: "var(--accent)",
  pause: "#e0c34a",
  termine: "var(--lime)",
  abandonne: "var(--danger)",
};

export function StatutProjetBadge({ statut }: { statut: StatutProjet }) {
  const color = STATUT_PROJET_COLOR[statut];
  return (
    <span className="badge" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
      {STATUT_PROJET_LABEL[statut]}
    </span>
  );
}

export function CategorieBadge({ categorie }: { categorie: Categorie | undefined }) {
  if (!categorie) return null;
  return (
    <span
      className="badge"
      style={{ background: `color-mix(in srgb, ${categorie.color} 16%, transparent)`, color: categorie.color }}
    >
      {categorie.label}
    </span>
  );
}

const STATUT_ETAPE_LABEL: Record<StatutEtape, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  fait: "Fait",
  bloque: "Bloqué",
};

const STATUT_ETAPE_COLOR: Record<StatutEtape, string> = {
  a_faire: "var(--text-3)",
  en_cours: "var(--accent)",
  fait: "var(--lime)",
  bloque: "var(--danger)",
};

export function StatutEtapeBadge({ statut }: { statut: StatutEtape }) {
  const color = STATUT_ETAPE_COLOR[statut];
  return (
    <span className="badge" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
      {STATUT_ETAPE_LABEL[statut]}
    </span>
  );
}

const PRIORITE_LABEL: Record<string, string> = { basse: "Basse", moyenne: "Moy", haute: "Haute" };
const PRIORITE_COLOR: Record<string, string> = {
  basse: "var(--text-3)",
  moyenne: "var(--cyan)",
  haute: "var(--pink)",
};

export function PrioriteBadge({ priorite }: { priorite: string }) {
  const color = PRIORITE_COLOR[priorite] ?? "var(--text-3)";
  return (
    <span className="badge" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
      {PRIORITE_LABEL[priorite] ?? priorite}
    </span>
  );
}
