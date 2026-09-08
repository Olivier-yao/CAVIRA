import { useState } from "react";
import type { AppData } from "../../types";
import { ajouterPersonneProjet, retirerPersonneProjet } from "../../data/db";

interface CollaborateursProps {
  data: AppData;
  projetId: string;
  onDataChanged: () => void;
}

export function Collaborateurs({ data, projetId, onDataChanged }: CollaborateursProps) {
  const personnes = data.projetPersonnes.filter((p) => p.projet_id === projetId);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function handleAjouter() {
    const n = nom.trim();
    if (!n) return;
    setEnCours(true);
    try {
      await ajouterPersonneProjet(projetId, n);
      setNom("");
      setAjoutOuvert(false);
      onDataChanged();
    } finally {
      setEnCours(false);
    }
  }

  async function handleRetirer(id: string) {
    await retirerPersonneProjet(id);
    onDataChanged();
  }

  return (
    <div className="fiche-projet__liens-groupe">
      <span className="fiche-projet__liens-label">
        {personnes.length === 0 ? "Solo" : `Avec ${personnes.length} collaborateur${personnes.length > 1 ? "s" : ""}`}
      </span>
      {personnes.map((p) => (
        <span key={p.id} className="collaborateur-chip">
          {p.nom}
          <button
            className="collaborateur-chip__retirer"
            onClick={() => handleRetirer(p.id)}
            aria-label={`Retirer ${p.nom}`}
            title="Retirer"
          >
            ✕
          </button>
        </span>
      ))}
      {ajoutOuvert ? (
        <span className="collaborateur-ajout">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAjouter();
              if (e.key === "Escape") setAjoutOuvert(false);
            }}
            placeholder="Nom…"
            autoFocus
          />
          <button className="collaborateur-ajout__valider" onClick={handleAjouter} disabled={!nom.trim() || enCours}>
            OK
          </button>
        </span>
      ) : (
        <button className="fiche-projet__lien-chip" onClick={() => setAjoutOuvert(true)}>
          + Personne
        </button>
      )}
    </div>
  );
}
