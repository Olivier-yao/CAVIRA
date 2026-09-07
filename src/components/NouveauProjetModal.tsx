import { useState } from "react";
import "./NouveauProjetModal.css";
import type { AppData, StatutProjet } from "../types";
import { creerProjet } from "../data/db";

interface NouveauProjetModalProps {
  data: AppData;
  onClose: () => void;
  onCreated: (projetId: string) => void;
}

const STATUTS: { id: StatutProjet; label: string }[] = [
  { id: "idee", label: "Idée" },
  { id: "preparation", label: "En préparation" },
  { id: "en_cours", label: "En cours" },
];

export function NouveauProjetModal({ data, onClose, onCreated }: NouveauProjetModalProps) {
  const [titre, setTitre] = useState("");
  const [categorieId, setCategorieId] = useState(data.categories[0]?.id ?? "");
  const [statut, setStatut] = useState<StatutProjet>("preparation");
  const [description, setDescription] = useState("");
  const [objectifFinal, setObjectifFinal] = useState("");
  const [objectifIds, setObjectifIds] = useState<Set<string>>(new Set());
  const [enCours, setEnCours] = useState(false);

  function toggleObjectif(id: string) {
    setObjectifIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreer() {
    const t = titre.trim();
    if (!t || !categorieId) return;
    setEnCours(true);
    try {
      const id = await creerProjet({
        titre: t,
        categorieId,
        statut,
        description: description.trim(),
        objectifFinal: objectifFinal.trim(),
        objectifIds: [...objectifIds],
      });
      onCreated(id);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h2>Nouveau projet</h2>
          <button className="modal-panel__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="modal-panel__body">
          <label className="modal-field">
            <span>Titre</span>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Nom du projet…" autoFocus />
          </label>

          <div className="modal-field-row">
            <label className="modal-field">
              <span>Catégorie</span>
              <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)}>
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="modal-field">
              <span>Statut</span>
              <select value={statut} onChange={(e) => setStatut(e.target.value as StatutProjet)}>
                {STATUTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="modal-field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="De quoi s'agit-il ?"
              rows={3}
            />
          </label>

          <label className="modal-field">
            <span>Objectif final</span>
            <input
              value={objectifFinal}
              onChange={(e) => setObjectifFinal(e.target.value)}
              placeholder="Que veux-tu obtenir avec ce projet ?"
            />
          </label>

          {data.objectifs.length > 0 && (
            <div className="modal-field">
              <span>Objectifs de vie rattachés (optionnel)</span>
              <div className="modal-objectifs">
                {data.objectifs.map((o) => (
                  <button
                    key={o.id}
                    className={`modal-objectif-chip${objectifIds.has(o.id) ? " modal-objectif-chip--active" : ""}`}
                    onClick={() => toggleObjectif(o.id)}
                  >
                    {o.titre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-panel__footer">
          <button className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn--accent" onClick={handleCreer} disabled={!titre.trim() || enCours}>
            {enCours ? "Création…" : "Créer le projet"}
          </button>
        </div>
      </div>
    </div>
  );
}
