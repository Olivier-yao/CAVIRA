import { useMemo, useState } from "react";
import "./Routine.css";
import type { AppData } from "../types";
import { ajouterRoutine, supprimerRoutine, toggleRoutineCheck } from "../data/db";
import { estCoche, joursCochesSemaine, joursSemaineCourante, streakRoutine } from "../lib/routines";
import { formatDateShort } from "../lib/format";

interface RoutineProps {
  data: AppData;
  onDataChanged: () => void;
  onOpenRoutine: (routineId: string) => void;
}

export function Routine({ data, onDataChanged, onOpenRoutine }: RoutineProps) {
  const jours = useMemo(() => joursSemaineCourante(), []);
  const routinesActives = data.routines.filter((r) => r.actif).sort((a, b) => a.sort_order - b.sort_order);

  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [nomRoutine, setNomRoutine] = useState("");
  const [confirmSuppressionId, setConfirmSuppressionId] = useState<string | null>(null);

  const jourAujourdhui = jours.find((j) => j.estAujourdhui);
  const totalCasesPossibles = routinesActives.length * jours.filter((j) => !j.estFutur).length;
  const totalCoches = routinesActives.reduce(
    (s, r) => s + joursCochesSemaine(data.routineChecks, r.id, jours),
    0,
  );
  const tauxSemaine = totalCasesPossibles > 0 ? Math.round((totalCoches / totalCasesPossibles) * 100) : 0;

  async function handleAjouter() {
    const nom = nomRoutine.trim();
    if (!nom) return;
    await ajouterRoutine(nom);
    setNomRoutine("");
    setAjoutOuvert(false);
    onDataChanged();
  }

  async function handleSupprimer(id: string) {
    if (confirmSuppressionId !== id) {
      setConfirmSuppressionId(id);
      return;
    }
    await supprimerRoutine(id);
    setConfirmSuppressionId(null);
    onDataChanged();
  }

  async function handleToggle(routineId: string, jourCle: string, futur: boolean) {
    if (futur) return;
    const fait = estCoche(data.routineChecks, routineId, jourCle);
    await toggleRoutineCheck(routineId, jourCle, fait);
    onDataChanged();
  }

  return (
    <div className="routine-screen">
      <header className="routine-screen__header">
        <div>
          <h1>Routine</h1>
          <p className="routine-screen__subtitle">
            Semaine du {formatDateShort(jours[0].cle)} au {formatDateShort(jours[6].cle)} · {tauxSemaine}% complétée
            {jourAujourdhui ? ` · aujourd'hui : ${jourAujourdhui.label}` : ""}
          </p>
        </div>
        <button className="btn btn--accent" onClick={() => setAjoutOuvert((v) => !v)}>
          <span>+</span> Nouvelle routine
        </button>
      </header>

      {ajoutOuvert && (
        <div className="card routine-add-form">
          <input
            value={nomRoutine}
            onChange={(e) => setNomRoutine(e.target.value)}
            placeholder="Sport, lecture, méditation…"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAjouter()}
          />
          <button className="btn btn--accent" onClick={handleAjouter} disabled={!nomRoutine.trim()}>
            Ajouter
          </button>
        </div>
      )}

      {routinesActives.length === 0 ? (
        <p className="routine-screen__vide">Aucune routine pour l'instant — ajoute la première ci-dessus.</p>
      ) : (
        <div className="card routine-table">
          <div className="routine-table__row routine-table__row--entete">
            <div className="routine-table__nom">Routine</div>
            {jours.map((j) => (
              <div key={j.cle} className={`routine-table__jour-entete${j.estAujourdhui ? " routine-table__jour-entete--auj" : ""}`}>
                <span>{j.label}</span>
                <span className="routine-table__jour-date">{Number(j.cle.slice(8, 10))}</span>
              </div>
            ))}
            <div className="routine-table__stats-entete">Cette semaine</div>
          </div>

          {routinesActives.map((r) => {
            const coches = joursCochesSemaine(data.routineChecks, r.id, jours);
            const streak = streakRoutine(data.routineChecks, r.id);
            return (
              <div className="routine-table__row" key={r.id}>
                <div className="routine-table__nom">
                  <span className="routine-table__accent" />
                  <button className="routine-table__titre" onClick={() => onOpenRoutine(r.id)}>
                    {r.titre}
                  </button>
                  <button
                    className="routine-table__supprimer"
                    onClick={() => handleSupprimer(r.id)}
                    title={confirmSuppressionId === r.id ? "Confirmer la suppression" : "Supprimer cette routine"}
                  >
                    {confirmSuppressionId === r.id ? "confirmer ✕" : "✕"}
                  </button>
                </div>
                {jours.map((j) => {
                  const fait = estCoche(data.routineChecks, r.id, j.cle);
                  return (
                    <div key={j.cle} className="routine-table__case">
                      <button
                        className={`routine-check${fait ? " routine-check--fait" : ""}${j.estFutur ? " routine-check--futur" : ""}`}
                        onClick={() => handleToggle(r.id, j.cle, j.estFutur)}
                        disabled={j.estFutur}
                        aria-label={`${r.titre} — ${j.label}`}
                      >
                        {fait && "✓"}
                      </button>
                    </div>
                  );
                })}
                <div className="routine-table__stats">
                  <span className="routine-table__stats-fraction">{coches}/7</span>
                  {streak > 0 && <span className="routine-table__stats-streak">🔥 {streak}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
