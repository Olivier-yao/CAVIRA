import { useMemo } from "react";
import "./Roadmap.css";
import type { AppData } from "../types";
import { buildRoadmapRows, buildTimelineTrimestres, type RoadmapRow } from "../lib/roadmap";

interface RoadmapProps {
  data: AppData;
  onOpenProjet: (projetId: string) => void;
}

const NB_TRIMESTRES = 6;

export function Roadmap({ data, onOpenProjet }: RoadmapProps) {
  const maintenant = useMemo(() => new Date(), []);
  const trimestres = useMemo(() => buildTimelineTrimestres(maintenant, NB_TRIMESTRES), [maintenant]);
  const rows = useMemo(() => buildRoadmapRows(data, maintenant, NB_TRIMESTRES), [data, maintenant]);

  const anneeDebut = trimestres[0].annee;
  const anneeFin = trimestres[trimestres.length - 1].annee;

  const gridTemplate = `220px repeat(${NB_TRIMESTRES}, 1fr)`;

  return (
    <div className="roadmap-screen">
      <header className="roadmap-screen__header">
        <h1>Roadmap globale</h1>
        <p className="roadmap-screen__subtitle">
          {anneeDebut === anneeFin ? anneeDebut : `${anneeDebut} — ${anneeFin}`} · projets actuels et futurs, reliés à
          leurs objectifs
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="roadmap-screen__vide">Aucun projet à positionner sur la roadmap.</p>
      ) : (
        <div className="roadmap-table">
          <div className="roadmap-row roadmap-row--entete" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="roadmap-cell-entete">Projet / Objectif</div>
            {trimestres.map((t, i) => (
              <div key={i} className="roadmap-cell-entete roadmap-cell-entete--trimestre">
                T{t.trimestre} {t.annee}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <RoadmapLigne
              key={row.projet.id}
              row={row}
              gridTemplate={gridTemplate}
              nbTrimestres={NB_TRIMESTRES}
              onOpenProjet={onOpenProjet}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RoadmapLigne({
  row,
  gridTemplate,
  nbTrimestres,
  onOpenProjet,
}: {
  row: RoadmapRow;
  gridTemplate: string;
  nbTrimestres: number;
  onOpenProjet: (id: string) => void;
}) {
  return (
    <div className="roadmap-row" style={{ gridTemplateColumns: gridTemplate }}>
      <div className="roadmap-cell-label">
        <div className="roadmap-cell-label__titre">{row.projet.titre}</div>
        {row.objectifTitre && <div className="roadmap-cell-label__objectif">{row.objectifTitre}</div>}
      </div>
      <div className="roadmap-cell-piste" style={{ gridColumn: `2 / span ${nbTrimestres}` }}>
        {Array.from({ length: nbTrimestres }).map((_, i) => (
          <div key={i} className="roadmap-cell-piste__colonne" />
        ))}
        <button
          className={`roadmap-barre${row.continu ? " roadmap-barre--continu" : ""}`}
          style={{
            gridColumn: `${row.startIndex + 1} / span ${row.endIndex - row.startIndex + 1}`,
            background: `color-mix(in srgb, ${row.categorieColor} 22%, transparent)`,
            borderColor: row.categorieColor,
            color: row.categorieColor,
          }}
          onClick={() => onOpenProjet(row.projet.id)}
          title={`${row.projet.titre} — ${row.progression}% terminé`}
        >
          {row.progression}%
        </button>
      </div>
    </div>
  );
}
