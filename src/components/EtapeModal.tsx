import { useState } from "react";
import "./modal.css";
import type { PlanEtape, PrioriteEtape, StatutEtape } from "../types";
import { modifierEtape, supprimerEtape } from "../data/db";

interface EtapeModalProps {
  etape: PlanEtape;
  onClose: () => void;
  onSaved: () => void;
}

const STATUTS: { id: StatutEtape; label: string }[] = [
  { id: "a_faire", label: "À faire" },
  { id: "en_cours", label: "En cours" },
  { id: "fait", label: "Fait" },
  { id: "bloque", label: "Bloqué" },
];

const PRIORITES: { id: PrioriteEtape; label: string }[] = [
  { id: "basse", label: "Basse" },
  { id: "moyenne", label: "Moyenne" },
  { id: "haute", label: "Haute" },
];

export function EtapeModal({ etape, onClose, onSaved }: EtapeModalProps) {
  const [titre, setTitre] = useState(etape.titre);
  const [statut, setStatut] = useState<StatutEtape>(etape.statut);
  const [priorite, setPriorite] = useState<PrioriteEtape>(etape.priorite);
  const [dateCible, setDateCible] = useState(etape.date_cible ?? "");
  const [note, setNote] = useState(etape.note ?? "");
  const [enCours, setEnCours] = useState(false);
  const [confirmSuppression, setConfirmSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  async function handleEnregistrer() {
    const t = titre.trim();
    if (!t) return;
    setEnCours(true);
    try {
      await modifierEtape(etape.id, {
        titre: t,
        statut,
        priorite,
        dateCible: dateCible || null,
        note: note.trim() || null,
      });
      onSaved();
    } finally {
      setEnCours(false);
    }
  }

  async function handleSupprimer() {
    if (!confirmSuppression) {
      setConfirmSuppression(true);
      return;
    }
    setSuppressionEnCours(true);
    try {
      await supprimerEtape(etape.id);
      onSaved();
    } finally {
      setSuppressionEnCours(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h2>Modifier l'étape</h2>
          <button className="modal-panel__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="modal-panel__body">
          <label className="modal-field">
            <span>Titre</span>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} autoFocus />
          </label>

          <div className="modal-field-row">
            <label className="modal-field">
              <span>Statut</span>
              <select value={statut} onChange={(e) => setStatut(e.target.value as StatutEtape)}>
                {STATUTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="modal-field">
              <span>Priorité</span>
              <select value={priorite} onChange={(e) => setPriorite(e.target.value as PrioriteEtape)}>
                {PRIORITES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="modal-field">
            <span>Date cible</span>
            <input type="date" value={dateCible.slice(0, 10)} onChange={(e) => setDateCible(e.target.value)} />
          </label>

          <label className="modal-field">
            <span>Note {statut === "bloque" ? "(raison du blocage)" : "(optionnel)"}</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </label>
        </div>

        <div className="modal-panel__footer">
          <button className="btn btn--danger" onClick={handleSupprimer} disabled={suppressionEnCours}>
            {suppressionEnCours ? "Suppression…" : confirmSuppression ? "Confirmer la suppression" : "Supprimer"}
          </button>
          <div className="modal-panel__footer-right">
            <button className="btn btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button className="btn btn--accent" onClick={handleEnregistrer} disabled={!titre.trim() || enCours}>
              {enCours ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
