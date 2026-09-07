import { useState } from "react";
import "./Backlog.css";
import type { AppData } from "../types";
import { CategorieBadge } from "../components/Badges";
import { formatDateMedium, formatDateShort } from "../lib/format";
import { addIdee, promouvoirIdee } from "../data/db";

interface BacklogProps {
  data: AppData;
  onOpenProjet: (projetId: string) => void;
  onDataChanged: () => Promise<void> | void;
}

export function Backlog({ data, onOpenProjet, onDataChanged }: BacklogProps) {
  const idees = data.idees;
  const [selectionId, setSelectionId] = useState<string | null>(idees[0]?.id ?? null);
  const [showAdd, setShowAdd] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [categorieId, setCategorieId] = useState(data.categories[0]?.id ?? "");
  const [interet, setInteret] = useState(3);

  const selection = idees.find((i) => i.id === selectionId) ?? null;

  async function handleAjouter() {
    const t = titre.trim();
    if (!t) return;
    await addIdee({ titre: t, description: description.trim(), categorieId: categorieId || null, interet });
    setTitre("");
    setDescription("");
    setInteret(3);
    setShowAdd(false);
    await onDataChanged();
  }

  async function handlePromouvoir() {
    if (!selection) return;
    const nouveauId = await promouvoirIdee(selection);
    setSelectionId(null);
    await onDataChanged();
    onOpenProjet(nouveauId);
  }

  return (
    <div className="backlog-screen">
      <header className="backlog-screen__header">
        <div>
          <h1>Backlog d'idées</h1>
          <p className="backlog-screen__subtitle">
            {idees.length} idée{idees.length > 1 ? "s" : ""} en réserve · triées par niveau d'intérêt
          </p>
        </div>
        <button className="btn btn--accent" onClick={() => setShowAdd((v) => !v)}>
          <span>+</span> Note rapide
        </button>
      </header>

      {showAdd && (
        <div className="card backlog-add">
          <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre de l'idée…" autoFocus />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)…"
            rows={2}
          />
          <div className="backlog-add__footer">
            <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)}>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="backlog-add__interet">
              Intérêt
              <InteretBars interet={interet} onChange={setInteret} interactif />
            </div>
            <button className="btn btn--accent" onClick={handleAjouter}>
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div className="backlog-layout">
        <div className="backlog-liste">
          {idees.length === 0 && <p className="backlog-screen__vide">Aucune idée en réserve.</p>}
          {idees.map((idee) => (
            <button
              key={idee.id}
              className={`card backlog-item${selectionId === idee.id ? " backlog-item--active" : ""}`}
              onClick={() => setSelectionId(idee.id)}
            >
              <InteretBars interet={idee.interet} />
              <div className="backlog-item__body">
                <div className="backlog-item__top">
                  <CategorieBadge categorie={data.categories.find((c) => c.id === idee.categorie_id)} />
                  <span className="backlog-item__date">{formatDateShort(idee.created_at)}</span>
                </div>
                <div className="backlog-item__titre">{idee.titre}</div>
                <p className="backlog-item__description">{idee.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="card backlog-fiche">
          {selection ? (
            <>
              <div className="backlog-fiche__label">Fiche idée</div>
              <div className="backlog-fiche__titre">{selection.titre}</div>
              <div className="backlog-fiche__badges">
                <CategorieBadge categorie={data.categories.find((c) => c.id === selection.categorie_id)} />
                <span className="backlog-fiche__interet-label">Intérêt {selection.interet}/5</span>
              </div>
              <p className="backlog-fiche__description">{selection.description}</p>
              <div className="backlog-fiche__meta">
                <MetaItem label="Noté le" value={formatDateMedium(selection.created_at)} />
                <MetaItem label="Effort estimé" value={selection.effort_estime ?? "—"} />
                <MetaItem
                  label="Objectif visé"
                  value={data.objectifs.find((o) => o.id === selection.objectif_id)?.titre ?? "—"}
                />
              </div>
              <button className="btn btn--accent backlog-fiche__promouvoir" onClick={handlePromouvoir}>
                Promouvoir en projet actif
              </button>
            </>
          ) : (
            <p className="backlog-screen__vide">Sélectionne une idée pour voir le détail.</p>
          )}
        </div>
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

function InteretBars({
  interet,
  onChange,
  interactif,
}: {
  interet: number;
  onChange?: (n: number) => void;
  interactif?: boolean;
}) {
  return (
    <div className={`interet-bars${interactif ? " interet-bars--interactif" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`interet-bars__bar${n <= interet ? " interet-bars__bar--on" : ""}`}
          style={{ height: `${6 + n * 2}px` }}
          onClick={interactif && onChange ? () => onChange(n) : undefined}
        />
      ))}
    </div>
  );
}
