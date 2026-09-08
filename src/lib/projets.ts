import type { AppData, PlanEtape, Projet } from "../types";
import { daysUntil, formatMontantAbs, formatRelativeLong } from "./format";
import { projetProgressionPct } from "./ficheProjet";

export interface ProjetCard {
  projet: Projet;
  progression: number;
  derniereActiviteTexte: string;
  derniereActiviteRelatif: string;
  echeanceJours: number | null;
  aBlocage: boolean;
}

function labelActivite(texte: string, montant: number | null): string {
  if (montant === null) return texte;
  return `${texte} ${formatMontantAbs(montant)}`;
}

export function estUrgent(card: ProjetCard): boolean {
  return card.aBlocage || (card.echeanceJours !== null && card.echeanceJours <= 7);
}

export function estImportant(card: ProjetCard): boolean {
  return card.projet.importance === "haute";
}

export function buildProjetCards(data: AppData): ProjetCard[] {
  return data.projets.map((projet) => {
    const journalDuProjet = data.journal
      .filter((j) => j.projet_id === projet.id)
      .map((j) => ({
        created_at: j.created_at,
        texte:
          j.type === "action"
            ? j.titre
            : j.type === "depense"
              ? labelActivite("Dépense", j.montant)
              : j.type === "economie"
                ? labelActivite("Économie", j.montant)
                : labelActivite("Bénéfice", j.montant),
      }));
    const notesDuProjet = data.notes
      .filter((n) => n.projet_id === projet.id)
      .map((n) => ({ created_at: n.created_at, texte: "Note ajoutée" }));

    const evenements = [...journalDuProjet, ...notesDuProjet].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    );
    const dernier = evenements[0];

    const etapesDuProjet = data.etapes.filter((e: PlanEtape) => e.projet_id === projet.id);
    const aBlocage = etapesDuProjet.some((e) => e.statut === "bloque");

    const candidats: number[] = [];
    if (projet.echeance_date) candidats.push(daysUntil(projet.echeance_date));
    for (const e of etapesDuProjet) {
      if (e.date_cible && e.statut !== "fait") candidats.push(daysUntil(e.date_cible));
    }
    const echeanceJours = candidats.length ? Math.min(...candidats) : null;

    return {
      projet,
      progression: projetProgressionPct(data.etapes, projet.id),
      derniereActiviteTexte: dernier ? dernier.texte : "Aucune action",
      derniereActiviteRelatif: formatRelativeLong(dernier ? dernier.created_at : projet.updated_at),
      echeanceJours,
      aBlocage,
    };
  });
}
