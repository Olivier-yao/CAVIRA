import type { AppData, CalendrierEntry, JournalEntry, Note, PlanEtape, Projet } from "../types";
import { calculerStreakJours, daysUntil, toLocalDateKey } from "./format";

export interface EtapeNode extends PlanEtape {
  enfants: EtapeNode[];
  code: string;
}

export interface RepartitionEtapes {
  fait: number;
  en_cours: number;
  a_faire: number;
  bloque: number;
  total: number;
}

export interface SyntheseFinanciere {
  totalDepense: number;
  totalEconomise: number;
  totalBenefices: number;
  bilanNet: number;
  nbActions: number;
  seuilDepasse: boolean;
  seuil: number | null;
  derivePct: number | null;
}

export interface CalendrierItem {
  id: string;
  titre: string;
  sousTitre: string;
  date: string;
  isJalon: boolean;
}

export interface ChargeTravail {
  sessionsCetteSemaine: number;
  echeances10j: number;
}

export function buildArbreEtapes(etapes: PlanEtape[], projetId: string): EtapeNode[] {
  const les = etapes.filter((e) => e.projet_id === projetId);
  const parents = les.filter((e) => !e.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  return parents.map((p) => ({
    ...p,
    code: String(p.sort_order),
    enfants: les
      .filter((e) => e.parent_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ ...c, code: `${p.sort_order}.${c.sort_order}`, enfants: [] })),
  }));
}

export function repartitionEtapes(etapes: PlanEtape[], projetId: string): RepartitionEtapes {
  const les = etapes.filter((e) => e.projet_id === projetId);
  return {
    fait: les.filter((e) => e.statut === "fait").length,
    en_cours: les.filter((e) => e.statut === "en_cours").length,
    a_faire: les.filter((e) => e.statut === "a_faire").length,
    bloque: les.filter((e) => e.statut === "bloque").length,
    total: les.length,
  };
}

export function syntheseFinanciere(journal: JournalEntry[], projet: Projet, joursFenetre = 30): SyntheseFinanciere {
  const seuilDate = new Date();
  seuilDate.setDate(seuilDate.getDate() - joursFenetre);
  const les = journal.filter((j) => j.projet_id === projet.id && new Date(j.created_at) >= seuilDate);

  const sum = (type: JournalEntry["type"]) =>
    les.filter((j) => j.type === type).reduce((s, j) => s + (j.montant ?? 0), 0);

  const totalDepense = Math.abs(sum("depense"));
  const totalEconomise = sum("economie");
  const totalBenefices = sum("benefice_estime");
  const nbActions = les.filter((j) => j.type === "action").length;

  const seuil = projet.seuil_depenses;
  const seuilDepasse = seuil !== null && totalDepense > seuil;
  const derivePct = seuil !== null && seuil > 0 ? Math.round(((totalDepense - seuil) / seuil) * 100) : null;

  return {
    totalDepense,
    totalEconomise,
    totalBenefices,
    bilanNet: totalEconomise + totalBenefices - totalDepense,
    nbActions,
    seuilDepasse,
    seuil,
    derivePct,
  };
}

export function calendrierItemsProjet(
  etapes: PlanEtape[],
  calendrier: CalendrierEntry[],
  projetId: string,
): CalendrierItem[] {
  const items: CalendrierItem[] = [];

  const toutesLesEtapesDuProjet = etapes.filter((e) => e.projet_id === projetId);
  const parentSort = new Map(toutesLesEtapesDuProjet.map((e) => [e.id, e.sort_order]));
  const les = toutesLesEtapesDuProjet.filter((e) => e.date_cible && e.statut !== "fait");
  for (const e of les) {
    const code = e.parent_id && parentSort.has(e.parent_id) ? `${parentSort.get(e.parent_id)}.${e.sort_order}` : String(e.sort_order);
    const aDesEnfants = toutesLesEtapesDuProjet.some((x) => x.parent_id === e.id);
    const estJalon = !e.parent_id && !aDesEnfants;
    items.push({
      id: e.id,
      titre: e.titre,
      sousTitre: estJalon ? "Jalon" : `Échéance d'étape ${code}`,
      date: e.date_cible as string,
      isJalon: estJalon,
    });
  }

  const lesCal = calendrier.filter((c) => c.projet_id === projetId);
  for (const c of lesCal) {
    items.push({
      id: c.id,
      titre: c.titre,
      sousTitre: c.type === "session" ? "Session de travail" : "Échéance",
      date: c.date,
      isJalon: false,
    });
  }

  return items.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
}

export function chargeTravail(calendrier: CalendrierEntry[], etapes: PlanEtape[], projetId: string): ChargeTravail {
  const dansSemaine = calendrier.filter((c) => c.projet_id === projetId && daysUntil(c.date) >= 0 && daysUntil(c.date) <= 7);
  const echeances10j = etapes.filter(
    (e) => e.projet_id === projetId && e.date_cible && e.statut !== "fait" && daysUntil(e.date_cible) >= 0 && daysUntil(e.date_cible) <= 10,
  ).length;
  return {
    sessionsCetteSemaine: dansSemaine.length,
    echeances10j,
  };
}

export function notesProjet(notes: Note[], projetId: string): Note[] {
  return notes.filter((n) => n.projet_id === projetId);
}

export function streakJoursProjet(journal: JournalEntry[], projetId: string): number {
  const jours = new Set(
    journal.filter((j) => j.projet_id === projetId && j.type === "action").map((j) => toLocalDateKey(j.created_at)),
  );
  return calculerStreakJours(jours);
}

export function projetProgressionPct(etapes: PlanEtape[], projetId: string): number {
  const les = etapes.filter((e) => e.projet_id === projetId);
  if (les.length === 0) return 0;
  return Math.round((les.filter((e) => e.statut === "fait").length / les.length) * 100);
}

export function noteForEtape(notes: Note[], etapeId: string): Note | null {
  return notes.find((n) => n.etape_id === etapeId) ?? null;
}

export function findProjet(data: AppData, projetId: string): Projet | undefined {
  return data.projets.find((p) => p.id === projetId);
}
