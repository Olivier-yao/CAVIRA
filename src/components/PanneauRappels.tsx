import "./PanneauRappels.css";
import type { AppData } from "../types";
import { construireRappels, type Rappel } from "../lib/rappels";

interface PanneauRappelsProps {
  data: AppData;
  onClose: () => void;
  onOpenProjet: (projetId: string) => void;
}

export function PanneauRappels({ data, onClose, onOpenProjet }: PanneauRappelsProps) {
  const rappels = construireRappels(data);

  function ouvrir(r: Rappel) {
    onOpenProjet(r.projetId);
    onClose();
  }

  return (
    <div className="panneau-overlay" onClick={onClose}>
      <div className="panneau" onClick={(e) => e.stopPropagation()}>
        <div className="panneau__header">
          <h2>Rappels du jour</h2>
          <button className="panneau__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="panneau__body">
          {rappels.total === 0 && <p className="panneau__vide">Rien à signaler — tout est sous contrôle.</p>}

          {rappels.echeances.length > 0 && (
            <div className="panneau__section">
              <h3>Échéances proches ({rappels.echeances.length})</h3>
              {rappels.echeances.map((r) => (
                <RappelRow key={r.id} rappel={r} onClick={() => ouvrir(r)} />
              ))}
            </div>
          )}

          {rappels.seuils.length > 0 && (
            <div className="panneau__section">
              <h3>Seuils de dépenses dépassés ({rappels.seuils.length})</h3>
              {rappels.seuils.map((r) => (
                <RappelRow key={r.id} rappel={r} onClick={() => ouvrir(r)} />
              ))}
            </div>
          )}

          {rappels.bloquees.length > 0 && (
            <div className="panneau__section">
              <h3>Étapes bloquées ({rappels.bloquees.length})</h3>
              {rappels.bloquees.map((r) => (
                <RappelRow key={r.id} rappel={r} onClick={() => ouvrir(r)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RappelRow({ rappel, onClick }: { rappel: Rappel; onClick: () => void }) {
  return (
    <button className={`panneau-rappel panneau-rappel--${rappel.urgence}`} onClick={onClick}>
      <span className="panneau-rappel__dot" />
      <span className="panneau-rappel__texte">
        <span className="panneau-rappel__titre">{rappel.titre}</span>
        <span className="panneau-rappel__sous">{rappel.sousTitre}</span>
      </span>
    </button>
  );
}
