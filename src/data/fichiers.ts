import { appDataDir, join } from "@tauri-apps/api/path";
import { readTextFile, stat, writeTextFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { AppData } from "../types";

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function getDbPath(): Promise<string> {
  const dir = await appDataDir();
  return join(dir, "cavira.db");
}

function formatOctets(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const ko = bytes / 1024;
  if (ko < 1024) return `${ko.toFixed(1).replace(".", ",")} Ko`;
  const mo = ko / 1024;
  return `${mo.toFixed(1).replace(".", ",")} Mo`;
}

export async function getDbSizeLabel(): Promise<string> {
  try {
    const path = await getDbPath();
    const info = await stat(path);
    return formatOctets(info.size);
  } catch {
    return "—";
  }
}

const LAST_EXPORT_KEY = "cavira:dernier-export";

export function getDernierExport(): string | null {
  try {
    return localStorage.getItem(LAST_EXPORT_KEY);
  } catch {
    return null;
  }
}

const CLES_APPDATA: (keyof AppData)[] = [
  "categories",
  "objectifs",
  "projets",
  "etapes",
  "journal",
  "notes",
  "calendrier",
  "projetObjectifs",
  "projetLiens",
  "retrospectives",
  "idees",
];

export function estAppDataValide(valeur: unknown): valeur is AppData {
  if (!valeur || typeof valeur !== "object") return false;
  return CLES_APPDATA.every((cle) => Array.isArray((valeur as Record<string, unknown>)[cle]));
}

export interface ImportResultat {
  data: AppData;
  compteurs: Record<string, number>;
}

export async function choisirEtLireImport(): Promise<ImportResultat | null> {
  const chemin = await open({
    multiple: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!chemin || Array.isArray(chemin)) return null;
  const texte = await readTextFile(chemin);
  let parsed: unknown;
  try {
    parsed = JSON.parse(texte);
  } catch {
    throw new Error("Ce fichier n'est pas un JSON valide.");
  }
  if (!estAppDataValide(parsed)) {
    throw new Error("Ce fichier ne correspond pas à un export CAVIRA (structure inattendue).");
  }
  const compteurs = Object.fromEntries(CLES_APPDATA.map((cle) => [cle, parsed[cle].length]));
  return { data: parsed, compteurs };
}

export async function exporterDonnees(data: AppData): Promise<boolean> {
  const cible = await save({
    defaultPath: "cavira-export.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!cible) return false;
  await writeTextFile(cible, JSON.stringify(data, null, 2));
  try {
    localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
  } catch {
    // La date d'export ne persistera pas, tant pis.
  }
  return true;
}
