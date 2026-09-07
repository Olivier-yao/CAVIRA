import { useState } from "react";
import "./Objectifs.css";
import type { AppData } from "../types";
import { ProgressRing } from "../components/ProgressRing";
import { ObjectifModal } from "../components/ObjectifModal";
import { buildObjectifCards, type ObjectifCard } from "../lib/objectifs";

interface ObjectifsProps {
  data: AppData;
  onOpenProjet: (projetId: string) => void;
  onDataChanged: () => void;
}

const PALETTE = ["var(--pink)", "var(--lime)", "var(--cyan)", "var(--accent)"];

export function Objectifs({ data, onOpenProjet, onDataChanged }: ObjectifsProps) {
  const cards = buildObjectifCards(data);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [objectifAEditerId, setObjectifAEditerId] = useState<string | null>(null);
  const objectifAEditer = data.objectifs.find((o) => o.id === objectifAEditerId);

  function handleSaved() {
    setModalOuvert(false);
    setObjectifAEditerId(null);
    onDataChanged();
  }

  return (
    <div className="objectifs-screen">
      <header className="objectifs-screen__header">
        <div>
          <h1>Objectifs personnels</h1>
          <p className="objectifs-screen__subtitle">
            {cards.length} objectif{cards.length > 1 ? "s" : ""} · progression calculée depuis les projets rattachés
          </p>
        </div>
        <button className="btn btn--accent" onClick={() => setModalOuvert(true)}>
          <span>+</span> Nouvel objectif
        </button>
      </header>

      {cards.length === 0 ? (
        <p className="objectifs-screen__vide">Aucun objectif pour l'instant.</p>
      ) : (
        <div className="objectifs-grille">
          {cards.map((card, i) => (
            <ObjectifCardVue
              key={card.objectif.id}
              card={card}
              couleur={PALETTE[i % PALETTE.length]}
              onOpenProjet={onOpenProjet}
              onModifier={() => setObjectifAEditerId(card.objectif.id)}
            />
          ))}
        </div>
      )}

      {modalOuvert && <ObjectifModal onClose={() => setModalOuvert(false)} onSaved={handleSaved} />}
      {objectifAEditer && (
        <ObjectifModal
          objectifExistant={objectifAEditer}
          onClose={() => setObjectifAEditerId(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function ObjectifCardVue({
  card,
  couleur,
  onOpenProjet,
  onModifier,
}: {
  card: ObjectifCard;
  couleur: string;
  onOpenProjet: (id: string) => void;
  onModifier: () => void;
}) {
  return (
    <div className="card objectif-card">
      <ProgressRing pct={card.progression} size={52} stroke={6} color={couleur} />
      <div className="objectif-card__body">
        <div className="objectif-card__top">
          <div className="objectif-card__titre">{card.objectif.titre}</div>
          <button className="objectif-card__modifier" onClick={onModifier} aria-label="Modifier l'objectif">
            ···
          </button>
        </div>
        <div className="objectif-card__sous">
          {card.projets.length} projet{card.projets.length > 1 ? "s" : ""} rattaché
          {card.projets.length > 1 ? "s" : ""} · horizon {card.horizon}
        </div>
        <div className="objectif-card__projets">
          {card.projets.map((p) => (
            <button key={p.id} className="objectif-card__projet-chip" onClick={() => onOpenProjet(p.id)}>
              {p.titre}
            </button>
          ))}
          {card.projets.length === 0 && <span className="objectif-card__aucun">Aucun projet rattaché</span>}
        </div>
      </div>
    </div>
  );
}
