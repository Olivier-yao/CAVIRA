import { useMemo, useState } from "react";
import "./Dashboard.css";
import type { AppData } from "../types";
import {
  computeDashboardStats,
  type ActionDetail,
  type DashboardStats,
  type EntreeDetail,
  type PeriodeDashboard,
} from "../lib/dashboard";
import { formatDateFull, formatDateShort, formatMontant, formatMontantAbs, formatRelative } from "../lib/format";

interface DashboardProps {
  data: AppData;
  onOpenProjet: (projetId: string) => void;
}

const JOURNAL_COLORS: Record<string, string> = {
  action: "var(--accent)",
  depense: "var(--danger)",
  economie: "var(--cyan)",
  benefice_estime: "var(--lime)",
};

const OBJECTIF_PALETTE = ["var(--pink)", "var(--lime)", "var(--cyan)", "var(--accent)"];

const PERIODES: { id: PeriodeDashboard; label: string }[] = [
  { id: "mois", label: "Ce mois-ci" },
  { id: "30j", label: "30 jours" },
  { id: "trimestre", label: "Trimestre" },
];

export function Dashboard({ data, onOpenProjet }: DashboardProps) {
  const [periode, setPeriode] = useState<PeriodeDashboard>("mois");
  const stats = useMemo(() => computeDashboardStats(data, periode), [data, periode]);
  const projetsActifs = data.projets.filter((p) => p.statut === "en_cours").length;
  const labelActions = periode === "mois" ? "Actions ce mois" : `Actions — ${PERIODES.find((p) => p.id === periode)?.label.toLowerCase()}`;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Vue globale</h1>
        <p className="dashboard__subtitle">
          {formatDateFull(new Date())} · {projetsActifs} projets actifs
        </p>
        <div className="dashboard__period">
          {PERIODES.map((p) => (
            <button
              key={p.id}
              className={`period-pill${periode === p.id ? " period-pill--active" : ""}`}
              onClick={() => setPeriode(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <section className="stat-grid">
        <StatCard
          label="Projets actifs"
          value={String(stats.projetsActifs)}
          sub={statSubProjets(stats.projetsPause, stats.projetsArchives)}
        />
        <StatCard
          label={labelActions}
          value={String(stats.actionsCeMois)}
          trendPct={stats.actionsDeltaPct}
          sub={`${stats.actionsMoisDernier} ${stats.periodeLabelPrecedente}`}
        />
        <StatCard
          label="Bilan net"
          value={formatMontant(stats.bilanNetCeMois)}
          trendPct={stats.bilanDeltaPct}
          sub={`${formatMontantAbs(stats.depensesCeMois)} dépensés · ${formatMontantAbs(stats.gagneCeMois)} gagnés`}
        />
        <StatCard
          label="Échéances < 7 j"
          value={String(stats.echeancesProches)}
          sub={statSubEcheances(stats.echeancesEnRetard, stats.echeancesProjetsTitres)}
        />
      </section>

      <section className="chart-row">
        <div className="card chart-card">
          <div className="chart-card__header">
            <h2>Régularité d'action</h2>
            <span className="chart-card__meta">
              {stats.regularite.label} · {stats.regularite.points.reduce((s, j) => s + j.count, 0)} actions
            </span>
          </div>
          <RegulariteChart data={stats.regularite.points} />
        </div>
        <div className="card chart-card chart-card--narrow">
          <div className="chart-card__header">
            <h2>Bilan financier global</h2>
            <span className="chart-card__meta">6 mois</span>
          </div>
          <ChartLegend />
          <BilanChart data={stats.bilanFinancier6mois} />
        </div>
      </section>

      <section className="row3">
        <ProchaineEcheanceCard stats={stats} onOpenProjet={onOpenProjet} />
        <ProgressionObjectifsCard stats={stats} />
        <DerniereActiviteCard stats={stats} onOpenProjet={onOpenProjet} />
      </section>
    </div>
  );
}

function statSubProjets(pause: number, archives: number): string {
  const parts: string[] = [];
  if (pause > 0) parts.push(`${pause} en pause`);
  if (archives > 0) parts.push(`${archives} archivés`);
  return parts.length ? parts.join(" · ") : "tous actifs";
}

function statSubEcheances(enRetard: number, titres: string[]): string {
  const base = enRetard > 0 ? `dont ${enRetard} en retard` : "aucun retard";
  return titres.length ? `${base} · ${titres.slice(0, 3).join(" · ")}` : base;
}

function StatCard({
  label,
  value,
  sub,
  trendPct,
}: {
  label: string;
  value: string;
  sub: string;
  trendPct?: number | null;
}) {
  return (
    <div className="card stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value-row">
        <span className="stat-card__value">{value}</span>
        {trendPct !== undefined && trendPct !== null && (
          <span className={`stat-card__trend ${trendPct >= 0 ? "stat-card__trend--up" : "stat-card__trend--down"}`}>
            {trendPct >= 0 ? "+" : ""}
            {trendPct} %
          </span>
        )}
      </div>
      <div className="stat-card__sub">{sub}</div>
    </div>
  );
}

function RegulariteChart({ data }: { data: { jour: string; count: number; actions: ActionDetail[] }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="bars">
      {data.map((d) => (
        <div key={d.jour} className="bars__col">
          <div
            className={`bars__bar${d.count > 0 ? " bars__bar--filled" : ""}`}
            style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
          />
          {d.count > 0 && (
            <div className="chart-tooltip">
              <div className="chart-tooltip__titre">
                {formatDateShort(d.jour)} · {d.count} action{d.count > 1 ? "s" : ""}
              </div>
              <ul className="chart-tooltip__liste">
                {d.actions.slice(0, 8).map((a, i) => (
                  <li key={i}>
                    {a.titre}
                    {a.projetTitre && <span className="chart-tooltip__projet"> — {a.projetTitre}</span>}
                  </li>
                ))}
                {d.actions.length > 8 && <li className="chart-tooltip__reste">+{d.actions.length - 8} autres</li>}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="legend">
      <span className="legend__item">
        <span className="legend__dot" style={{ background: "var(--danger)" }} /> Dépenses
      </span>
      <span className="legend__item">
        <span className="legend__dot" style={{ background: "var(--cyan)" }} /> Économies
      </span>
      <span className="legend__item">
        <span className="legend__dot" style={{ background: "var(--lime)" }} /> Bénéfices
      </span>
    </div>
  );
}

interface BilanMois {
  label: string;
  depenses: number;
  economies: number;
  benefices: number;
  depensesDetail: EntreeDetail[];
  economiesDetail: EntreeDetail[];
  beneficesDetail: EntreeDetail[];
}

function BilanChart({ data }: { data: BilanMois[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.depenses, d.economies, d.benefices]));
  return (
    <div className="bilan-chart">
      {data.map((d) => (
        <div key={d.label} className="bilan-chart__group">
          <div className="bilan-chart__bars">
            <BilanBarre montant={d.depenses} max={max} couleur="var(--danger)" titre="Dépenses" mois={d.label} detail={d.depensesDetail} />
            <BilanBarre montant={d.economies} max={max} couleur="var(--cyan)" titre="Économies" mois={d.label} detail={d.economiesDetail} />
            <BilanBarre montant={d.benefices} max={max} couleur="var(--lime)" titre="Bénéfices" mois={d.label} detail={d.beneficesDetail} />
          </div>
          <span className="bilan-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function BilanBarre({
  montant,
  max,
  couleur,
  titre,
  mois,
  detail,
}: {
  montant: number;
  max: number;
  couleur: string;
  titre: string;
  mois: string;
  detail: EntreeDetail[];
}) {
  return (
    <div className="bilan-chart__bar-wrap">
      <div className="bilan-chart__bar" style={{ height: `${(montant / max) * 100}%`, background: couleur }} />
      {montant > 0 && (
        <div className="chart-tooltip chart-tooltip--bar">
          <div className="chart-tooltip__titre">
            {titre} · {mois} · {formatMontantAbs(montant)}
          </div>
          <ul className="chart-tooltip__liste">
            {detail.slice(0, 8).map((e, i) => (
              <li key={i}>
                <span>{e.titre}</span>
                <span className="chart-tooltip__montant">{formatMontantAbs(e.montant)}</span>
              </li>
            ))}
            {detail.length > 8 && <li className="chart-tooltip__reste">+{detail.length - 8} autres</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProchaineEcheanceCard({ stats, onOpenProjet }: { stats: DashboardStats; onOpenProjet: (id: string) => void }) {
  const e = stats.prochaineEcheance;
  return (
    <div className={`card echeance-card${e && e.joursRestants <= 3 ? " echeance-card--urgent" : ""}`}>
      <div className="echeance-card__label">
        <span className="echeance-card__dot" /> Prochaine échéance
      </div>
      {e ? (
        <>
          <div className="echeance-card__titre">{e.titre}</div>
          <div className="echeance-card__sous">
            {e.projetTitre} · {e.sousTitre}
          </div>
          <div className="echeance-card__countdown">
            <span className="echeance-card__jn">
              {e.joursRestants >= 0 ? `J-${e.joursRestants}` : `J+${-e.joursRestants}`}
            </span>
            <span className="echeance-card__date">{formatDateShort(e.dateCible)}</span>
          </div>
          <button className="btn btn--ghost echeance-card__btn" onClick={() => onOpenProjet(e.projetId)}>
            Ouvrir l'étape
          </button>
        </>
      ) : (
        <div className="echeance-card__vide">Aucune échéance à venir.</div>
      )}
    </div>
  );
}

function ProgressionObjectifsCard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="card objectifs-card">
      <h2>Progression par objectif</h2>
      <div className="objectifs-card__list">
        {stats.progressionParObjectif.map((o, i) => (
          <div key={o.objectif.id} className="objectif-row">
            <div className="objectif-row__top">
              <span className="objectif-row__titre">{o.objectif.titre}</span>
              <span className="objectif-row__pct">{o.progression}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${o.progression}%`, background: OBJECTIF_PALETTE[i % OBJECTIF_PALETTE.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DerniereActiviteCard({ stats, onOpenProjet }: { stats: DashboardStats; onOpenProjet: (id: string) => void }) {
  return (
    <div className="card activite-card">
      <div className="activite-card__header">
        <h2>Dernière activité</h2>
        <span className="chart-card__meta">par projet</span>
      </div>
      <div className="activite-card__list">
        {stats.derniereActivite.map((entry) => (
          <button
            key={entry.id}
            className="activite-row"
            style={{ borderLeftColor: JOURNAL_COLORS[entry.type] }}
            onClick={() => onOpenProjet(entry.projet_id)}
          >
            <div className="activite-row__titre">{entry.titre}</div>
            <div className="activite-row__meta">
              <span>{entry.projetTitre}</span>
              <span>{formatRelative(entry.created_at)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
