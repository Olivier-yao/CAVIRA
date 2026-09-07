import type { AppData, Objectif, Projet } from "../types";
import { projetProgressionPct } from "./ficheProjet";

export interface ObjectifCard {
  objectif: Objectif;
  progression: number;
  projets: Projet[];
  horizon: string;
}

function parseSql(iso: string): Date {
  return new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
}

export function buildObjectifCards(data: AppData): ObjectifCard[] {
  const projetIdsByObjectif = new Map<string, string[]>();
  for (const po of data.projetObjectifs) {
    const list = projetIdsByObjectif.get(po.objectif_id) ?? [];
    list.push(po.projet_id);
    projetIdsByObjectif.set(po.objectif_id, list);
  }

  return data.objectifs.map((objectif) => {
    const projets = (projetIdsByObjectif.get(objectif.id) ?? [])
      .map((id) => data.projets.find((p) => p.id === id))
      .filter((p): p is Projet => !!p);

    const progression = projets.length
      ? Math.round(projets.reduce((s, p) => s + projetProgressionPct(data.etapes, p.id), 0) / projets.length)
      : 0;

    const dates: Date[] = [];
    for (const p of projets) {
      if (p.echeance_date) dates.push(parseSql(p.echeance_date));
      for (const e of data.etapes) {
        if (e.projet_id === p.id && e.date_cible && e.statut !== "fait") dates.push(parseSql(e.date_cible));
      }
    }
    const horizon = dates.length ? String(new Date(Math.max(...dates.map((d) => d.getTime()))).getFullYear()) : "continu";

    return { objectif, progression, projets, horizon };
  });
}
