export type DeviseCode = "EUR" | "XOF" | "USD" | "GBP" | "CAD";

export interface DeviseDef {
  code: DeviseCode;
  label: string;
}

export const DEVISES: DeviseDef[] = [
  { code: "EUR", label: "Euro (€)" },
  { code: "XOF", label: "Franc CFA · Côte d'Ivoire (FCFA)" },
  { code: "USD", label: "Dollar américain ($)" },
  { code: "GBP", label: "Livre sterling (£)" },
  { code: "CAD", label: "Dollar canadien ($ CA)" },
];

const STORAGE_KEY = "cavira:devise";
const DEFAUT: DeviseCode = "EUR";

export function getStoredDevise(): DeviseCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (DEVISES.some((d) => d.code === v)) return v as DeviseCode;
  } catch {
    // localStorage indisponible : on retombe sur le défaut.
  }
  return DEFAUT;
}

export function setStoredDevise(devise: DeviseCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, devise);
  } catch {
    // Pas grave si la préférence ne persiste pas.
  }
}
