import "./Dashboard.css";
import type { AppData } from "../types";
import type { DashboardStats } from "../lib/dashboard";
import { formatDateFull, formatDateShort, formatMontant, formatMontantAbs, formatRelative } from "../lib/format";

interface DashboardProps {
  data: AppData;
  stats: DashboardStats;
  onOpenProjet: (projetId: string) => void;
}

const JOURNAL_COLORS: Record<string, string> = {
  action: "var(--accent)",
  depense: "var(--danger)",
  economie: "var(--cyan)",
  benefice_estime: "var(--lime)",
};

const OBJECTIF_PALETTE = ["var(--pink)", "var(--lime)", "var(--cyan)", "var(--accent)"];

export function Dashboard({ data, stats, onOpenProjet }: DashboardProps) {
  const projetsActifs = data.projets.filter((p) => p.statut === "en_cours").length;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Vue globale</h1>
        <p className="dashboard__subtitle">
          {formatDateFull(new Date())} · {projetsActifs} projets actifs
        </p>
        <div className="dashboard__period">
          <span className="period-pill period-pill--active">Ce mois-ci</span>
          <span className="period-pill">30 jours</span>
          <span className="period-pill">Trimestre</span>
        </div>
      </header>

      <section className="stat-grid">
        <StatCard
          label="Projets actifs"
          value={String(stats.projetsActifs)}
          sub={statSubProjets(stats.projetsPause, stats.projetsArchives)}
        />
        <StatCard
          label="Actions ce mois"
          value={String(stats.actionsCeMois)}
          trendPct={stats.actionsDeltaPct}
          sub={`${stats.actionsMoisDernier} le mois dernier`}
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
            <span className="chart-card__meta">28 derniers jours · {stats.regularite28j.reduce((s, j) => s + j.count, 0)} actions</span>
          </div>
          <RegulariteChart data={stats.regularite28j} />
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

function RegulariteChart({ data }: { data: { jour: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="bars">
      {data.map((d) => (
        <div key={d.jour} className="bars__col" title={`${d.jour} · ${d.count} action${d.count > 1 ? "s" : ""}`}>
          <div
            className={`bars__bar${d.count > 0 ? " bars__bar--filled" : ""}`}
            style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
          />
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

function BilanChart({ data }: { data: { label: string; depenses: number; economies: number; benefices: number }[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.depenses, d.economies, d.benefices]));
  return (
    <div className="bilan-chart">
      {data.map((d) => (
        <div key={d.label} className="bilan-chart__group">
          <div className="bilan-chart__bars">
            <div className="bilan-chart__bar" style={{ height: `${(d.depenses / max) * 100}%`, background: "var(--danger)" }} />
            <div className="bilan-chart__bar" style={{ height: `${(d.economies / max) * 100}%`, background: "var(--cyan)" }} />
            <div className="bilan-chart__bar" style={{ height: `${(d.benefices / max) * 100}%`, background: "var(--lime)" }} />
          </div>
          <span className="bilan-chart__label">{d.label}</span>
        </div>
      ))}
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
