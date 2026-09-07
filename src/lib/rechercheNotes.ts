import type { AppData, Note, Projet } from "../types";

export interface GroupeNotes {
  projet: Projet;
  totalNotes: number;
  resultats: Note[];
}

export function tousLesTags(notes: Note[]): string[] {
  const set = new Set<string>();
  for (const n of notes) {
    for (const t of n.tags.split(",").map((x) => x.trim()).filter(Boolean)) {
      set.add(t);
    }
  }
  return [...set].sort();
}

export function rechercherNotes(data: AppData, requete: string, tag: string | null): GroupeNotes[] {
  const q = requete.trim().toLowerCase();
  const parProjet = new Map<string, Note[]>();
  for (const n of data.notes) {
    const list = parProjet.get(n.projet_id) ?? [];
    list.push(n);
    parProjet.set(n.projet_id, list);
  }

  const groupes: GroupeNotes[] = [];
  for (const projet of data.projets) {
    const notesDuProjet = parProjet.get(projet.id) ?? [];
    if (notesDuProjet.length === 0) continue;

    const resultats = notesDuProjet.filter((n) => {
      const tags = n.tags.split(",").map((t) => t.trim());
      if (tag && !tags.includes(tag)) return false;
      if (!q) return true;
      return (
        n.titre.toLowerCase().includes(q) ||
        n.contenu.toLowerCase().includes(q) ||
        tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    if (resultats.length > 0) {
      groupes.push({ projet, totalNotes: notesDuProjet.length, resultats });
    }
  }

  return groupes;
}
