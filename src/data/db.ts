import Database from "@tauri-apps/plugin-sql";
import { v4 as uuid } from "uuid";
import type {
  AppData,
  CalendrierEntry,
  Categorie,
  Idee,
  ImportanceProjet,
  JournalEntry,
  Note,
  Objectif,
  PlanEtape,
  Projet,
  ProjetLien,
  ProjetObjectif,
  StatutEtape,
  StatutProjet,
  TypeJournal,
} from "../types";
import {
  mockData,
  mockAddCategorie,
  mockAddEtape,
  mockAddObjectif,
  mockAddIdee,
  mockAddJournalEntry,
  mockAddNote,
  mockCreerProjet,
  mockModifierCategorie,
  mockModifierEtape,
  mockModifierObjectif,
  mockModifierProjet,
  mockPromouvoirIdee,
  mockRestaurerDonnees,
  mockSupprimerCategorie,
  mockSupprimerEtape,
  mockSupprimerObjectif,
  mockSupprimerProjet,
  mockToggleEtape,
} from "./mock";

let dbPromise: Promise<Database> | null = null;

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:cavira.db");
  }
  return dbPromise;
}

export async function loadAppData(): Promise<AppData> {
  // Hors runtime Tauri (aperçu navigateur en développement), le plugin SQL
  // n'est pas disponible : on retombe sur les données de seed en mémoire.
  if (!isTauriRuntime()) {
    return mockData;
  }
  const db = await getDb();
  const [categories, objectifs, projets, etapes, journal, notes, calendrier, projetObjectifs, projetLiens, idees] =
    await Promise.all([
      db.select<Categorie[]>("SELECT * FROM categories ORDER BY sort_order"),
      db.select<Objectif[]>("SELECT * FROM objectifs ORDER BY created_at"),
      db.select<Projet[]>("SELECT * FROM projets ORDER BY created_at"),
      db.select<PlanEtape[]>("SELECT * FROM plan_etapes ORDER BY sort_order"),
      db.select<JournalEntry[]>("SELECT * FROM journal_entries ORDER BY created_at DESC"),
      db.select<Note[]>("SELECT * FROM notes ORDER BY created_at DESC"),
      db.select<CalendrierEntry[]>("SELECT * FROM calendrier_entries ORDER BY date"),
      db.select<ProjetObjectif[]>("SELECT * FROM projet_objectifs"),
      db.select<ProjetLien[]>("SELECT * FROM projet_liens"),
      db.select<Idee[]>("SELECT * FROM idees ORDER BY interet DESC, created_at DESC"),
    ]);
  return { categories, objectifs, projets, etapes, journal, notes, calendrier, projetObjectifs, projetLiens, idees };
}

export async function toggleEtapeStatut(etapeId: string, nextStatut: StatutEtape): Promise<void> {
  if (!isTauriRuntime()) {
    mockToggleEtape(etapeId, nextStatut);
    return;
  }
  const db = await getDb();
  await db.execute("UPDATE plan_etapes SET statut = $1 WHERE id = $2", [nextStatut, etapeId]);
}

export async function addEtape(projetId: string, titre: string, sortOrder: number): Promise<void> {
  if (!isTauriRuntime()) {
    mockAddEtape(projetId, titre, sortOrder);
    return;
  }
  const db = await getDb();
  await db.execute(
    "INSERT INTO plan_etapes (id, projet_id, titre, statut, priorite, sort_order) VALUES ($1, $2, $3, 'a_faire', 'moyenne', $4)",
    [uuid(), projetId, titre, sortOrder],
  );
}

export interface NewJournalEntryInput {
  projetId: string;
  type: TypeJournal;
  titre: string;
  montant: number | null;
}

export async function addJournalEntry(input: NewJournalEntryInput): Promise<void> {
  if (!isTauriRuntime()) {
    mockAddJournalEntry(input);
    return;
  }
  const db = await getDb();
  await db.execute(
    "INSERT INTO journal_entries (id, projet_id, type, titre, montant, description) VALUES ($1, $2, $3, $4, $5, '')",
    [uuid(), input.projetId, input.type, input.titre, input.montant],
  );
}

