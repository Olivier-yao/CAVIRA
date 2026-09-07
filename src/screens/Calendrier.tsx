import { useMemo, useState } from "react";
import "./Calendrier.css";
import type { AppData } from "../types";
import { buildCalendarEvents, buildMonthGrid, buildWeekGrid, type CalendarEvent, type JourGrille } from "../lib/calendrier";
import { formatMoisAnnee } from "../lib/format";

interface CalendrierProps {
  data: AppData;
  onOpenProjet: (projetId: string) => void;
}

type Vue = "mois" | "semaine";
const JOUR_MS = 24 * 60 * 60 * 1000;
const JOURS_SEMAINE = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

export function Calendrier({ data, onOpenProjet }: CalendrierProps) {
  const [reference, setReference] = useState(() => new Date());
  const [vue, setVue] = useState<Vue>("mois");

  const events = useMemo(() => buildCalendarEvents(data), [data]);
  const jours = useMemo(
    () => (vue === "mois" ? buildMonthGrid(reference, events) : buildWeekGrid(reference, events)),
    [vue, reference, events],
  );

  function precedent() {
    setReference((prev) =>
      vue === "mois" ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1) : new Date(prev.getTime() - 7 * JOUR_MS),
    );
  }
  function suivant() {
    setReference((prev) =>
      vue === "mois" ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1) : new Date(prev.getTime() + 7 * JOUR_MS),
    );
  }
  function aujourdhui() {
    setReference(new Date());
  }

  const categoriesUtilisees = data.categories;
  const nbProjetsAvecEvenements = new Set(events.map((e) => e.projetId).filter(Boolean)).size;

  return (
    <div className="calendrier-screen">
      <header className="calendrier-screen__header">
        <div>
          <h1>Calendrier global</h1>
          <p className="calendrier-screen__subtitle">
            {formatMoisAnnee(reference)} · {nbProjetsAvecEvenements} projet{nbProjetsAvecEvenements > 1 ? "s" : ""}
          </p>
        </div>
        <div className="calendrier-screen__nav">
          <button className="btn btn--ghost" onClick={precedent} aria-label="Période précédente">
            ‹
          </button>
          <button className="btn btn--ghost" onClick={aujourdhui}>
            Aujourd'hui
          </button>
          <button className="btn btn--ghost" onClick={suivant} aria-label="Période suivante">
            ›
          </button>
          <div className="calendrier-screen__vue">
            <button className={vue === "mois" ? "active" : ""} onClick={() => setVue("mois")}>
              Mois
            </button>
            <button className={vue === "semaine" ? "active" : ""} onClick={() => setVue("semaine")}>
              Semaine
            </button>
          </div>
        </div>
      </header>

      <div className="calendrier-legende">
        {categoriesUtilisees.map((c) => (
          <span key={c.id} className="calendrier-legende__item">
            <span className="calendrier-legende__dot" style={{ background: c.color }} /> {c.label}
          </span>
        ))}
        <span className="calendrier-legende__item calendrier-legende__item--retard">
          <span className="calendrier-legende__dot" /> Échéance en retard
        </span>
      </div>

      <div className={`calendrier-grille calendrier-grille--${vue}`}>
        {vue === "mois" &&
          JOURS_SEMAINE.map((j) => (
            <div key={j} className="calendrier-grille__entete">
              {j}
            </div>
          ))}
        {jours.map((jour) => (
          <JourCell key={jour.key} jour={jour} vue={vue} onOpenProjet={onOpenProjet} />
        ))}
      </div>
    </div>
  );
}

function JourCell({
  jour,
  vue,
  onOpenProjet,
}: {
  jour: JourGrille;
  vue: Vue;
  onOpenProjet: (id: string) => void;
}) {
  const maxVisible = vue === "mois" ? 3 : 8;
  const visibles = jour.evenements.slice(0, maxVisible);
  const reste = jour.evenements.length - visibles.length;

  return (
    <div
      className={`jour-cell${jour.horsMois ? " jour-cell--hors-mois" : ""}${jour.estAujourdhui ? " jour-cell--aujourdhui" : ""}`}
    >
      {vue === "semaine" && <div className="jour-cell__jour-label">{JOURS_SEMAINE[(jour.date.getDay() + 6) % 7]}</div>}
      <div className="jour-cell__numero">{jour.date.getDate()}</div>
      <div className="jour-cell__evenements">
        {visibles.map((ev) => (
          <EventChip key={ev.id} event={ev} onOpenProjet={onOpenProjet} />
        ))}
        {reste > 0 && <div className="jour-cell__reste">+{reste}</div>}
      </div>
    </div>
  );
}

function EventChip({ event, onOpenProjet }: { event: CalendarEvent; onOpenProjet: (id: string) => void }) {
  return (
    <button
      className={`event-chip${event.enRetard ? " event-chip--retard" : ""}`}
      style={{ borderLeftColor: event.enRetard ? "var(--danger)" : event.categorieColor }}
      onClick={() => event.projetId && onOpenProjet(event.projetId)}
      title={`${event.titre} — ${event.projetTitre}`}
    >
      {event.titre}
    </button>
  );
}
