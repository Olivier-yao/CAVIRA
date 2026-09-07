import Database from "@tauri-apps/plugin-sql";
import type { Categorie, DashboardData, JournalEntry, Objectif, PlanEtape, Projet } from "../types";
import { mockDashboardData } from "./mock";

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

export async function loadDashboardData(): Promise<DashboardData> {
  // Hors runtime Tauri (aperçu navigateur en développement), le plugin SQL
  // n'est pas disponible : on retombe sur les données de seed en mémoire.
  if (!isTauriRuntime()) {
    return mockDashboardData;
  }
  const db = await getDb();
  const [categories, objectifs, projets, etapes, journal] = await Promise.all([
    db.select<Categorie[]>("SELECT * FROM categories ORDER BY sort_order"),
    db.select<Objectif[]>("SELECT * FROM objectifs ORDER BY created_at"),
    db.select<Projet[]>("SELECT * FROM projets ORDER BY created_at"),
    db.select<PlanEtape[]>("SELECT * FROM plan_etapes ORDER BY sort_order"),
    db.select<JournalEntry[]>("SELECT * FROM journal_entries ORDER BY created_at DESC"),
  ]);
  return { categories, objectifs, projets, etapes, journal };
}
