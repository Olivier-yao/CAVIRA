import { appDataDir, join } from "@tauri-apps/api/path";
import { stat, writeTextFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
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
