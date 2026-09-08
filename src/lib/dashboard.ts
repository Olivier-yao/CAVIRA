import type { AppData, JournalEntry, Objectif, PlanEtape, Projet } from "../types";
import { calculerStreakJours, dateKey, daysUntil, toLocalDateKey } from "./format";

export interface ProchaineEcheance {
  titre: string;
  projetId: string;
  projetTitre: string;
  sousTitre: string;
  dateCible: string;
  joursRestants: number;
}

export interface ObjectifProgress {
  objectif: Objectif;
  progression: number;
  nbProjets: number;
}

export interface JourActivite {
  jour: string;
  count: number;
}

export interface Regularite {
  points: JourActivite[];
  label: string;
}

export interface MoisBilan {
  label: string;
  depenses: number;
  economies: number;
  benefices: number;
}

export type PeriodeDashboard = "mois" | "30j" | "trimestre";

export interface DashboardStats {
  projetsActifs: number;
  projetsPause: number;
  projetsArchives: number;
  actionsCeMois: number;
  actionsMoisDernier: number;
  actionsDeltaPct: number | null;
  bilanNetCeMois: number;
  depensesCeMois: number;
  gagneCeMois: number;
  bilanDeltaPct: number | null;
  echeancesProches: number;
  echeancesEnRetard: number;
  echeancesProjetsTitres: string[];
  regularite: Regularite;
  bilanFinancier6mois: MoisBilan[];
  prochaineEcheance: ProchaineEcheance | null;
  progressionParObjectif: ObjectifProgress[];
  derniereActivite: (JournalEntry & { projetTitre: string })[];
  streakJours: number;
  periodeLabelPrecedente: string;
}

export function progressionProjet(projetId: string, etapes: PlanEtape[]): number {
  const les = etapes.filter((e) => e.projet_id === projetId);
  if (les.length === 0) return 0;
  const faites = les.filter((e) => e.statut === "fait").length;
  return Math.round((faites / les.length) * 100);
}

function parseSqlDate(iso: string): Date {
  return new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
}

function dansFenetre(iso: string, debut: Date, fin: Date): boolean {
  const d = parseSqlDate(iso);
  return d >= debut && d < fin;
}

