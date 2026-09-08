import type { AppData } from "../types";
import { formatDateMedium, formatMontant, formatMontantAbs } from "./format";
import { projetProgressionPct } from "./ficheProjet";

export type PeriodeRapport = "30j" | "mois" | "trimestre";

export interface FenetreRapport {
  id: PeriodeRapport;
  label: string;
  debut: Date;
  fin: Date;
}

const LABELS: Record<PeriodeRapport, string> = {
  "30j": "30 derniers jours",
  mois: "Ce mois-ci",
  trimestre: "Ce trimestre",
};

export function construireFenetre(id: PeriodeRapport, maintenant = new Date()): FenetreRapport {
  const fin = maintenant;
  let debut: Date;
  if (id === "mois") {
    debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  } else if (id === "trimestre") {
    debut = new Date(maintenant);
    debut.setDate(debut.getDate() - 90);
  } else {
    debut = new Date(maintenant);
    debut.setDate(debut.getDate() - 30);
  }
  return { id, label: LABELS[id], debut, fin };
}

function dansLaFenetre(iso: string, fenetre: FenetreRapport): boolean {
  const d = new Date(iso.replace(" ", "T"));
  return d >= fenetre.debut && d <= fenetre.fin;
}

const ARCHIVE = (statut: string) => statut === "termine" || statut === "abandonne";

export function genererRapportTexte(data: AppData, fenetre: FenetreRapport): string {
  const lignes: string[] = [];

  lignes.push("CAVIRA — Rapport de progression");
  lignes.push(`Période : ${fenetre.label} (${formatDateMedium(fenetre.debut.toISOString())} → ${formatDateMedium(fenetre.fin.toISOString())})`);
  lignes.push("");

  const projetsNonArchives = data.projets.filter((p) => !ARCHIVE(p.statut));
  const projetsEnCours = projetsNonArchives.filter((p) => p.statut === "en_cours");
  const projetsPause = projetsNonArchives.filter((p) => p.statut === "pause");
  const journalFenetre = data.journal.filter((j) => dansLaFenetre(j.created_at, fenetre));
  const actions = journalFenetre.filter((j) => j.type === "action");
  const depenses = journalFenetre.filter((j) => j.type === "depense").reduce((s, j) => s + Math.abs(j.montant ?? 0), 0);
  const economies = journalFenetre.filter((j) => j.type === "economie").reduce((s, j) => s + (j.montant ?? 0), 0);
  const benefices = journalFenetre
    .filter((j) => j.type === "benefice_estime")
    .reduce((s, j) => s + (j.montant ?? 0), 0);
  const bilanNet = economies + benefices - depenses;

  lignes.push("── Vue d'ensemble ──");
  lignes.push(`Projets en cours : ${projetsEnCours.length}${projetsPause.length ? ` · ${projetsPause.length} en pause` : ""}`);
  lignes.push(`Actions enregistrées : ${actions.length}`);
  lignes.push(
    `Bilan financier : ${formatMontant(bilanNet)} (${formatMontantAbs(depenses)} dépensés · ${formatMontantAbs(economies)} économisés · ${formatMontantAbs(benefices)} de bénéfices estimés)`,
  );
  lignes.push("");

  lignes.push("── Progression par objectif ──");
  for (const o of data.objectifs) {
    const lies = data.projetObjectifs.filter((po) => po.objectif_id === o.id).map((po) => po.projet_id);
    const projetsLies = data.projets.filter((p) => lies.includes(p.id));
    const progression = projetsLies.length
      ? Math.round(projetsLies.reduce((s, p) => s + projetProgressionPct(data.etapes, p.id), 0) / projetsLies.length)
      : 0;
    lignes.push(`${o.titre} — ${progression}% (${projetsLies.length} projet${projetsLies.length > 1 ? "s" : ""})`);
  }
  lignes.push("");

  lignes.push("── Par projet ──");
  for (const p of projetsNonArchives) {
    const journalProjet = journalFenetre.filter((j) => j.projet_id === p.id);
    const actionsProjet = journalProjet.filter((j) => j.type === "action").length;
    const progression = projetProgressionPct(data.etapes, p.id);
    lignes.push("");
    lignes.push(`${p.titre} [${p.statut}] — ${progression}% terminé`);
    lignes.push(`  Actions dans la période : ${actionsProjet}`);
    const dernieresActions = journalProjet
      .filter((j) => j.type === "action")
      .slice(0, 3)
      .map((j) => `  · ${j.titre}`);
    lignes.push(...dernieresActions);
    const retrosProjet = data.retrospectives.filter((r) => r.projet_id === p.id && dansLaFenetre(r.created_at, fenetre));
    for (const r of retrosProjet) {
      lignes.push(`  Rétro (${r.periode}) : ${r.bien_marche}`);
    }
  }
  lignes.push("");

  const retrosGlobales = data.retrospectives.filter((r) => r.projet_id === null && dansLaFenetre(r.created_at, fenetre));
  if (retrosGlobales.length > 0) {
    lignes.push("── Rétrospectives globales ──");
    for (const r of retrosGlobales) {
      lignes.push(`[${r.periode}] Bien marché : ${r.bien_marche}`);
      lignes.push(`  A bloqué : ${r.a_bloque}`);
      lignes.push(`  Ajustement : ${r.ajustement}`);
      lignes.push("");
    }
  }

  return lignes.join("\n");
}
