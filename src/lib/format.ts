const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatMontant(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${currencyFormatter.format(value)}`;
}

export function formatMontantAbs(value: number): string {
  return currencyFormatter.format(Math.abs(value));
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toLocalDateKey(iso: string): string {
  return dateKey(new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")));
}

export function formatRelative(iso: string): string {
  const then = new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  const diffMs = Date.now() - then.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "à l'instant";
  if (diffH < 24) return `${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  return `${diffJ} j`;
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
  return DATE_FMT.format(new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")));
}

export function formatDateFull(d: Date): string {
  const s = DATE_FMT_FULL.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatMonthShort(d: Date): string {
  return MONTH_FMT.format(d).replace(".", "").toUpperCase();
}

export function daysUntil(iso: string): number {
  const target = new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  const today = new Date();
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}
