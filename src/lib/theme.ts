export type ThemeId = "nuit" | "glacier" | "atelier" | "mousse";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  swatches: [string, string, string, string];
}

export const THEMES: ThemeDef[] = [
  { id: "nuit", label: "Nuit (défaut)", swatches: ["#0B0C11", "#12141C", "#252938", "#8B7BF7"] },
  { id: "glacier", label: "Glacier", swatches: ["#080D11", "#101820", "#20303A", "#4FD1E8"] },
  { id: "atelier", label: "Atelier", swatches: ["#100C08", "#1A1510", "#332920", "#F2A93B"] },
  { id: "mousse", label: "Mousse", swatches: ["#0A0F0A", "#121A12", "#233024", "#B6E24A"] },
];

const STORAGE_KEY = "cavira:theme";

export function getStoredTheme(): ThemeId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "nuit" || v === "glacier" || v === "atelier" || v === "mousse") return v;
  } catch {
    // localStorage indisponible (ex. contexte restreint) : on retombe sur le défaut.
  }
  return "nuit";
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Pas grave si la préférence ne persiste pas.
  }
}
