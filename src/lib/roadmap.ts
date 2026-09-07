import type { AppData, Projet } from "../types";
import { projetProgressionPct } from "./ficheProjet";

export interface Trimestre {
  annee: number;
  trimestre: 1 | 2 | 3 | 4;
}

export interface RoadmapRow {
  projet: Projet;
  objectifTitre: string | null;
  categorieColor: string;
  progression: number;
  startIndex: number;
  endIndex: number;
  continu: boolean;
}

function trimestreDeDate(d: Date): Trimestre {
  return { annee: d.getFullYear(), trimestre: (Math.floor(d.getMonth() / 3) + 1) as 1 | 2 | 3 | 4 };
}

function indexDepuis(base: Trimestre, cible: Trimestre): number {
  return (cible.annee - base.annee) * 4 + (cible.trimestre - base.trimestre);
}

export function buildTimelineTrimestres(depuis: Date, nb = 6): Trimestre[] {
  const base = trimestreDeDate(depuis);
  const result: Trimestre[] = [];
  for (let i = 0; i < nb; i++) {
    const t = base.trimestre - 1 + i;
    result.push({ annee: base.annee + Math.floor(t / 4), trimestre: ((((t % 4) + 4) % 4) + 1) as 1 | 2 | 3 | 4 });
  }
  return result;
}

function parseSql(iso: string): Date {
  return new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
}

export function buildRoadmapRows(data: AppData, depuis: Date, nbTrimestres = 6): RoadmapRow[] {
  const baseTrimestre = trimestreDeDate(depuis);
  const categorieColor = new Map(data.categories.map((c) => [c.id, c.color]));
  const objectifById = new Map(data.objectifs.map((o) => [o.id, o]));

  const rows: RoadmapRow[] = data.projets
    .filter((p) => p.statut !== "abandonne")
    .map((projet) => {
      const debut = parseSql(projet.created_at);
      const etapesDuProjet = data.etapes.filter((e) => e.projet_id === projet.id);

      const datesFin: Date[] = [];
      if (projet.echeance_date) datesFin.push(parseSql(projet.echeance_date));
      for (const e of etapesDuProjet) {
        if (e.date_cible && e.statut !== "fait") datesFin.push(parseSql(e.date_cible));
      }
      const fin = datesFin.length ? new Date(Math.max(...datesFin.map((d) => d.getTime()))) : null;

      const startIndex = Math.max(0, indexDepuis(baseTrimestre, trimestreDeDate(debut)));
      const continu = fin === null;
      const endIndex = continu ? nbTrimestres - 1 : Math.min(nbTrimestres - 1, Math.max(startIndex, indexDepuis(baseTrimestre, trimestreDeDate(fin))));

      return {
        projet,
        objectifTitre: projet.objectif_id ? (objectifById.get(projet.objectif_id)?.titre ?? null) : null,
        categorieColor: categorieColor.get(projet.categorie_id) ?? "var(--text-3)",
        progression: projetProgressionPct(data.etapes, projet.id),
        startIndex,
        endIndex,
        continu,
      };
    });

  rows.sort((a, b) => a.startIndex - b.startIndex || a.projet.titre.localeCompare(b.projet.titre));
  return rows;
}
