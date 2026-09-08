import { useState } from "react";
import "./FinancesPerso.css";
import type { AppData, TypeFinancePerso } from "../types";
import { ajouterFinancePerso, supprimerFinancePerso } from "../data/db";
import { calculerTotaux, soldeCumule12Mois } from "../lib/financesPerso";
import { formatDateDDMM, formatMontant, formatMontantAbs } from "../lib/format";

interface FinancesPersoProps {
  data: AppData;
  onDataChanged: () => void;
}

const TYPES: { id: TypeFinancePerso; label: string; couleur: string; couleurDim: string }[] = [
  { id: "entree", label: "Entrée d'argent", couleur: "var(--lime)", couleurDim: "rgba(180, 224, 102, 0.16)" },
  { id: "depense", label: "Dépense", couleur: "var(--danger)", couleurDim: "rgba(246, 91, 91, 0.14)" },
  { id: "economie", label: "Économie", couleur: "var(--cyan)", couleurDim: "rgba(79, 209, 232, 0.16)" },
];

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FinancesPerso({ data, onDataChanged }: FinancesPersoProps) {
  const [type, setType] = useState<TypeFinancePerso>("entree");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(aujourdhui());
  const [note, setNote] = useState("");
  const [confirmSuppressionId, setConfirmSuppressionId] = useState<string | null>(null);

  const entries = data.financesPerso;
  const totaux = calculerTotaux(entries);
  const courbe = soldeCumule12Mois(entries);
  const maxAbs = Math.max(1, ...courbe.map((p) => Math.abs(p.solde)));

  async function handleAjouter() {
    const m = Number(montant.replace(",", "."));
    if (!Number.isFinite(m) || m <= 0 || !note.trim()) return;
    await ajouterFinancePerso({ type, montant: m, note: note.trim(), date });
    setMontant("");
    setNote("");
    setDate(aujourdhui());
    onDataChanged();
  }

  async function handleSupprimer(id: string) {
    if (confirmSuppressionId !== id) {
      setConfirmSuppressionId(id);
      return;
    }
    await supprimerFinancePerso(id);
    setConfirmSuppressionId(null);
    onDataChanged();
  }

  const typeActif = TYPES.find((t) => t.id === type)!;

  return (
    <div className="finances-perso">
      <header className="finances-perso__header">
        <h1>Finances personnelles</h1>
        <p className="finances-perso__subtitle">Indépendant du suivi par projet</p>
      </header>

      <section className="finances-stat-grid">
        <div className="card finances-stat">
          <span className="finances-stat__label">
            <span className="finances-stat__dot" style={{ background: "var(--lime)" }} />
            Total entrées
          </span>
          <span className="finances-stat__valeur" style={{ color: "var(--lime)" }}>
            {formatMontantAbs(totaux.totalEntrees)}
          </span>
          <span className="finances-stat__sub">{entries.filter((e) => e.type === "entree").length} mouvements</span>
        </div>
        <div className="card finances-stat">
          <span className="finances-stat__label">
            <span className="finances-stat__dot" style={{ background: "var(--danger)" }} />
            Total dépenses
          </span>
          <span className="finances-stat__valeur" style={{ color: "var(--danger)" }}>
            {formatMontantAbs(totaux.totalDepenses)}
          </span>
          <span className="finances-stat__sub">{entries.filter((e) => e.type === "depense").length} mouvements</span>
        </div>
        <div className="card finances-stat">
          <span className="finances-stat__label">
            <span className="finances-stat__dot" style={{ background: "var(--cyan)" }} />
            Total économies
          </span>
          <span className="finances-stat__valeur" style={{ color: "var(--cyan)" }}>
            {formatMontantAbs(totaux.totalEconomies)}
          </span>
          <span className="finances-stat__sub">mises de côté, hors solde</span>
        </div>
        <div className="card finances-stat finances-stat--net">
          <span className="finances-stat__label">
            <span className="finances-stat__dot" style={{ background: "var(--accent)" }} />
            Solde net
          </span>
          <span className="finances-stat__valeur">{formatMontant(totaux.soldeNet)}</span>
          <span className="finances-stat__sub">entrées moins dépenses</span>
        </div>
      </section>

      <section className="card finances-ajout">
        <div className="finances-ajout__types">
          {TYPES.map((t) => (
            <button
              key={t.id}
              className={`finances-chip${type === t.id ? " finances-chip--active" : ""}`}
              style={type === t.id ? { borderColor: t.couleur, color: t.couleur } : undefined}
              onClick={() => setType(t.id)}
            >
              <span className="finances-chip__dot" style={{ background: t.couleur }} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="finances-ajout__champs">
          <label className="finances-ajout__champ finances-ajout__champ--montant">
            <span>Montant</span>
            <div className="finances-ajout__montant-input">
              <input
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
              />
              <span className="finances-ajout__devise">€</span>
            </div>
          </label>
          <label className="finances-ajout__champ finances-ajout__champ--date">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="finances-ajout__champ finances-ajout__champ--note">
            <span>Note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="D'où vient cet argent, comment tu l'as eu…"
              rows={2}
            />
          </label>
        </div>
        <div className="finances-ajout__pied">
          <p className="finances-ajout__hint">{typeActif.label} · la note reste la trace la plus utile dans six mois.</p>
          <button className="btn btn--accent" onClick={handleAjouter} disabled={!montant.trim() || !note.trim()}>
            Ajouter
          </button>
        </div>
      </section>

      <section className="card finances-chart">
        <div className="finances-chart__header">
          <div>
            <h2>Évolution du solde</h2>
            <p className="finances-chart__sub">Solde cumulé, 12 derniers mois</p>
          </div>
          <div className="legend">
            <span className="legend__item">
              <span className="legend__dot" style={{ background: "var(--accent)" }} /> Solde cumulé
            </span>
          </div>
        </div>
        <CourbeSolde points={courbe} maxAbs={maxAbs} />
      </section>

      <section className="card finances-table">
        <div className="finances-table__header">
          <h2>Mouvements</h2>
          <span className="finances-table__meta">
            {entries.length} entrée{entries.length > 1 ? "s" : ""} · du plus récent au plus ancien
          </span>
        </div>

        {entries.length === 0 ? (
          <p className="finances-table__vide">Aucun mouvement pour l'instant — ajoute le premier ci-dessus.</p>
        ) : (
          <div className="finances-table__liste">
            <div className="finances-table__row finances-table__row--entete">
              <span>Date</span>
              <span>Type</span>
              <span>Note</span>
              <span className="finances-table__col-montant">Montant</span>
            </div>
            {entries.map((e) => {
              const t = TYPES.find((x) => x.id === e.type)!;
              const signe = e.type === "depense" ? -1 : 1;
              return (
                <div className="finances-table__row" key={e.id}>
                  <span className="mono finances-table__date">{formatDateDDMM(e.date)}</span>
                  <span>
                    <span className="finances-badge" style={{ background: t.couleurDim, color: t.couleur }}>
                      <span className="finances-badge__dot" style={{ background: t.couleur }} />
                      {t.label.replace("Entrée d'argent", "Entrée")}
                    </span>
                  </span>
                  <span className="finances-table__note">{e.note}</span>
                  <span className="mono finances-table__montant" style={{ color: t.couleur }}>
                    {signe > 0 ? "+" : "−"}
                    {formatMontantAbs(e.montant)}
                  </span>
                  <button
                    className="finances-table__supprimer"
                    onClick={() => handleSupprimer(e.id)}
                    title={confirmSuppressionId === e.id ? "Confirmer la suppression" : "Supprimer"}
                  >
                    {confirmSuppressionId === e.id ? "confirmer ✕" : "✕"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function CourbeSolde({ points, maxAbs }: { points: { label: string; solde: number }[]; maxAbs: number }) {
  const largeur = 100;
  const hauteur = 100;
  const pas = points.length > 1 ? largeur / (points.length - 1) : 0;
  const yPour = (solde: number) => hauteur / 2 - (solde / maxAbs) * (hauteur / 2 - 8);
  const coords = points.map((p, i) => [i * pas, yPour(p.solde)] as const);
  const ligne = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const aire = `${ligne} L${coords[coords.length - 1][0]},${hauteur} L0,${hauteur} Z`;
  const yZero = yPour(0);

  return (
    <div className="finances-courbe">
      <svg viewBox={`0 0 ${largeur} ${hauteur}`} preserveAspectRatio="none" className="finances-courbe__svg">
        <defs>
          <linearGradient id="finCourbeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1={yZero} x2={largeur} y2={yZero} className="finances-courbe__zero" vectorEffect="non-scaling-stroke" />
        <path d={aire} fill="url(#finCourbeGrad)" stroke="none" />
        <path d={ligne} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="finances-courbe__labels">
        {points.map((p, i) => (
          <span key={i} className={i === points.length - 1 ? "finances-courbe__label--auj" : undefined}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
