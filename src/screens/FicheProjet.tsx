import { useLayoutEffect, useRef, useState } from "react";
import "./fiche-projet/FicheProjet.css";
import type { AppData } from "../types";
import { CategorieBadge, StatutProjetBadge } from "../components/Badges";
import { ProgressRing } from "../components/ProgressRing";
import { formatDateMedium, formatDateShort, formatRelativeLong, daysUntil } from "../lib/format";
import { projetProgressionPct } from "../lib/ficheProjet";
import { PlanAttaqueTab } from "./fiche-projet/PlanAttaqueTab";
import { CalendrierTab } from "./fiche-projet/CalendrierTab";
import { JournalTab } from "./fiche-projet/JournalTab";
import { NotesTab } from "./fiche-projet/NotesTab";

type TabId = "plan" | "calendrier" | "journal" | "notes";

interface FicheProjetProps {
  data: AppData;
  projetId: string;
  onBack: () => void;
  onDataChanged: () => void;
}

export function FicheProjet({ data, projetId, onBack, onDataChanged }: FicheProjetProps) {
  const projet = data.projets.find((p) => p.id === projetId);
  const [activeTab, setActiveTab] = useState<TabId>("plan");

  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    plan: null,
    calendrier: null,
    journal: null,
    notes: null,
  });
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);

  if (!projet) {
    return (
      <div className="fiche-projet">
        <div className="fiche-projet__vide">
          Projet introuvable.{" "}
          <button className="btn btn--ghost" onClick={onBack}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  const categorie = data.categories.find((c) => c.id === projet.categorie_id);
  const objectifIds = new Set(
    data.projetObjectifs.filter((po) => po.projet_id === projet.id).map((po) => po.objectif_id),
  );
  const objectifsTitres = data.objectifs.filter((o) => objectifIds.has(o.id)).map((o) => o.titre);
  const progression = projetProgressionPct(data.etapes, projet.id);
  const nbEtapes = data.etapes.filter((e) => e.projet_id === projet.id).length;
  const nbJournal = data.journal.filter((j) => j.projet_id === projet.id).length;
  const nbNotes = data.notes.filter((n) => n.projet_id === projet.id).length;
  const nbCalendrier =
    data.etapes.filter((e) => e.projet_id === projet.id && e.date_cible).length +
    data.calendrier.filter((c) => c.projet_id === projet.id).length;

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "plan", label: "Plan d'attaque", count: nbEtapes },
    { id: "calendrier", label: "Calendrier", count: nbCalendrier },
    { id: "journal", label: "Journal de suivi", count: nbJournal },
    { id: "notes", label: "Notes", count: nbNotes },
  ];

  return (
    <div className="fiche-projet">
      <div className="fiche-projet__breadcrumb">
        <button onClick={onBack}>Projets</button>
        <span className="fiche-projet__breadcrumb-sep">/</span>
        <span>{projet.titre}</span>
      </div>

      <div className="fiche-projet__header">
        <div className="fiche-projet__header-main">
          <div className="fiche-projet__badges">
            <CategorieBadge categorie={categorie} />
            <StatutProjetBadge statut={projet.statut} />
          </div>
          <h1>{projet.titre}</h1>
          <p className="fiche-projet__description">{projet.description}</p>
          <div className="fiche-projet__meta">
            <MetaItem
              label={objectifsTitres.length > 1 ? "Objectifs rattachés" : "Objectif rattaché"}
              value={objectifsTitres.length ? objectifsTitres.join(" · ") : "—"}
            />
            <MetaItem label="Créé le" value={formatDateMedium(projet.created_at)} />
            <MetaItem label="Mis à jour" value={formatRelativeLong(projet.updated_at)} />
            <MetaItem
              label="Échéance"
              value={projet.echeance_date ? `${formatDateShort(projet.echeance_date)} · J-${daysUntil(projet.echeance_date)}` : "—"}
            />
          </div>
        </div>
        <div className="fiche-projet__header-side">
          <ProgressRing pct={progression} label="Global" />
          <div className="fiche-projet__header-actions">
            <button className="btn btn--ghost" title="Bientôt disponible">
              Modifier
            </button>
            <button className="btn btn--ghost fiche-projet__more" title="Bientôt disponible">
              ···
            </button>
          </div>
        </div>
      </div>

      <nav className="fiche-projet__tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            className={`fiche-projet__tab${activeTab === t.id ? " fiche-projet__tab--active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            <span className="fiche-projet__tab-count">{t.count}</span>
          </button>
        ))}
        <span className="fiche-projet__tab-underline" style={{ left: underline.left, width: underline.width }} />
      </nav>

      <div className="fiche-projet__tab-content" key={activeTab}>
        {activeTab === "plan" && <PlanAttaqueTab data={data} projetId={projet.id} onDataChanged={onDataChanged} />}
        {activeTab === "calendrier" && <CalendrierTab data={data} projetId={projet.id} />}
        {activeTab === "journal" && <JournalTab data={data} projet={projet} onDataChanged={onDataChanged} />}
        {activeTab === "notes" && <NotesTab data={data} projetId={projet.id} onDataChanged={onDataChanged} />}
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-item">
      <div className="meta-item__label">{label}</div>
      <div className="meta-item__value">{value}</div>
    </div>
  );
}
