import { useEffect, useMemo, useRef, useState } from "react";
import "./CommandPalette.css";
import type { AppData } from "../types";
import type { Screen } from "./Sidebar";

interface CommandPaletteProps {
  data: AppData;
  onClose: () => void;
  onOpenProjet: (projetId: string) => void;
  onNavigate: (screen: Screen) => void;
}

interface Resultat {
  id: string;
  badge: string;
  label: string;
  sublabel?: string;
  action: () => void;
}

const MAX_PAR_GROUPE = 5;

export function CommandPalette({ data, onClose, onOpenProjet, onNavigate }: CommandPaletteProps) {
  const [requete, setRequete] = useState("");
  const [selection, setSelection] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const groupes = useMemo(() => {
    const q = requete.trim().toLowerCase();
    if (!q) return [] as { titre: string; items: Resultat[] }[];

    const projetTitre = (id: string) => data.projets.find((p) => p.id === id)?.titre ?? "";

    const projets: Resultat[] = data.projets
      .filter((p) => p.titre.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, MAX_PAR_GROUPE)
      .map((p) => ({
        id: p.id,
        badge: "Projet",
        label: p.titre,
        sublabel: p.description,
        action: () => onOpenProjet(p.id),
      }));

    const etapes: Resultat[] = data.etapes
      .filter((e) => e.titre.toLowerCase().includes(q))
      .slice(0, MAX_PAR_GROUPE)
      .map((e) => ({
        id: e.id,
        badge: "Étape",
        label: e.titre,
        sublabel: projetTitre(e.projet_id),
        action: () => onOpenProjet(e.projet_id),
      }));

    const notes: Resultat[] = data.notes
      .filter((n) => n.titre.toLowerCase().includes(q) || n.contenu.toLowerCase().includes(q))
      .slice(0, MAX_PAR_GROUPE)
      .map((n) => ({
        id: n.id,
        badge: "Note",
        label: n.titre,
        sublabel: projetTitre(n.projet_id),
        action: () => onOpenProjet(n.projet_id),
      }));

    const objectifs: Resultat[] = data.objectifs
      .filter((o) => o.titre.toLowerCase().includes(q) || o.description.toLowerCase().includes(q))
      .slice(0, MAX_PAR_GROUPE)
      .map((o) => ({
        id: o.id,
        badge: "Objectif",
        label: o.titre,
        sublabel: o.description,
        action: () => onNavigate("objectifs"),
      }));

    const idees: Resultat[] = data.idees
      .filter((i) => i.titre.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
      .slice(0, MAX_PAR_GROUPE)
      .map((i) => ({
        id: i.id,
        badge: "Idée",
        label: i.titre,
        sublabel: i.description,
        action: () => onNavigate("backlog"),
      }));

    return [
      { titre: "Projets", items: projets },
      { titre: "Étapes", items: etapes },
      { titre: "Notes", items: notes },
      { titre: "Objectifs", items: objectifs },
      { titre: "Idées", items: idees },
    ].filter((g) => g.items.length > 0);
  }, [requete, data, onOpenProjet, onNavigate]);

  const plat = useMemo(() => groupes.flatMap((g) => g.items), [groupes]);

  useEffect(() => {
    setSelection(0);
  }, [requete]);

  function valider(resultat: Resultat) {
    resultat.action();
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (plat.length > 0) setSelection((s) => (s + 1) % plat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (plat.length > 0) setSelection((s) => (s - 1 + plat.length) % plat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (plat[selection]) valider(plat[selection]);
    }
  }

  let index = -1;

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-panel" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-row">
          <span className="palette-input-icon">⌕</span>
          <input
            ref={inputRef}
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un projet, une note, une étape…"
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-results">
          {!requete.trim() && (
            <p className="palette-hint">Tapez pour rechercher dans vos projets, étapes, notes, objectifs et idées.</p>
          )}
          {requete.trim() && plat.length === 0 && <p className="palette-hint">Aucun résultat pour « {requete} ».</p>}
          {groupes.map((groupe) => (
            <div className="palette-group" key={groupe.titre}>
              <div className="palette-group__titre">{groupe.titre}</div>
              {groupe.items.map((item) => {
                index += 1;
                const active = index === selection;
                return (
                  <button
                    key={item.id}
                    className={`palette-result${active ? " palette-result--active" : ""}`}
                    onMouseEnter={() => setSelection(index)}
                    onClick={() => valider(item)}
                  >
                    <span className="palette-result__badge">{item.badge}</span>
                    <span className="palette-result__texte">
                      <span className="palette-result__label">{item.label}</span>
                      {item.sublabel && <span className="palette-result__sublabel">{item.sublabel}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
