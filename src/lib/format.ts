import { getStoredDevise } from "./devise";

const formatteursParDevise = new Map<string, Intl.NumberFormat>();

function currencyFormatter(): Intl.NumberFormat {
  const devise = getStoredDevise();
  let f = formatteursParDevise.get(devise);
  if (!f) {
    f = new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise, maximumFractionDigits: 0 });
    formatteursParDevise.set(devise, f);
  }
  return f;
}

export function formatMontant(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${currencyFormatter().format(value)}`;
}

export function formatMontantAbs(value: number): string {
  return currencyFormatter().format(Math.abs(value));
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseSqlDate(iso: string): Date {
  return new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
}

export function toLocalDateKey(iso: string): string {
  return dateKey(parseSqlDate(iso));
}

export function formatRelative(iso: string): string {
  const then = parseSqlDate(iso);
  const diffMs = Date.now() - then.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "à l'instant";
  if (diffH < 24) return `${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  return `${diffJ} j`;
}

export function formatRelativeLong(iso: string): string {
  const then = parseSqlDate(iso);
  const diffMs = Date.now() - then.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "à l'instant";
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ === 1) return "hier";
  return `il y a ${diffJ} j`;
}

export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

const DATE_FMT_MEDIUM = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const DATE_FMT_DDMM = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" });

export function formatDateMedium(iso: string): string {
  return DATE_FMT_MEDIUM.format(parseSqlDate(iso)).replace(".", "");
}

export function formatDateDDMM(iso: string): string {
  return DATE_FMT_DDMM.format(parseSqlDate(iso));
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const DATE_FMT_FULL = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const MONTH_FMT = new Intl.DateTimeFormat("fr-FR", { month: "short" });

export function formatDateShort(iso: string): string {
  return DATE_FMT.format(parseSqlDate(iso));
}

export function formatDateFull(d: Date): string {
  const s = DATE_FMT_FULL.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const MOIS_ANNEE_FMT = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export function formatMoisAnnee(d: Date): string {
  const s = MOIS_ANNEE_FMT.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatMonthShort(d: Date): string {
  return MONTH_FMT.format(d).replace(".", "").toUpperCase();
}

export function daysUntil(iso: string): number {
  const target = parseSqlDate(iso);
  const today = new Date();
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}
