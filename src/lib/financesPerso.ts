import type { FinancePerso } from "../types";

export interface TotauxFinancePerso {
  totalEntrees: number;
  totalDepenses: number;
  totalEconomies: number;
  soldeNet: number;
}

/**
 * Le solde net exclut volontairement les économies (de l'argent mis de
 * côté, pas dépensé) : soldeNet = entrées - dépenses uniquement, les
 * économies restent une mesure séparée ("hors solde").
 */
export function calculerTotaux(entries: FinancePerso[]): TotauxFinancePerso {
  const somme = (type: FinancePerso["type"]) =>
    entries.filter((e) => e.type === type).reduce((s, e) => s + e.montant, 0);
  const totalEntrees = somme("entree");
  const totalDepenses = somme("depense");
  const totalEconomies = somme("economie");
  return { totalEntrees, totalDepenses, totalEconomies, soldeNet: totalEntrees - totalDepenses };
}

export interface PointSoldeCumule {
  label: string;
  solde: number;
}

/**
 * Solde cumulé (entrées - dépenses) fin de mois, sur les 12 derniers mois
 * — recalculé en direct depuis les entrées à chaque appel, jamais stocké.
 */
export function soldeCumule12Mois(entries: FinancePerso[], maintenant = new Date()): PointSoldeCumule[] {
  const tri = [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const points: PointSoldeCumule[] = [];
  let solde = 0;
  let curseur = 0;

  for (let i = 11; i >= 0; i--) {
    const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() - i + 1, 1);
    const finMoisCle = finMois.toISOString().slice(0, 10);
    while (curseur < tri.length && tri[curseur].date < finMoisCle) {
      const e = tri[curseur];
      if (e.type === "entree") solde += e.montant;
      else if (e.type === "depense") solde -= e.montant;
      curseur++;
    }
    const refMois = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    points.push({ label: refMois.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase(), solde });
  }
  return points;
}
