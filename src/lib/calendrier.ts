import type { AppData } from "../types";
import { dateKey, daysUntil } from "./format";

export interface CalendarEvent {
  id: string;
  dateKey: string;
  titre: string;
  projetId: string | null;
  projetTitre: string;
  categorieColor: string;
  enRetard: boolean;
  etapeId: string | null;
}

export function buildCalendarEvents(data: AppData): CalendarEvent[] {
  const categorieColor = new Map(data.categories.map((c) => [c.id, c.color]));
  const projetById = new Map(data.projets.map((p) => [p.id, p]));
  const events: CalendarEvent[] = [];

  for (const e of data.etapes) {
    if (!e.date_cible || e.statut === "fait") continue;
    const p = projetById.get(e.projet_id);
    if (!p) continue;
    events.push({
      id: `etape-${e.id}`,
      dateKey: e.date_cible.slice(0, 10),
      titre: e.titre,
      projetId: p.id,
      projetTitre: p.titre,
      categorieColor: categorieColor.get(p.categorie_id) ?? "var(--text-3)",
      enRetard: daysUntil(e.date_cible) < 0,
      etapeId: e.id,
    });
  }

  for (const c of data.calendrier) {
    const p = c.projet_id ? projetById.get(c.projet_id) : undefined;
    events.push({
      id: `cal-${c.id}`,
      dateKey: c.date.slice(0, 10),
      titre: c.titre,
      projetId: p?.id ?? null,
      projetTitre: p?.titre ?? "",
      categorieColor: p ? (categorieColor.get(p.categorie_id) ?? "var(--text-3)") : "var(--text-3)",
      enRetard: daysUntil(c.date) < 0,
      etapeId: null,
    });
  }

  for (const p of data.projets) {
    if (!p.echeance_date) continue;
    events.push({
      id: `proj-${p.id}`,
      dateKey: p.echeance_date.slice(0, 10),
      titre: `Échéance — ${p.titre}`,
      projetId: p.id,
      projetTitre: p.titre,
      categorieColor: categorieColor.get(p.categorie_id) ?? "var(--text-3)",
      enRetard: daysUntil(p.echeance_date) < 0,
      etapeId: null,
    });
  }

  return events;
}

export interface JourGrille {
  date: Date;
  key: string;
  horsMois: boolean;
  estAujourdhui: boolean;
  evenements: CalendarEvent[];
}

const JOUR_MS = 24 * 60 * 60 * 1000;

export function buildMonthGrid(mois: Date, events: CalendarEvent[]): JourGrille[] {
  const annee = mois.getFullYear();
  const moisIdx = mois.getMonth();
  const premierDuMois = new Date(annee, moisIdx, 1);
  // Lundi = 0 ... Dimanche = 6
  const decalage = (premierDuMois.getDay() + 6) % 7;
  const debut = new Date(premierDuMois.getTime() - decalage * JOUR_MS);

  const today = dateKey(new Date());
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const list = eventsByDay.get(ev.dateKey) ?? [];
    list.push(ev);
    eventsByDay.set(ev.dateKey, list);
  }

  const jours: JourGrille[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(debut.getTime() + i * JOUR_MS);
    const key = dateKey(d);
    jours.push({
      date: d,
      key,
      horsMois: d.getMonth() !== moisIdx,
      estAujourdhui: key === today,
      evenements: (eventsByDay.get(key) ?? []).sort((a, b) => a.titre.localeCompare(b.titre)),
    });
  }
  return jours;
}

export function buildWeekGrid(jourReference: Date, events: CalendarEvent[]): JourGrille[] {
  const decalage = (jourReference.getDay() + 6) % 7;
  const lundi = new Date(jourReference.getTime() - decalage * JOUR_MS);
  const today = dateKey(new Date());
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const list = eventsByDay.get(ev.dateKey) ?? [];
    list.push(ev);
    eventsByDay.set(ev.dateKey, list);
  }
  const jours: JourGrille[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lundi.getTime() + i * JOUR_MS);
    const key = dateKey(d);
    jours.push({
      date: d,
      key,
      horsMois: false,
      estAujourdhui: key === today,
      evenements: (eventsByDay.get(key) ?? []).sort((a, b) => a.titre.localeCompare(b.titre)),
    });
  }
  return jours;
}
