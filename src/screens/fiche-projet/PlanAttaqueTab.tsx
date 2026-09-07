import { useState } from "react";
import type { AppData, PlanEtape } from "../../types";
import { PrioriteBadge, StatutEtapeBadge } from "../../components/Badges";
import { formatDateShort } from "../../lib/format";
import { buildArbreEtapes, repartitionEtapes, type EtapeNode } from "../../lib/ficheProjet";
import { addEtape, toggleEtapeStatut } from "../../data/db";
import { EtapeModal } from "../../components/EtapeModal";

interface PlanAttaqueTabProps {
  data: AppData;
  projetId: string;
  onDataChanged: () => void;
}

export function PlanAttaqueTab({ data, projetId, onDataChanged }: PlanAttaqueTabProps) {
  const arbre = buildArbreEtapes(data.etapes, projetId);
  const repartition = repartitionEtapes(data.etapes, projetId);
  const [showAdd, setShowAdd] = useState(false);
  const [titreAdd, setTitreAdd] = useState("");
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [etapeAEditerId, setEtapeAEditerId] = useState<string | null>(null);
  const etapeAEditer = data.etapes.find((e) => e.id === etapeAEditerId) ?? null;

  async function handleToggle(etape: PlanEtape) {
    const next = etape.statut === "fait" ? "a_faire" : "fait";
    if (next === "fait") {
      setJustCompleted(etape.id);
      window.setTimeout(() => setJustCompleted(null), 480);
    }
    await toggleEtapeStatut(etape.id, next);
    onDataChanged();
  }

  async function handleAdd() {
    const titre = titreAdd.trim();
    if (!titre) {
      setShowAdd(false);
      return;
    }
    const maxSort = Math.max(0, ...data.etapes.filter((e) => e.projet_id === projetId && !e.parent_id).map((e) => e.sort_order));
    await addEtape(projetId, titre, maxSort + 1);
    setTitreAdd("");
    setShowAdd(false);
    onDataChanged();
  }

  const etapeBloquee = data.etapes.find((e) => e.projet_id === projetId && e.statut === "bloque" && e.note);
  const noteAttachee = data.notes.find(
    (n) => n.projet_id === projetId && n.etape_id && data.etapes.some((e) => e.id === n.etape_id),
  );
  const etapeDeLaNote = noteAttachee ? data.etapes.find((e) => e.id === noteAttachee.etape_id) : null;
  const codeDeLaNote =
    etapeDeLaNote && etapeDeLaNote.parent_id
      ? `${data.etapes.find((e) => e.id === etapeDeLaNote.parent_id)?.sort_order}.${etapeDeLaNote.sort_order}`
      : etapeDeLaNote
        ? String(etapeDeLaNote.sort_order)
        : "";

  return (
    <div className="plan-attaque">
      <div className="plan-attaque__main">
        <div className="plan-attaque__toolbar">
          <div>
            <h2>Plan d'attaque</h2>
            <span className="plan-attaque__sub">
              {repartition.fait}/{repartition.total} étapes terminées
            </span>
          </div>
          {showAdd ? (
            <div className="plan-attaque__add-form">
              <input
                autoFocus
                value={titreAdd}
                onChange={(e) => setTitreAdd(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") setShowAdd(false);
                }}
                placeholder="Titre de l'étape…"
              />
              <button className="btn btn--accent" onClick={handleAdd}>
                Ajouter
              </button>
            </div>
          ) : (
            <button className="btn btn--ghost" onClick={() => setShowAdd(true)}>
              + Ajout rapide
            </button>
          )}
        </div>

        <div className="plan-attaque__list">
          {arbre.map((etape) => (
            <EtapeRow
              key={etape.id}
              etape={etape}
              depth={0}
              onToggle={handleToggle}
              onOuvrir={setEtapeAEditerId}
              justCompleted={justCompleted}
            />
          ))}
        </div>
      </div>

      <div className="plan-attaque__side">
        <div className="card repartition-card">
          <h3>Répartition</h3>
          <RepartitionRow label="Terminées" value={repartition.fait} color="var(--lime)" />
          <RepartitionRow label="En cours" value={repartition.en_cours} color="var(--accent)" />
          <RepartitionRow label="À faire" value={repartition.a_faire} color="var(--text-3)" />
          <RepartitionRow label="Bloquées" value={repartition.bloque} color="var(--danger)" />
        </div>

        {noteAttachee && (
          <div className="card note-attachee-card">
            <h3>Note attachée à {codeDeLaNote}</h3>
            <p>{noteAttachee.contenu}</p>
            {noteAttachee.tags && (
              <div className="note-attachee-card__tags">
                {noteAttachee.tags.split(",").map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {etapeBloquee && (
          <div className="card bloque-banner">
            <div className="bloque-banner__label">Bloqué</div>
            <div className="bloque-banner__texte">
              Étape {etapeBloquee.sort_order} — {etapeBloquee.titre} {etapeBloquee.note}
            </div>
          </div>
        )}
      </div>

      {etapeAEditer && (
        <EtapeModal
          etape={etapeAEditer}
          onClose={() => setEtapeAEditerId(null)}
          onSaved={() => {
            setEtapeAEditerId(null);
            onDataChanged();
          }}
        />
      )}
    </div>
  );
}

function RepartitionRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="repartition-row">
      <span className="repartition-row__dot" style={{ background: color }} />
      <span className="repartition-row__label">{label}</span>
      <span className="repartition-row__value">{value}</span>
    </div>
  );
}

function EtapeRow({
  etape,
  depth,
  onToggle,
  onOuvrir,
  justCompleted,
}: {
  etape: EtapeNode;
  depth: number;
  onToggle: (e: PlanEtape) => void;
  onOuvrir: (id: string) => void;
  justCompleted: string | null;
}) {
  const fait = etape.statut === "fait";
  return (
    <>
      <div
        className={`etape-row${depth > 0 ? " etape-row--enfant" : ""}${fait ? " etape-row--fait" : ""}`}
        onClick={() => onOuvrir(etape.id)}
      >
        <button
          className={`etape-row__check${justCompleted === etape.id ? " etape-row__check--pop" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(etape);
          }}
          aria-label={fait ? "Marquer à faire" : "Marquer fait"}
        >
          {fait ? "✓" : ""}
        </button>
        <span className="etape-row__code">{etape.code}</span>
        <span className="etape-row__titre">{etape.titre}</span>
        <PrioriteBadge priorite={etape.priorite} />
        <StatutEtapeBadge statut={etape.statut} />
        <span className="etape-row__date">{etape.date_cible ? formatDateShort(etape.date_cible) : "—"}</span>
      </div>
      {etape.enfants.map((enfant) => (
        <EtapeRow
          key={enfant.id}
          etape={enfant}
          depth={depth + 1}
          onToggle={onToggle}
          onOuvrir={onOuvrir}
          justCompleted={justCompleted}
        />
      ))}
    </>
  );
}
