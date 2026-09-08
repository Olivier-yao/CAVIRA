import { useState } from "react";
import type { AppData, PeriodeRetro } from "../../types";
import { addRetrospective } from "../../data/db";
import { formatDateMedium } from "../../lib/format";

interface RetroTabProps {
  data: AppData;
  projetId: string | null;
  onDataChanged: () => void;
}

const PERIODES: { id: PeriodeRetro; label: string }[] = [
  { id: "hebdo", label: "Hebdo" },
  { id: "mensuelle", label: "Mensuelle" },
];

export function RetroTab({ data, projetId, onDataChanged }: RetroTabProps) {
  const retros = data.retrospectives.filter((r) => r.projet_id === projetId);

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [periode, setPeriode] = useState<PeriodeRetro>("hebdo");
  const [bienMarche, setBienMarche] = useState("");
  const [aBloque, setABloque] = useState("");
  const [ajustement, setAjustement] = useState("");
  const [enCours, setEnCours] = useState(false);

  const peutEnregistrer = bienMarche.trim() && aBloque.trim() && ajustement.trim();

  async function handleEnregistrer() {
    if (!peutEnregistrer) return;
    setEnCours(true);
    try {
      await addRetrospective({
        projetId,
        periode,
        bienMarche: bienMarche.trim(),
        aBloque: aBloque.trim(),
        ajustement: ajustement.trim(),
      });
      setBienMarche("");
      setABloque("");
      setAjustement("");
      setPeriode("hebdo");
      setFormulaireOuvert(false);
      onDataChanged();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="retro-tab">
      {!formulaireOuvert ? (
        <button className="btn btn--ghost retro-tab__ouvrir" onClick={() => setFormulaireOuvert(true)}>
          + Nouvelle rétrospective
        </button>
      ) : (
        <div className="card retro-form">
          <div className="retro-form__periode">
            {PERIODES.map((p) => (
              <button
                key={p.id}
                className={`journal-chip${periode === p.id ? " journal-chip--active" : ""}`}
                onClick={() => setPeriode(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="modal-field">
            <span>Qu'est-ce qui a bien marché ?</span>
            <textarea value={bienMarche} onChange={(e) => setBienMarche(e.target.value)} rows={2} />
          </label>
          <label className="modal-field">
            <span>Qu'est-ce qui a bloqué ?</span>
            <textarea value={aBloque} onChange={(e) => setABloque(e.target.value)} rows={2} />
          </label>
          <label className="modal-field">
            <span>Qu'est-ce que j'ajuste pour la suite ?</span>
            <textarea value={ajustement} onChange={(e) => setAjustement(e.target.value)} rows={2} />
          </label>
          <div className="retro-form__actions">
            <button className="btn btn--ghost" onClick={() => setFormulaireOuvert(false)}>
              Annuler
            </button>
            <button className="btn btn--accent" onClick={handleEnregistrer} disabled={!peutEnregistrer || enCours}>
              {enCours ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      <div className="retro-tab__liste">
        {retros.length === 0 && !formulaireOuvert && (
          <p className="retro-tab__vide">
            {projetId === null
              ? "Aucune rétrospective globale pour l'instant."
              : "Aucune rétrospective pour ce projet pour l'instant."}
          </p>
        )}
        {retros.map((r) => (
          <div key={r.id} className="card retro-card">
            <div className="retro-card__entete">
              <span className={`badge retro-card__periode retro-card__periode--${r.periode}`}>
                {r.periode === "hebdo" ? "Hebdo" : "Mensuelle"}
              </span>
              <span className="retro-card__date">{formatDateMedium(r.created_at)}</span>
            </div>
            <RetroChamp label="Bien marché" texte={r.bien_marche} />
            <RetroChamp label="A bloqué" texte={r.a_bloque} />
            <RetroChamp label="Ajustement" texte={r.ajustement} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RetroChamp({ label, texte }: { label: string; texte: string }) {
  return (
    <div className="retro-card__champ">
      <span className="retro-card__champ-label">{label}</span>
      <p className="retro-card__champ-texte">{texte}</p>
    </div>
  );
}
