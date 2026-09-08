export type ThemeId = "nuit" | "glacier" | "atelier" | "mousse" | "custom";

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
const CUSTOM_KEY = "cavira:theme-custom";

export interface CustomThemeColors {
  bg: string;
  accent: string;
}

const CUSTOM_DEFAUT: CustomThemeColors = { bg: "#0d0e14", accent: "#8b7bf7" };

// Larges palettes de suggestions pour le thème personnalisé — l'utilisateur
// n'est jamais limité à ces couleurs (le sélecteur natif reste disponible
// pour n'importe quelle teinte), elles ne font qu'offrir un large choix de
// départ rapide. Fonds volontairement sombres pour rester cohérents avec le
// reste du système de tokens (texte clair dérivé automatiquement).
export const PALETTE_FONDS: string[] = [
  "#0d0e14", "#07080c", "#0a0f14", "#0b0f0a", "#100c08", "#140a0a",
  "#0c0810", "#0a0a14", "#08120f", "#12100a", "#0e0e0e", "#10141a",
];

export const PALETTE_ACCENTS: string[] = [
  "#8b7bf7", "#4fd1e8", "#f45b8d", "#b6e24a", "#f2a93b", "#f65b5b",
  "#5b9df6", "#5bf6d3", "#f65bc7", "#c7f65b", "#f68b5b", "#9d5bf6",
  "#5bf68b", "#f6d35b", "#5b7bf6", "#f65b8b",
];

function estId(v: unknown): v is ThemeId {
  return v === "nuit" || v === "glacier" || v === "atelier" || v === "mousse" || v === "custom";
}

export function getStoredTheme(): ThemeId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (estId(v)) return v;
  } catch {
    // localStorage indisponible (ex. contexte restreint) : on retombe sur le défaut.
  }
  return "nuit";
}

export function getCustomThemeColors(): CustomThemeColors {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.bg === "string" && typeof parsed.accent === "string") return parsed;
    }
  } catch {
    // Valeur corrompue ou localStorage indisponible : on retombe sur le défaut.
  }
  return CUSTOM_DEFAUT;
}

export function setCustomThemeColors(colors: CustomThemeColors): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(colors));
  } catch {
    // Pas grave si la préférence ne persiste pas.
  }
}

// ---------- couleur : conversions hex <-> HSL ----------

function hexVersRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbVersHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslVersHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Dérive un jeu complet de tokens (surfaces, bordures, textes) à partir de
 * deux couleurs choisies par l'utilisateur (fond + accent), en reproduisant
 * les écarts observés entre les 4 thèmes prédéfinis (mêmes teintes que le
 * fond, luminosité croissante par palier). Évite de demander à
 * l'utilisateur de régler une dizaine de couleurs séparément.
 */
export function deriverThemePersonnalise(colors: CustomThemeColors): Record<string, string> {
  const [hBg, sBg, lBg] = rgbVersHsl(...hexVersRgb(colors.bg));
  const [rA, gA, bA] = hexVersRgb(colors.accent);

  return {
    "--bg": colors.bg,
    "--surface": hslVersHex(hBg, sBg, clamp(lBg + 5, 0, 92)),
    "--surface-2": hslVersHex(hBg, sBg, clamp(lBg + 3, 0, 92)),
    "--surface-3": hslVersHex(hBg, sBg, clamp(lBg + 8, 0, 92)),
    "--surface-hover": hslVersHex(hBg, sBg, clamp(lBg + 9, 0, 92)),
    "--border": hslVersHex(hBg, clamp(sBg + 5, 0, 100), clamp(lBg + 11, 0, 92)),
    "--border-hover": hslVersHex(hBg, clamp(sBg + 8, 0, 100), clamp(lBg + 21, 0, 92)),
    "--text": hslVersHex(hBg, 20, 93),
    "--text-2": hslVersHex(hBg, 8, 58),
    "--text-3": hslVersHex(hBg, 8, 38),
    "--accent": colors.accent,
    "--accent-ink": colors.bg,
    "--accent-dim": `rgba(${rA}, ${gA}, ${bA}, 0.16)`,
    "--accent-line": `rgba(${rA}, ${gA}, ${bA}, 0.42)`,
  };
}

function nettoyerThemePersonnaliseInline(): void {
  const style = document.documentElement.style;
  ["--bg", "--surface", "--surface-2", "--surface-3", "--surface-hover", "--border", "--border-hover", "--text", "--text-2", "--text-3", "--accent", "--accent-ink", "--accent-dim", "--accent-line"].forEach(
    (v) => style.removeProperty(v),
  );
}

export function applyTheme(theme: ThemeId, customColors?: CustomThemeColors): void {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "custom") {
    const colors = customColors ?? getCustomThemeColors();
    const vars = deriverThemePersonnalise(colors);
    for (const [k, v] of Object.entries(vars)) {
      document.documentElement.style.setProperty(k, v);
    }
  } else {
    nettoyerThemePersonnaliseInline();
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Pas grave si la préférence ne persiste pas.
  }
}
