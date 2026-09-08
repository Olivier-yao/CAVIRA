import { useState } from "react";
import "./FicheRoutine.css";
import type { AppData } from "../types";
import { ajouterNoteRoutine, supprimerRoutine, toggleRoutineCheck } from "../data/db";
import { estCoche, joursCochesSemaine, joursSemaineCourante, streakRoutine } from "../lib/routines";
import { formatDateDDMM, formatDateShort, formatRelativeLong } from "../lib/format";

interface FicheRoutineProps {
  data: AppData;
  routineId: string;
  onBack: () => void;
  onDataChanged: () => void;
  onRoutineSupprimee: () => void;
}

export function FicheRoutine({ data, routineId, onBack, onDataChanged, onRoutineSupprimee }: FicheRoutineProps) {
  const routine = data.routines.find((r) => r.id === routineId);
  const [note, setNote] = useState("");
  const [confirmSuppression, setConfirmSuppression] = useState(false);

  if (!routine) {
    return (
      <div className="fiche-routine">
        <div className="fiche-routine__vide">
          Routine introuvable.{" "}
          <button className="btn btn--ghost" onClick={onBack}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  const jours = joursSemaineCourante();
  const coches = joursCochesSemaine(data.routineChecks, routine.id, jours);
  const streak = streakRoutine(data.routineChecks, routine.id);
  const notes = data.routineNotes
    .filter((n) => n.routine_id === routine.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  async function handleAjouterNote() {
    const contenu = note.trim();
    if (!contenu) return;
    await ajouterNoteRoutine(routine!.id, contenu);
    setNote("");
    onDataChanged();
  }

  async function handleToggle(jourCle: string, futur: boolean) {
    if (futur) return;
    const fait = estCoche(data.routineChecks, routine!.id, jourCle);
    await toggleRoutineCheck(routine!.id, jourCle, fait);
    onDataChanged();
  }

  async function handleSupprimer() {
    if (!confirmSuppression) {
      setConfirmSuppression(true);
      return;
    }
    await supprimerRoutine(routine!.id);
    onRoutineSupprimee();
  }

  return (
    <div className="fiche-routine">
      <div className="fiche-routine__breadcrumb">
        <button onClick={onBack}>Routine</button>
        <span className="fiche-routine__breadcrumb-sep">/</span>
        <span>{routine.titre}</span>
      </div>

      <div className="fiche-routine__header">
        <div className="fiche-routine__header-main">
          <h1>{routine.titre}</h1>
          <div className="fiche-routine__meta">
            <StatItem label="Cette semaine" value={`${coches}/7`} />
            <StatItem label="Série en cours" value={streak > 0 ? `${streak} jour${streak > 1 ? "s" : ""} d'affilée` : "—"} />
            <StatItem label="Créée le" value={formatDateShort(routine.created_at)} />
          </div>
        </div>
        <button
          className="btn btn--ghost fiche-routine__supprimer"
          onClick={handleSupprimer}
          title={confirmSuppression ? "Confirmer la suppression" : "Supprimer cette routine"}
        >
          {confirmSuppression ? "Confirmer la suppression" : "Supprimer"}
        </button>
      </div>

      <div className="card fiche-routine__semaine">
        {jours.map((j) => {
          const fait = estCoche(data.routineChecks, routine.id, j.cle);
          return (
            <div key={j.cle} className="fiche-routine__jour">
              <span className={`fiche-routine__jour-label${j.estAujourdhui ? " fiche-routine__jour-label--auj" : ""}`}>
                {j.label}
              </span>
              <button
                className={`routine-check${fait ? " routine-check--fait" : ""}${j.estFutur ? " routine-check--futur" : ""}`}
                onClick={() => handleToggle(j.cle, j.estFutur)}
                disabled={j.estFutur}
                aria-label={`${routine.titre} — ${j.label}`}
              >
                {fait && "✓"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="fiche-routine__journal">
        <h2>Journal de la routine</h2>
        <div className="card fiche-routine__add">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ce que tu as fait pendant cette session…"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAjouterNote();
            }}
          />
          <div className="fiche-routine__add-actions">
            <button className="btn btn--accent" onClick={handleAjouterNote} disabled={!note.trim()}>
              Ajouter
            </button>
          </div>
        </div>

        <div className="fiche-routine__notes">
          {notes.length === 0 && <p className="fiche-routine__vide-notes">Aucune note pour l'instant.</p>}
          {notes.map((n) => (
            <div key={n.id} className="fiche-routine__note card">
              <div className="fiche-routine__note-date" title={formatRelativeLong(n.created_at)}>
                {formatDateDDMM(n.created_at)}
              </div>
              <p className="fiche-routine__note-contenu">{n.contenu}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="fiche-routine__stat">
      <div className="fiche-routine__stat-label">{label}</div>
      <div className="fiche-routine__stat-value">{value}</div>
    </div>
  );
}
