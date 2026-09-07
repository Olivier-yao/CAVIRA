import Database from "@tauri-apps/plugin-sql";
import { v4 as uuid } from "uuid";
import type {
  AppData,
  CalendrierEntry,
  Categorie,
  Idee,
  JournalEntry,
  Note,
  Objectif,
  PlanEtape,
  Projet,
  ProjetObjectif,
  StatutEtape,
  StatutProjet,
  TypeJournal,
} from "../types";
import {
  mockData,
  mockAddCategorie,
  mockAddEtape,
  mockAddIdee,
  mockAddJournalEntry,
  mockAddNote,
  mockCreerProjet,
  mockPromouvoirIdee,
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
  const [categories, objectifs, projets, etapes, journal, notes, calendrier, projetObjectifs, idees] =
    await Promise.all([
      db.select<Categorie[]>("SELECT * FROM categories ORDER BY sort_order"),
      db.select<Objectif[]>("SELECT * FROM objectifs ORDER BY created_at"),
      db.select<Projet[]>("SELECT * FROM projets ORDER BY created_at"),
      db.select<PlanEtape[]>("SELECT * FROM plan_etapes ORDER BY sort_order"),
      db.select<JournalEntry[]>("SELECT * FROM journal_entries ORDER BY created_at DESC"),
      db.select<Note[]>("SELECT * FROM notes ORDER BY created_at DESC"),
      db.select<CalendrierEntry[]>("SELECT * FROM calendrier_entries ORDER BY date"),
      db.select<ProjetObjectif[]>("SELECT * FROM projet_objectifs"),
      db.select<Idee[]>("SELECT * FROM idees ORDER BY interet DESC, created_at DESC"),
    ]);
  return { categories, objectifs, projets, etapes, journal, notes, calendrier, projetObjectifs, idees };
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
}

export async function creerProjet(input: NewProjetInput): Promise<string> {
  const id = uuid();
  if (!isTauriRuntime()) {
    mockCreerProjet(id, input);
    return id;
  }
  const db = await getDb();
  await db.execute(
    "INSERT INTO projets (id, titre, categorie_id, statut, description, objectif_final) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, input.titre, input.categorieId, input.statut, input.description, input.objectifFinal],
  );
  for (const objectifId of input.objectifIds) {
    await db.execute("INSERT INTO projet_objectifs (projet_id, objectif_id) VALUES ($1, $2)", [id, objectifId]);
  }
  return id;
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
