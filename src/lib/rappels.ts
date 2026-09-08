import type { AppData } from "../types";
import { daysUntil } from "./format";
import { syntheseFinanciere } from "./ficheProjet";

export interface Rappel {
  id: string;
  titre: string;
  sousTitre: string;
  projetId: string;
  urgence: "retard" | "proche" | "normal";
}

const ARCHIVE = (statut: string) => statut === "termine" || statut === "abandonne";

export interface RappelsGroupes {
  echeances: Rappel[];
  seuils: Rappel[];
  bloquees: Rappel[];
  total: number;
}

export function construireRappels(data: AppData): RappelsGroupes {
  const projetById = new Map(data.projets.map((p) => [p.id, p]));

  const echeances: Rappel[] = [];
  for (const e of data.etapes) {
    if (e.statut === "fait" || !e.date_cible) continue;
    const p = projetById.get(e.projet_id);
    if (!p || ARCHIVE(p.statut) || p.masque) continue;
    const j = daysUntil(e.date_cible);
    if (j > 7) continue;
    echeances.push({
      id: `etape-${e.id}`,
      titre: e.titre,
      sousTitre: `${p.titre} · ${j < 0 ? `en retard de ${-j} j` : j === 0 ? "aujourd'hui" : `J-${j}`}`,
      projetId: p.id,
      urgence: j < 0 ? "retard" : "proche",
    });
  }
  for (const p of data.projets) {
    if (!p.echeance_date || ARCHIVE(p.statut) || p.masque) continue;
    const j = daysUntil(p.echeance_date);
    if (j > 7) continue;
    echeances.push({
      id: `proj-${p.id}`,
      titre: `Échéance — ${p.titre}`,
      sousTitre: j < 0 ? `en retard de ${-j} j` : j === 0 ? "aujourd'hui" : `J-${j}`,
      projetId: p.id,
      urgence: j < 0 ? "retard" : "proche",
    });
  }
  echeances.sort((a, b) => (a.urgence === b.urgence ? 0 : a.urgence === "retard" ? -1 : 1));

  const seuils: Rappel[] = [];
  for (const p of data.projets) {
    if (ARCHIVE(p.statut) || p.masque || p.seuil_depenses === null) continue;
    const synthese = syntheseFinanciere(data.journal, p, 30);
    if (!synthese.seuilDepasse) continue;
    seuils.push({
      id: `seuil-${p.id}`,
      titre: p.titre,
      sousTitre: `dérive de ${synthese.derivePct}%`,
      projetId: p.id,
      urgence: "proche",
    });
  }

  const bloquees: Rappel[] = [];
  for (const e of data.etapes) {
    if (e.statut !== "bloque") continue;
    const p = projetById.get(e.projet_id);
    if (!p || ARCHIVE(p.statut) || p.masque) continue;
    bloquees.push({
      id: `bloque-${e.id}`,
      titre: e.titre,
      sousTitre: p.titre,
      projetId: p.id,
      urgence: "normal",
    });
  }

  return {
    echeances,
    seuils,
    bloquees,
    total: echeances.length + seuils.length + bloquees.length,
  };
}
