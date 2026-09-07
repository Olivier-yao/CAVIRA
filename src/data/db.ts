import Database from "@tauri-apps/plugin-sql";
import { v4 as uuid } from "uuid";
import type {
  AppData,
  CalendrierEntry,
  Categorie,
  JournalEntry,
  Note,
  Objectif,
  PlanEtape,
  Projet,
  StatutEtape,
  TypeJournal,
} from "../types";
import { mockData, mockAddEtape, mockAddJournalEntry, mockAddNote, mockToggleEtape } from "./mock";

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
  const [categories, objectifs, projets, etapes, journal, notes, calendrier] = await Promise.all([
    db.select<Categorie[]>("SELECT * FROM categories ORDER BY sort_order"),
    db.select<Objectif[]>("SELECT * FROM objectifs ORDER BY created_at"),
    db.select<Projet[]>("SELECT * FROM projets ORDER BY created_at"),
    db.select<PlanEtape[]>("SELECT * FROM plan_etapes ORDER BY sort_order"),
    db.select<JournalEntry[]>("SELECT * FROM journal_entries ORDER BY created_at DESC"),
    db.select<Note[]>("SELECT * FROM notes ORDER BY created_at DESC"),
    db.select<CalendrierEntry[]>("SELECT * FROM calendrier_entries ORDER BY date"),
  ]);
  return { categories, objectifs, projets, etapes, journal, notes, calendrier };
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

export async function addNote(projetId: string, contenu: string, tags: string): Promise<void> {
  if (!isTauriRuntime()) {
    mockAddNote(projetId, contenu, tags);
    return;
  }
  const db = await getDb();
  await db.execute("INSERT INTO notes (id, projet_id, contenu, tags) VALUES ($1, $2, $3, $4)", [
    uuid(),
    projetId,
    contenu,
    tags,
  ]);
}