function isSameMonth(iso: string, ref: Date): boolean {
  const d = parseSqlDate(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

interface FenetreComparaison {
  debut: Date;
  fin: Date;
  debutPrecedent: Date;
  finPrecedent: Date;
  labelPrecedent: string;
}

function calculerFenetreComparaison(periode: PeriodeDashboard, maintenant: Date): FenetreComparaison {
  const finProchaine = new Date(maintenant.getTime() + 1);
  if (periode === "30j") {
    const debut = new Date(maintenant.getTime() - 30 * 24 * 60 * 60 * 1000);
    const debutPrecedent = new Date(debut.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { debut, fin: finProchaine, debutPrecedent, finPrecedent: debut, labelPrecedent: "sur les 30 jours précédents" };
  }
  if (periode === "trimestre") {
    const debut = new Date(maintenant.getTime() - 90 * 24 * 60 * 60 * 1000);
    const debutPrecedent = new Date(debut.getTime() - 90 * 24 * 60 * 60 * 1000);
    return { debut, fin: finProchaine, debutPrecedent, finPrecedent: debut, labelPrecedent: "sur le trimestre précédent" };
  }
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const debutPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
  return { debut, fin: finProchaine, debutPrecedent, finPrecedent: debut, labelPrecedent: "le mois dernier" };
}

function calculerRegularite(journal: JournalEntry[], periode: PeriodeDashboard, maintenant: Date): Regularite {
  const actions = journal.filter((j) => j.type === "action");

  if (periode === "trimestre") {
    const points: JourActivite[] = [];
    for (let i = 12; i >= 0; i--) {
      const finSemaine = new Date(maintenant.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const debutSemaine = new Date(finSemaine.getTime() - 6 * 24 * 60 * 60 * 1000);
      const debutKey = dateKey(debutSemaine);
      const finKey = dateKey(finSemaine);
      const count = actions.filter((j) => {
        const k = toLocalDateKey(j.created_at);
        return k >= debutKey && k <= finKey;
      }).length;
      points.push({ jour: debutKey, count });
    }
    return { points, label: "13 dernières semaines" };
  }

  const nbJours =
    periode === "30j" ? 30 : Math.max(1, maintenant.getDate());
  const points: JourActivite[] = [];
  for (let i = nbJours - 1; i >= 0; i--) {
    const d = new Date(maintenant);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const count = actions.filter((j) => toLocalDateKey(j.created_at) === key).length;
    points.push({ jour: key, count });
  }
  return { points, label: periode === "30j" ? "30 derniers jours" : "depuis le 1er du mois" };
}

export function computeDashboardStats(data: AppData, periode: PeriodeDashboard = "mois"): DashboardStats {
  const { projets, etapes, journal } = data;
  const now = new Date();
  const projetById = new Map(projets.map((p) => [p.id, p]));

  const projetsActifs = projets.filter((p) => p.statut === "en_cours" && !p.masque).length;
  const projetsPause = projets.filter((p) => p.statut === "pause" && !p.masque).length;
  const projetsArchives = projets.filter((p) => p.statut === "termine" || p.statut === "abandonne").length;

  const fenetre = calculerFenetreComparaison(periode, now);

  const actionsThisMonth = journal.filter((j) => j.type === "action" && dansFenetre(j.created_at, fenetre.debut, fenetre.fin));
  const actionsLastMonth = journal.filter(
    (j) => j.type === "action" && dansFenetre(j.created_at, fenetre.debutPrecedent, fenetre.finPrecedent),
  );
  const actionsCeMois = actionsThisMonth.length;
  const actionsMoisDernier = actionsLastMonth.length;
  const actionsDeltaPct = pctDelta(actionsThisMonth.length, actionsLastMonth.length);

  const sumMontant = (entries: JournalEntry[], type: JournalEntry["type"]) =>
    entries.filter((j) => j.type === type).reduce((s, j) => s + (j.montant ?? 0), 0);

  const journalThisMonth = journal.filter((j) => dansFenetre(j.created_at, fenetre.debut, fenetre.fin));
  const journalLastMonth = journal.filter((j) => dansFenetre(j.created_at, fenetre.debutPrecedent, fenetre.finPrecedent));

  const depensesCeMois = Math.abs(sumMontant(journalThisMonth, "depense"));
  const gagneCeMois = sumMontant(journalThisMonth, "economie") + sumMontant(journalThisMonth, "benefice_estime");
  const bilanNetCeMois = gagneCeMois - depensesCeMois;
  const bilanNetMoisDernier =
    sumMontant(journalLastMonth, "economie") +
    sumMontant(journalLastMonth, "benefice_estime") +
    sumMontant(journalLastMonth, "depense");
  const bilanDeltaPct = pctDelta(bilanNetCeMois, bilanNetMoisDernier);

  const echeancesProchesList = etapes.filter((e) => {
    if (e.statut === "fait" || !e.date_cible) return false;
    const j = daysUntil(e.date_cible);
    return j <= 7;
  });
  const echeancesProches = echeancesProchesList.length;
  const echeancesEnRetard = echeancesProchesList.filter((e) => daysUntil(e.date_cible as string) < 0).length;
  const echeancesProjetsTitres = [
    ...new Set(echeancesProchesList.map((e) => projetById.get(e.projet_id)?.titre).filter((t): t is string => !!t)),
  ];

  const regularite = calculerRegularite(journal, periode, now);

  const bilanFinancier6mois: MoisBilan[] = [];
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inMonth = journal.filter((j) => isSameMonth(j.created_at, ref));
    bilanFinancier6mois.push({
      label: ref.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase(),
      depenses: Math.abs(sumMontant(inMonth, "depense")),
      economies: sumMontant(inMonth, "economie"),
      benefices: sumMontant(inMonth, "benefice_estime"),
    });
  }

  const etapeById = new Map(etapes.map((e) => [e.id, e]));
  const etapeCode = (e: PlanEtape): string =>
    e.parent_id && etapeById.has(e.parent_id)
      ? `${(etapeById.get(e.parent_id) as PlanEtape).sort_order}.${e.sort_order}`
      : String(e.sort_order);

  let prochaineEcheance: ProchaineEcheance | null = null;
  const candidates: { titre: string; projet: Projet; sousTitre: string; date: string }[] = [];
  for (const e of etapes) {
    if (e.statut === "fait" || !e.date_cible) continue;
    const p = projetById.get(e.projet_id);
    if (!p) continue;
    candidates.push({ titre: e.titre, projet: p, sousTitre: `étape ${etapeCode(e)}`, date: e.date_cible });
  }
  for (const p of projets) {
    if (!p.echeance_date) continue;
    candidates.push({ titre: p.titre, projet: p, sousTitre: "échéance projet", date: p.echeance_date });
  }
  candidates.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  const soonest = candidates.find((c) => daysUntil(c.date) >= -30);
  if (soonest) {
    prochaineEcheance = {
      titre: soonest.titre,
      projetId: soonest.projet.id,
      projetTitre: soonest.projet.titre,
      sousTitre: soonest.sousTitre,
      dateCible: soonest.date,
      joursRestants: daysUntil(soonest.date),
    };
  }

  const projetIdsByObjectif = new Map<string, string[]>();
  for (const po of data.projetObjectifs) {
    const list = projetIdsByObjectif.get(po.objectif_id) ?? [];
    list.push(po.projet_id);
    projetIdsByObjectif.set(po.objectif_id, list);
  }

  const progressionParObjectif: ObjectifProgress[] = data.objectifs.map((o) => {
    const lies = (projetIdsByObjectif.get(o.id) ?? [])
      .map((id) => projets.find((p) => p.id === id))
      .filter((p): p is Projet => !!p);
    const progression = lies.length
      ? Math.round(lies.reduce((s, p) => s + progressionProjet(p.id, etapes), 0) / lies.length)
      : 0;
    return { objectif: o, progression, nbProjets: lies.length };
  });

  const derniereActivite = journal.slice(0, 5).map((j) => ({
    ...j,
    projetTitre: projetById.get(j.projet_id)?.titre ?? "",
  }));

  const jours = new Set(
    journal.filter((j) => j.type === "action").map((j) => toLocalDateKey(j.created_at)),
  );
  const streakJours = calculerStreakJours(jours);

  return {
    projetsActifs,
    projetsPause,
    projetsArchives,
    actionsCeMois,
    actionsMoisDernier,
    actionsDeltaPct,
    bilanNetCeMois,
    depensesCeMois,
    gagneCeMois,
    bilanDeltaPct,
    echeancesProches,
    echeancesEnRetard,
    echeancesProjetsTitres,
    regularite,
    bilanFinancier6mois,
    prochaineEcheance,
    progressionParObjectif,
    derniereActivite,
    streakJours,
    periodeLabelPrecedente: fenetre.labelPrecedent,
  };
}
