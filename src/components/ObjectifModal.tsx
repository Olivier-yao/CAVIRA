import { useState } from "react";
import "./modal.css";
import type { Objectif } from "../types";
import { addObjectif, modifierObjectif, supprimerObjectif } from "../data/db";

interface ObjectifModalProps {
  objectifExistant?: Objectif;
  onClose: () => void;
  onSaved: () => void;
}

export function ObjectifModal({ objectifExistant, onClose, onSaved }: ObjectifModalProps) {
  const modeEdition = !!objectifExistant;
  const [titre, setTitre] = useState(objectifExistant?.titre ?? "");
  const [description, setDescription] = useState(objectifExistant?.description ?? "");
  const [enCours, setEnCours] = useState(false);
  const [confirmSuppression, setConfirmSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  async function handleValider() {
    const t = titre.trim();
    if (!t) return;
    setEnCours(true);
    try {
      if (modeEdition && objectifExistant) {
        await modifierObjectif(objectifExistant.id, t, description.trim());
      } else {
        await addObjectif(t, description.trim());
      }
      onSaved();
    } finally {
      setEnCours(false);
    }
  }

  async function handleSupprimer() {
    if (!objectifExistant) return;
    if (!confirmSuppression) {
      setConfirmSuppression(true);
      return;
    }
    setSuppressionEnCours(true);
    try {
      await supprimerObjectif(objectifExistant.id);
      onSaved();
    } finally {
      setSuppressionEnCours(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel modal-panel--small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h2>{modeEdition ? "Modifier l'objectif" : "Nouvel objectif"}</h2>
          <button className="modal-panel__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="modal-panel__body">
          <label className="modal-field">
            <span>Titre</span>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. Vivre de mes projets"
              autoFocus
            />
          </label>
          <label className="modal-field">
            <span>Description (optionnel)</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
        </div>

        <div className="modal-panel__footer">
          {modeEdition && (
            <button className="btn btn--danger" onClick={handleSupprimer} disabled={suppressionEnCours}>
              {suppressionEnCours ? "Suppression…" : confirmSuppression ? "Confirmer la suppression" : "Supprimer"}
            </button>
          )}
          <div className="modal-panel__footer-right">
            <button className="btn btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button className="btn btn--accent" onClick={handleValider} disabled={!titre.trim() || enCours}>
              {enCours ? "Enregistrement…" : modeEdition ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
