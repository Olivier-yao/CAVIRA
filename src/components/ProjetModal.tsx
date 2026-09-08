import { useState } from "react";
import "./modal.css";
import type { AppData, ImportanceProjet, Projet, StatutProjet } from "../types";
import { creerProjet, modifierProjet } from "../data/db";

interface ProjetModalProps {
  data: AppData;
  projetExistant?: Projet;
  objectifIdsExistants?: string[];
  onClose: () => void;
  onSaved: (projetId: string) => void;
}

const STATUTS: { id: StatutProjet; label: string }[] = [
  { id: "idee", label: "Idée" },
  { id: "preparation", label: "En préparation" },
  { id: "en_cours", label: "En cours" },
  { id: "pause", label: "Pause" },
  { id: "termine", label: "Terminé" },
  { id: "abandonne", label: "Abandonné" },
];

const IMPORTANCES: { id: ImportanceProjet; label: string }[] = [
  { id: "basse", label: "Basse" },
  { id: "moyenne", label: "Moyenne" },
  { id: "haute", label: "Haute" },
];

export function ProjetModal({
  data,
  projetExistant,
  objectifIdsExistants,
  onClose,
  onSaved,
}: ProjetModalProps) {
  const modeEdition = !!projetExistant;
  const [titre, setTitre] = useState(projetExistant?.titre ?? "");
  const [categorieId, setCategorieId] = useState(projetExistant?.categorie_id ?? data.categories[0]?.id ?? "");
  const [statut, setStatut] = useState<StatutProjet>(projetExistant?.statut ?? "preparation");
  const [importance, setImportance] = useState<ImportanceProjet>(projetExistant?.importance ?? "moyenne");
  const [description, setDescription] = useState(projetExistant?.description ?? "");
  const [objectifFinal, setObjectifFinal] = useState(projetExistant?.objectif_final ?? "");
  const [objectifIds, setObjectifIds] = useState<Set<string>>(new Set(objectifIdsExistants ?? []));
  const [seuilDepenses, setSeuilDepenses] = useState(
    projetExistant?.seuil_depenses != null ? String(projetExistant.seuil_depenses) : "",
  );
  const [alimenteIds, setAlimenteIds] = useState<Set<string>>(
    new Set(
      projetExistant
        ? data.projetLiens.filter((pl) => pl.projet_id === projetExistant.id).map((pl) => pl.alimente_id)
        : [],
    ),
  );
  const [enCours, setEnCours] = useState(false);

  const autresProjets = data.projets.filter((p) => p.id !== projetExistant?.id);

  function toggleObjectif(id: string) {
    setObjectifIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAlimente(id: string) {
    setAlimenteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleValider() {
    const t = titre.trim();
    if (!t || !categorieId) return;
    setEnCours(true);
    try {
      const seuilParsed = Number(seuilDepenses.replace(",", "."));
      const input = {
        titre: t,
        categorieId,
        statut,
        description: description.trim(),
        objectifFinal: objectifFinal.trim(),
        objectifIds: [...objectifIds],
        seuilDepenses: seuilDepenses.trim() && Number.isFinite(seuilParsed) ? Math.abs(seuilParsed) : null,
        alimenteIds: [...alimenteIds],
        importance,
      };
      if (modeEdition && projetExistant) {
        await modifierProjet(projetExistant.id, input);
        onSaved(projetExistant.id);
      } else {
        const id = await creerProjet(input);
        onSaved(id);
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h2>{modeEdition ? "Modifier le projet" : "Nouveau projet"}</h2>
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

          <div className="modal-field-row">
            <label className="modal-field">
              <span>Importance</span>
              <select value={importance} onChange={(e) => setImportance(e.target.value as ImportanceProjet)}>
                {IMPORTANCES.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="modal-field">
              <span>Seuil de dépenses (optionnel)</span>
              <input
                value={seuilDepenses}
                onChange={(e) => setSeuilDepenses(e.target.value)}
                placeholder="Aucune alerte si vide"
                inputMode="decimal"
              />
            </label>
          </div>

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

          {autresProjets.length > 0 && (
            <div className="modal-field">
              <span>Ce projet alimente (optionnel)</span>
              <div className="modal-objectifs">
                {autresProjets.map((p) => (
                  <button
                    key={p.id}
                    className={`modal-objectif-chip${alimenteIds.has(p.id) ? " modal-objectif-chip--active" : ""}`}
                    onClick={() => toggleAlimente(p.id)}
                  >
                    {p.titre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-panel__footer">
          <div className="modal-panel__footer-right">
            <button className="btn btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button className="btn btn--accent" onClick={handleValider} disabled={!titre.trim() || enCours}>
              {enCours ? "Enregistrement…" : modeEdition ? "Enregistrer" : "Créer le projet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