export interface NewIdeeInput {
  titre: string;
  description: string;
  categorieId: string | null;
  interet: number;
}

export async function addIdee(input: NewIdeeInput): Promise<void> {
  if (!isTauriRuntime()) {
    mockAddIdee(input);
    return;
  }
  const db = await getDb();
  await db.execute("INSERT INTO idees (id, titre, description, categorie_id, interet) VALUES ($1, $2, $3, $4, $5)", [
    uuid(),
    input.titre,
    input.description,
    input.categorieId,
    input.interet,
  ]);
}

export async function promouvoirIdee(idee: Idee): Promise<string> {
  const nouveauId = uuid();
  if (!isTauriRuntime()) {
    mockPromouvoirIdee(idee, nouveauId);
    return nouveauId;
  }
  const db = await getDb();
  await db.execute(
    "INSERT INTO projets (id, titre, categorie_id, statut, description) VALUES ($1, $2, $3, 'preparation', $4)",
    [nouveauId, idee.titre, idee.categorie_id ?? "cat-autre", idee.description],
  );
  if (idee.objectif_id) {
    await db.execute("INSERT INTO projet_objectifs (projet_id, objectif_id) VALUES ($1, $2)", [
      nouveauId,
      idee.objectif_id,
    ]);
  }
  await db.execute("DELETE FROM idees WHERE id = $1", [idee.id]);
  return nouveauId;
}

export interface NewProjetInput {
  titre: string;
  categorieId: string;
  statut: StatutProjet;
  description: string;
  objectifFinal: string;
  objectifIds: string[];
  seuilDepenses: number | null;
  alimenteIds: string[];
  importance: ImportanceProjet;
}

export async function creerProjet(input: NewProjetInput): Promise<string> {
  const id = uuid();
  if (!isTauriRuntime()) {
    mockCreerProjet(id, input);
    return id;
  }
  const db = await getDb();
  await db.execute(
    "INSERT INTO projets (id, titre, categorie_id, statut, description, objectif_final, seuil_depenses, importance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [id, input.titre, input.categorieId, input.statut, input.description, input.objectifFinal, input.seuilDepenses, input.importance],
  );
  for (const objectifId of input.objectifIds) {
    await db.execute("INSERT INTO projet_objectifs (projet_id, objectif_id) VALUES ($1, $2)", [id, objectifId]);
  }
  for (const alimenteId of input.alimenteIds) {
    await db.execute("INSERT INTO projet_liens (projet_id, alimente_id) VALUES ($1, $2)", [id, alimenteId]);
  }
  return id;
}

export async function modifierProjet(id: string, input: NewProjetInput): Promise<void> {
  if (!isTauriRuntime()) {
    mockModifierProjet(id, input);
    return;
  }
  const db = await getDb();
  await db.execute(
    "UPDATE projets SET titre = $1, categorie_id = $2, statut = $3, description = $4, objectif_final = $5, seuil_depenses = $6, importance = $7, updated_at = datetime('now') WHERE id = $8",
    [input.titre, input.categorieId, input.statut, input.description, input.objectifFinal, input.seuilDepenses, input.importance, id],
  );
  await db.execute("DELETE FROM projet_objectifs WHERE projet_id = $1", [id]);
  for (const objectifId of input.objectifIds) {
    await db.execute("INSERT INTO projet_objectifs (projet_id, objectif_id) VALUES ($1, $2)", [id, objectifId]);
  }
  await db.execute("DELETE FROM projet_liens WHERE projet_id = $1", [id]);
  for (const alimenteId of input.alimenteIds) {
    await db.execute("INSERT INTO projet_liens (projet_id, alimente_id) VALUES ($1, $2)", [id, alimenteId]);
  }
}

