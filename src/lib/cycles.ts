import type { AppData, JournalEntry } from "../types";

export type CycleUnite = "jours" | "mois" | "annees";

export interface CycleConfig {
  actif: boolean;
  intervalle: number;
  unite: CycleUnite;
  debut: string;
}

const KEY_ACTIF = "cavira:cycle-actif";
const KEY_INTERVALLE = "cavira:cycle-intervalle";
const KEY_UNITE = "cavira:cycle-unite";
const KEY_DEBUT = "cavira:cycle-debut";

export function getCycleConfig(): CycleConfig {
  try {
    const actif = localStorage.getItem(KEY_ACTIF) === "true";
    const intervalleRaw = Number(localStorage.getItem(KEY_INTERVALLE));
    const intervalle = Number.isFinite(intervalleRaw) && intervalleRaw > 0 ? intervalleRaw : 1;
    const uniteRaw = localStorage.getItem(KEY_UNITE);
    const unite: CycleUnite = uniteRaw === "jours" || uniteRaw === "mois" || uniteRaw === "annees" ? uniteRaw : "mois";
    const debut = localStorage.getItem(KEY_DEBUT) || new Date().toISOString();
    return { actif, intervalle, unite, debut };
  } catch {
    return { actif: false, intervalle: 1, unite: "mois", debut: new Date().toISOString() };
  }
}

export function setCycleConfig(config: CycleConfig): void {
  try {
    localStorage.setItem(KEY_ACTIF, String(config.actif));
    localStorage.setItem(KEY_INTERVALLE, String(config.intervalle));
    localStorage.setItem(KEY_UNITE, config.unite);
    localStorage.setItem(KEY_DEBUT, config.debut);
  } catch {
    // Pas grave si la préférence ne persiste pas.
  }
}

export function reinitialiserCycleMaintenant(): CycleConfig {
  const config = getCycleConfig();
  const nouveau = { ...config, debut: new Date().toISOString() };
  setCycleConfig(nouveau);
  return nouveau;
}

export function ajouterUnites(date: Date, n: number, unite: CycleUnite): Date {
  const d = new Date(date);
  if (unite === "jours") d.setDate(d.getDate() + n);
  else if (unite === "mois") d.setMonth(d.getMonth() + n);
  else d.setFullYear(d.getFullYear() + n);
  return d;
}

export function finCycle(config: CycleConfig): Date {
  return ajouterUnites(new Date(config.debut), config.intervalle, config.unite);
}

/**
 * Fait avancer le cycle si l'intervalle est dépassé (peut sauter plusieurs
 * intervalles d'un coup si l'app est restée fermée longtemps), pour garder
 * des bornes de cycle régulières plutôt que de dériver vers "maintenant".
 * Persiste et renvoie la config à jour ; ne fait rien si le cycle n'est
 * pas actif ou n'est pas encore arrivé à échéance.
 */
export function avancerCycleSiNecessaire(maintenant = new Date()): CycleConfig {
  const config = getCycleConfig();
  if (!config.actif) return config;
  let debut = new Date(config.debut);
  let avance = false;
  while (ajouterUnites(debut, config.intervalle, config.unite) <= maintenant) {
    debut = ajouterUnites(debut, config.intervalle, config.unite);
    avance = true;
  }
  if (!avance) return config;
  const nouveau = { ...config, debut: debut.toISOString() };
  setCycleConfig(nouveau);
  return nouveau;
}

function dansIntervalle(iso: string, debut: Date, fin: Date): boolean {
  const d = new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  return d >= debut && d < fin;
}

export interface CycleStats {
  debut: Date;
  fin: Date;
  label: string;
  actions: number;
  depenses: number;
  gagne: number;
  bilanNet: number;
}

function statsSurIntervalle(journal: JournalEntry[], debut: Date, fin: Date, label: string): CycleStats {
  const dans = journal.filter((j) => dansIntervalle(j.created_at, debut, fin));
  const sum = (type: JournalEntry["type"]) =>
    dans.filter((j) => j.type === type).reduce((s, j) => s + (j.montant ?? 0), 0);
  const actions = dans.filter((j) => j.type === "action").length;
  const depenses = Math.abs(sum("depense"));
  const gagne = sum("economie") + sum("benefice_estime");
  return { debut, fin, label, actions, depenses, gagne, bilanNet: gagne - depenses };
}

function labelIntervalle(debut: Date, fin: Date): string {
  const finAffichee = new Date(fin.getTime() - 1);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const debutStr = debut.toLocaleDateString("fr-FR", opts).replace(".", "");
  const finStr = finAffichee.toLocaleDateString("fr-FR", { ...opts, year: "numeric" }).replace(".", "");
  return `${debutStr} → ${finStr}`;
}

export function cycleActuel(data: AppData, config: CycleConfig, maintenant = new Date()): CycleStats {
  const debut = new Date(config.debut);
  return statsSurIntervalle(data.journal, debut, maintenant, `Depuis le ${debut.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }).replace(".", "")}`);
}

export function cyclesPrecedents(data: AppData, config: CycleConfig, nb = 6): CycleStats[] {
  const resultats: CycleStats[] = [];
  let fin = new Date(config.debut);
  for (let i = 0; i < nb; i++) {
    const debut = ajouterUnites(fin, -config.intervalle, config.unite);
    resultats.push(statsSurIntervalle(data.journal, debut, fin, labelIntervalle(debut, fin)));
    fin = debut;
  }
  return resultats;
}
