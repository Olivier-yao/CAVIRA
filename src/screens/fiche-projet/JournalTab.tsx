import { useState } from "react";
import type { AppData, Projet, TypeJournal } from "../../types";
import { syntheseFinanciere } from "../../lib/ficheProjet";
import { formatDateDDMM, formatDuree, formatMontant, formatMontantAbs } from "../../lib/format";
import { addJournalEntry } from "../../data/db";

interface JournalTabProps {
  data: AppData;
  projet: Projet;
  onDataChanged: () => void;
}

const TYPES: { id: TypeJournal; label: string }[] = [
  { id: "action", label: "Action" },
  { id: "depense", label: "Dépense" },
  { id: "economie", label: "Économie" },
  { id: "benefice_estime", label: "Bénéfice estimé" },
];

const TYPE_COLOR: Record<TypeJournal, string> = {
  action: "var(--accent)",
  depense: "var(--danger)",
  economie: "var(--cyan)",
  benefice_estime: "var(--lime)",
};

export function JournalTab({ data, projet, onDataChanged }: JournalTabProps) {
  const [filtre, setFiltre] = useState<TypeJournal>("action");
  const [titre, setTitre] = useState("");
  const [montant, setMontant] = useState("");

  const entries = data.journal.filter((j) => j.projet_id === projet.id);
  const filtered = entries.filter((j) => j.type === filtre);
  const synthese = syntheseFinanciere(data.journal, projet, 30);

  async function handleAjouter() {
    const t = titre.trim();
    if (!t) return;
    const needsMontant = filtre !== "action";
    let montantValue: number | null = null;
    if (needsMontant) {
      const parsed = Number(montant.replace(",", "."));
      if (!Number.isFinite(parsed) || parsed === 0) return;
      montantValue = filtre === "depense" ? -Math.abs(parsed) : Math.abs(parsed);
    }
    await addJournalEntry({ projetId: projet.id, type: filtre, titre: t, montant: montantValue });
    setTitre("");
    setMontant("");
    onDataChanged();
  }

  return (
    <div className="journal-tab">
      <div className="journal-tab__main">
        <div className="journal-tab__chips">
          {TYPES.map((t) => (
            <button
              key={t.id}
              className={`journal-chip${filtre === t.id ? " journal-chip--active" : ""}`}
              style={filtre === t.id ? { borderColor: TYPE_COLOR[t.id], color: TYPE_COLOR[t.id] } : undefined}
              onClick={() => setFiltre(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="journal-tab__add card">
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder={filtre === "action" ? "Session dev 1 h 30 — …" : "Description…"}
            onKeyDown={(e) => e.key === "Enter" && handleAjouter()}
          />
          {filtre !== "action" && (
            <input
              className="journal-tab__add-montant"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0 €"
              inputMode="decimal"
              onKeyDown={(e) => e.key === "Enter" && handleAjouter()}
            />
          )}
          <button className="btn btn--accent" onClick={handleAjouter}>
            Ajouter
          </button>
        </div>

        <div className="journal-tab__list">
          {filtered.length === 0 && <p className="journal-tab__vide">Aucune entrée pour ce type.</p>}
          {filtered.map((entry) => (
            <div key={entry.id} className="journal-entry-row">
              <span className="journal-entry-row__date">{formatDateDDMM(entry.created_at)}</span>
              <span className="badge journal-entry-row__type" style={{ color: TYPE_COLOR[entry.type] }}>
                {TYPES.find((t) => t.id === entry.type)?.label}
              </span>
              <span className="journal-entry-row__titre">{entry.titre}</span>
              <span className="journal-entry-row__valeur">
                {entry.type === "action"
                  ? entry.duree_minutes
                    ? formatDuree(entry.duree_minutes)
                    : ""
                  : formatMontant(entry.montant ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="journal-tab__side">
        <div className="card synthese-card">
          <h3>Synthèse · 30 jours</h3>
          <SyntheseRow label="Total dépensé" value={formatMontantAbs(synthese.totalDepense)} />
          <SyntheseRow label="Total économisé" value={formatMontantAbs(synthese.totalEconomise)} />
          <SyntheseRow label="Bénéfices estimés" value={formatMontantAbs(synthese.totalBenefices)} />
          <SyntheseRow label="Bilan net" value={formatMontant(synthese.bilanNet)} accent />
          <SyntheseRow label="Actions enregistrées" value={String(synthese.nbActions)} />
        </div>

        {synthese.seuilDepasse && (
          <div className="card seuil-card">
            <div className="seuil-card__label">Seuil dépassé</div>
            <p>
              Dépenses cumulées à {formatMontantAbs(synthese.totalDepense)} pour un seuil fixé à{" "}
              {formatMontantAbs(synthese.seuil ?? 0)}. Dérive de {synthese.derivePct}%.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SyntheseRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="synthese-row">
      <span className="synthese-row__label">{label}</span>
      <span className={`synthese-row__value${accent ? " synthese-row__value--accent" : ""}`}>{value}</span>
    </div>
  );
}