export async function supprimerProjet(id: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockSupprimerProjet(id);
    return;
  }
  const db = await getDb();
  // Suppression explicite des tables dépendantes plutôt que de compter sur
  // ON DELETE CASCADE : plus sûr, indépendant du réglage PRAGMA foreign_keys.
  await db.execute("DELETE FROM plan_etapes WHERE projet_id = $1", [id]);
  await db.execute("DELETE FROM journal_entries WHERE projet_id = $1", [id]);
  await db.execute("DELETE FROM notes WHERE projet_id = $1", [id]);
  await db.execute("DELETE FROM calendrier_entries WHERE projet_id = $1", [id]);
  await db.execute("DELETE FROM projet_objectifs WHERE projet_id = $1", [id]);
  await db.execute("DELETE FROM projet_liens WHERE projet_id = $1 OR alimente_id = $1", [id]);
  await db.execute("DELETE FROM projets WHERE id = $1", [id]);
}

export async function modifierEtape(
  etapeId: string,
  input: { titre: string; statut: StatutEtape; priorite: PlanEtape["priorite"]; dateCible: string | null; note: string | null },
): Promise<void> {
  if (!isTauriRuntime()) {
    mockModifierEtape(etapeId, input);
    return;
  }
  const db = await getDb();
  await db.execute(
    "UPDATE plan_etapes SET titre = $1, statut = $2, priorite = $3, date_cible = $4, note = $5 WHERE id = $6",
    [input.titre, input.statut, input.priorite, input.dateCible, input.note, etapeId],
  );
}

export async function supprimerEtape(etapeId: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockSupprimerEtape(etapeId);
    return;
  }
  const db = await getDb();
  await db.execute("DELETE FROM plan_etapes WHERE id = $1 OR parent_id = $1", [etapeId]);
}

export async function addObjectif(titre: string, description: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockAddObjectif(titre, description);
    return;
  }
  const db = await getDb();
  await db.execute("INSERT INTO objectifs (id, titre, description) VALUES ($1, $2, $3)", [
    uuid(),
    titre,
    description,
  ]);
}

export async function modifierObjectif(id: string, titre: string, description: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockModifierObjectif(id, titre, description);
    return;
  }
  const db = await getDb();
  await db.execute("UPDATE objectifs SET titre = $1, description = $2 WHERE id = $3", [titre, description, id]);
}

export async function supprimerObjectif(id: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockSupprimerObjectif(id);
    return;
  }
  const db = await getDb();
  await db.execute("DELETE FROM projet_objectifs WHERE objectif_id = $1", [id]);
  await db.execute("DELETE FROM objectifs WHERE id = $1", [id]);
}

export async function addCategorie(label: string, color: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockAddCategorie(label, color);
    return;
  }
  const db = await getDb();
  const [{ n }] = await db.select<{ n: number }[]>("SELECT COUNT(*) as n FROM categories");
  await db.execute("INSERT INTO categories (id, label, color, sort_order) VALUES ($1, $2, $3, $4)", [
    uuid(),
    label,
    color,
    n + 1,
  ]);
}

export async function modifierCategorie(id: string, label: string, color: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockModifierCategorie(id, label, color);
    return;
  }
  const db = await getDb();
  await db.execute("UPDATE categories SET label = $1, color = $2 WHERE id = $3", [label, color, id]);
}

export async function supprimerCategorie(id: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockSupprimerCategorie(id);
    return;
  }
  const db = await getDb();
  await db.execute("DELETE FROM categories WHERE id = $1", [id]);
}

export async function addNote(projetId: string, titre: string, contenu: string, tags: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockAddNote(projetId, titre, contenu, tags);
    return;
  }
  const db = await getDb();
  await db.execute("INSERT INTO notes (id, projet_id, titre, contenu, tags) VALUES ($1, $2, $3, $4, $5)", [
    uuid(),
    projetId,
    titre,
    contenu,
    tags,
  ]);
}

