import type { RoutineCheck } from "../types";
import { calculerStreakJours, dateKey } from "./format";

export interface JourSemaine {
  cle: string;
  label: string;
  estAujourdhui: boolean;
  estFutur: boolean;
}

const JOURS_LABEL = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const JOUR_MS = 24 * 60 * 60 * 1000;

export function joursSemaineCourante(maintenant = new Date()): JourSemaine[] {
  const decalage = (maintenant.getDay() + 6) % 7;
  const lundi = new Date(maintenant.getTime() - decalage * JOUR_MS);
  const aujourdhui = dateKey(maintenant);
  const jours: JourSemaine[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lundi.getTime() + i * JOUR_MS);
    const cle = dateKey(d);
    jours.push({ cle, label: JOURS_LABEL[i], estAujourdhui: cle === aujourdhui, estFutur: cle > aujourdhui });
  }
  return jours;
}

export function estCoche(checks: RoutineCheck[], routineId: string, jourCle: string): boolean {
  return checks.some((c) => c.routine_id === routineId && c.date === jourCle);
}

export function streakRoutine(checks: RoutineCheck[], routineId: string): number {
  const jours = new Set(checks.filter((c) => c.routine_id === routineId).map((c) => c.date));
  return calculerStreakJours(jours);
}

export function joursCochesSemaine(checks: RoutineCheck[], routineId: string, jours: JourSemaine[]): number {
  return jours.filter((j) => !j.estFutur && estCoche(checks, routineId, j.cle)).length;
}
