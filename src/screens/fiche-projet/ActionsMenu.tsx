import { useEffect, useRef, useState } from "react";
import type { Projet } from "../../types";

interface ActionsMenuProps {
  projet: Projet;
  onDupliquer: () => void;
  onArchiverRapide: (statut: "termine" | "abandonne") => void;
  onExporter: () => void;
  onMasquer: () => void;
  onSupprimer: () => void;
}

export function ActionsMenu({ projet, onDupliquer, onArchiverRapide, onExporter, onMasquer, onSupprimer }: ActionsMenuProps) {
  const [ouvert, setOuvert] = useState(false);
  const [confirmSuppression, setConfirmSuppression] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOuvert(false);
        setConfirmSuppression(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ouvert]);

  function fermerApres(action: () => void) {
    action();
    setOuvert(false);
    setConfirmSuppression(false);
  }

  return (
    <div className="actions-menu" ref={ref}>
      <button
        className="btn btn--ghost fiche-projet__more"
        onClick={() => setOuvert((v) => !v)}
        aria-label="Autres actions"
      >
        ···
      </button>
      {ouvert && (
        <div className="actions-menu__popover">
          <button className="actions-menu__item" onClick={() => fermerApres(onDupliquer)}>
            Dupliquer le projet
          </button>
          <button className="actions-menu__item" onClick={() => fermerApres(() => onArchiverRapide("termine"))}>
            Marquer comme terminé
          </button>
          <button className="actions-menu__item" onClick={() => fermerApres(() => onArchiverRapide("abandonne"))}>
            Marquer comme abandonné
          </button>
          <button className="actions-menu__item" onClick={() => fermerApres(onExporter)}>
            Exporter ce projet
          </button>
          <button className="actions-menu__item" onClick={() => fermerApres(onMasquer)}>
            {projet.masque ? "Afficher le projet" : "Masquer le projet"}
          </button>
          <div className="actions-menu__sep" />
          <button
            className="actions-menu__item actions-menu__item--danger"
            onClick={() => {
              if (!confirmSuppression) {
                setConfirmSuppression(true);
                return;
              }
              fermerApres(onSupprimer);
            }}
          >
            {confirmSuppression ? "Confirmer la suppression" : "Supprimer le projet"}
          </button>
        </div>
      )}
    </div>
  );
}