/**
 * Remplace toutes les données locales par celles d'un export JSON.
 * Pas de transaction explicite (tauri-plugin-sql ne garantit pas que les
 * appels execute() successifs partagent la même connexion) : on vide et
 * réinsère dans un ordre qui respecte les clés étrangères (enfants avant
 * parents à la suppression, parents avant enfants à l'insertion). Le
 * fichier importé est validé (voir estAppDataValide) avant d'être appelé.
 */
export async function restaurerDonnees(data: AppData): Promise<void> {
  if (!isTauriRuntime()) {
    mockRestaurerDonnees(data);
    return;
  }
  const db = await getDb();

  await db.execute("DELETE FROM projet_objectifs");
  await db.execute("DELETE FROM projet_liens");
  await db.execute("DELETE FROM plan_etapes");
  await db.execute("DELETE FROM journal_entries");
  await db.execute("DELETE FROM notes");
  await db.execute("DELETE FROM calendrier_entries");
  await db.execute("DELETE FROM idees");
  await db.execute("DELETE FROM projets");
  await db.execute("DELETE FROM categories");
  await db.execute("DELETE FROM objectifs");

  for (const c of data.categories) {
    await db.execute("INSERT INTO categories (id, label, color, sort_order) VALUES ($1, $2, $3, $4)", [
      c.id,
      c.label,
      c.color,
      c.sort_order,
    ]);
  }
  for (const o of data.objectifs) {
    await db.execute("INSERT INTO objectifs (id, titre, description, created_at) VALUES ($1, $2, $3, $4)", [
      o.id,
      o.titre,
      o.description,
      o.created_at,
    ]);
  }
  for (const p of data.projets) {
    await db.execute(
      "INSERT INTO projets (id, titre, categorie_id, statut, description, objectif_final, echeance_date, seuil_depenses, importance, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        p.id,
        p.titre,
        p.categorie_id,
        p.statut,
        p.description,
        p.objectif_final,
        p.echeance_date,
        p.seuil_depenses,
        p.importance,
        p.created_at,
        p.updated_at,
      ],
    );
  }
  for (const e of data.etapes) {
    await db.execute(
      "INSERT INTO plan_etapes (id, projet_id, parent_id, titre, statut, priorite, date_cible, note, sort_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [e.id, e.projet_id, e.parent_id, e.titre, e.statut, e.priorite, e.date_cible, e.note, e.sort_order, e.created_at],
    );
  }
  for (const j of data.journal) {
    await db.execute(
      "INSERT INTO journal_entries (id, projet_id, type, titre, montant, duree_minutes, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [j.id, j.projet_id, j.type, j.titre, j.montant, j.duree_minutes, j.description, j.created_at],
    );
  }
  for (const n of data.notes) {
    await db.execute(
      "INSERT INTO notes (id, projet_id, etape_id, titre, contenu, tags, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [n.id, n.projet_id, n.etape_id, n.titre, n.contenu, n.tags, n.created_at],
    );
  }
  for (const c of data.calendrier) {
    await db.execute(
      "INSERT INTO calendrier_entries (id, projet_id, titre, date, type, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [c.id, c.projet_id, c.titre, c.date, c.type, c.created_at],
    );
  }
  for (const po of data.projetObjectifs) {
    await db.execute("INSERT INTO projet_objectifs (projet_id, objectif_id) VALUES ($1, $2)", [
      po.projet_id,
      po.objectif_id,
    ]);
  }
  for (const pl of data.projetLiens) {
    await db.execute("INSERT INTO projet_liens (projet_id, alimente_id, created_at) VALUES ($1, $2, $3)", [
      pl.projet_id,
      pl.alimente_id,
      pl.created_at,
    ]);
  }
  for (const i of data.idees) {
    await db.execute(
      "INSERT INTO idees (id, titre, description, categorie_id, interet, effort_estime, objectif_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [i.id, i.titre, i.description, i.categorie_id, i.interet, i.effort_estime, i.objectif_id, i.created_at],
    );
  }
}
