import { useMemo, useState } from "react";
import "./Projets.css";
import type { AppData } from "../types";
import { CategorieBadge, StatutProjetBadge } from "../components/Badges";
import { buildProjetCards, type ProjetCard } from "../lib/projets";

interface ProjetsProps {
  data: AppData;
  onOpenProjet: (projetId: string) => void;
}

type Vue = "grille" | "liste";
type Onglet = "actifs" | "archives";
type FiltreStatutActif = "en_cours" | "pause" | "bloque";
type FiltreStatutArchive = "termine" | "abandonne";

const EST_ARCHIVE = (statut: string) => statut === "termine" || statut === "abandonne";

export function Projets({ data, onOpenProjet }: ProjetsProps) {
  const [recherche, setRecherche] = useState("");
  const [categorieId, setCategorieId] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("actifs");
  const [statutsActifs, setStatutsActifs] = useState<Set<FiltreStatutActif>>(new Set());
  const [statutsArchive, setStatutsArchive] = useState<Set<FiltreStatutArchive>>(new Set());
  const [vue, setVue] = useState<Vue>("grille");

  const cards = useMemo(() => buildProjetCards(data), [data]);

  const actifs = data.projets.filter((p) => p.statut === "en_cours").length;
  const pause = data.projets.filter((p) => p.statut === "pause").length;
  const archivesCount = data.projets.filter((p) => EST_ARCHIVE(p.statut)).length;

  const cardsDeLOnglet = cards.filter((c) => (onglet === "archives" ? EST_ARCHIVE(c.projet.statut) : !EST_ARCHIVE(c.projet.statut)));

  const parCategorie = (catId: string | null) =>
    catId === null ? cardsDeLOnglet.length : cardsDeLOnglet.filter((c) => c.projet.categorie_id === catId).length;

  function toggleStatutActif(s: FiltreStatutActif) {
    setStatutsActifs((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function toggleStatutArchive(s: FiltreStatutArchive) {
    setStatutsArchive((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  const filtered = cardsDeLOnglet.filter((c) => {
    if (recherche.trim() && !c.projet.titre.toLowerCase().includes(recherche.trim().toLowerCase())) return false;
    if (categorieId && c.projet.categorie_id !== categorieId) return false;
    if (onglet === "actifs" && statutsActifs.size > 0) {
      const matchStatut =
        (statutsActifs.has("en_cours") && c.projet.statut === "en_cours") ||
        (statutsActifs.has("pause") && c.projet.statut === "pause") ||
        (statutsActifs.has("bloque") && c.aBlocage);
      if (!matchStatut) return false;
    }
    if (onglet === "archives" && statutsArchive.size > 0) {
      const matchStatut =
        (statutsArchive.has("termine") && c.projet.statut === "termine") ||
        (statutsArchive.has("abandonne") && c.projet.statut === "abandonne");
      if (!matchStatut) return false;
    }
    return true;
  });

  return (
    <div className="projets-screen">
      <header className="projets-screen__header">
        <h1>Projets</h1>
        <p className="projets-screen__subtitle">
          {actifs} actif{actifs > 1 ? "s" : ""} · {pause} en pause · {archivesCount} archivé
          {archivesCount > 1 ? "s" : ""}
        </p>
      </header>

      <div className="projets-toolbar">
        <div className="projets-toolbar__onglets">
          <button className={onglet === "actifs" ? "active" : ""} onClick={() => setOnglet("actifs")}>
            Actifs
          </button>
          <button className={onglet === "archives" ? "active" : ""} onClick={() => setOnglet("archives")}>
            Archives {archivesCount > 0 && <span>{archivesCount}</span>}
          </button>
        </div>
        <input
          className="projets-toolbar__search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Filtrer par titre…"
        />
        <div className="projets-toolbar__vue">
          <button className={vue === "grille" ? "active" : ""} onClick={() => setVue("grille")}>
            Grille
          </button>
          <button className={vue === "liste" ? "active" : ""} onClick={() => setVue("liste")}>
            Liste
          </button>
        </div>
      </div>

      <div className="projets-filtres">
        <button className={`filtre-chip${categorieId === null ? " filtre-chip--active" : ""}`} onClick={() => setCategorieId(null)}>
          Toutes <span>{parCategorie(null)}</span>
        </button>
        {data.categories.map((cat) => (
          <button
            key={cat.id}
            className={`filtre-chip${categorieId === cat.id ? " filtre-chip--active" : ""}`}
            style={categorieId === cat.id ? { borderColor: cat.color, color: cat.color } : undefined}
            onClick={() => setCategorieId(cat.id)}
          >
            {cat.label} <span>{parCategorie(cat.id)}</span>
          </button>
        ))}
      </div>

      <div className="projets-filtres projets-filtres--statut">
        {onglet === "actifs"
          ? ([
              { id: "en_cours", label: "En cours" },
              { id: "pause", label: "Pause" },
              { id: "bloque", label: "Bloqué" },
            ] as { id: FiltreStatutActif; label: string }[]).map((s) => (
              <button
                key={s.id}
                className={`filtre-chip${statutsActifs.has(s.id) ? " filtre-chip--active" : ""}`}
                onClick={() => toggleStatutActif(s.id)}
              >
                {s.label}
              </button>
            ))
          : ([
              { id: "termine", label: "Terminé" },
              { id: "abandonne", label: "Abandonné" },
            ] as { id: FiltreStatutArchive; label: string }[]).map((s) => (
              <button
                key={s.id}
                className={`filtre-chip${statutsArchive.has(s.id) ? " filtre-chip--active" : ""}`}
                onClick={() => toggleStatutArchive(s.id)}
              >
                {s.label}
              </button>
            ))}
      </div>

      {filtered.length === 0 ? (
        <p className="projets-screen__vide">
          {onglet === "archives" ? "Aucun projet archivé pour l'instant." : "Aucun projet ne correspond à ces filtres."}
        </p>
      ) : vue === "grille" ? (
        <div className="projets-grille">
          {filtered.map((c) => (
            <ProjetCardGrille key={c.projet.id} card={c} data={data} onClick={() => onOpenProjet(c.projet.id)} />
          ))}
        </div>
      ) : (
        <div className="projets-liste">
          {filtered.map((c) => (
            <ProjetLigne key={c.projet.id} card={c} data={data} onClick={() => onOpenProjet(c.projet.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EcheanceTag({ jours }: { jours: number | null }) {
  if (jours === null) return <span className="projet-echeance projet-echeance--vide">—</span>;
  return (
    <span className={`projet-echeance${jours < 0 ? " projet-echeance--retard" : ""}`}>
      {jours >= 0 ? `J-${jours}` : `J+${-jours}`}
    </span>
  );
}

function ProjetCardGrille({ card, data, onClick }: { card: ProjetCard; data: AppData; onClick: () => void }) {
  const categorie = data.categories.find((c) => c.id === card.projet.categorie_id);
  return (
    <button className="card projet-card" onClick={onClick}>
      <div className="projet-card__badges">
        <CategorieBadge categorie={categorie} />
        <StatutProjetBadge statut={card.projet.statut} />
        {card.aBlocage && <span className="projet-card__blocage" title="Une étape est bloquée" />}
      </div>
      <div className="projet-card__titre">{card.projet.titre}</div>
      <p className="projet-card__description">{card.projet.description}</p>
      <div className="projet-card__progression">
        <div className="projet-card__progression-top">
          <span>Progression</span>
          <span>{card.progression}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${card.progression}%`, background: "var(--accent)" }} />
        </div>
      </div>
      <div className="projet-card__footer">
        <span className="projet-card__activite">
          {card.derniereActiviteTexte} · {card.derniereActiviteRelatif}
        </span>
        <EcheanceTag jours={card.echeanceJours} />
      </div>
    </button>
  );
}

function ProjetLigne({ card, data, onClick }: { card: ProjetCard; data: AppData; onClick: () => void }) {
  const categorie = data.categories.find((c) => c.id === card.projet.categorie_id);
  return (
    <button className="card projet-ligne" onClick={onClick}>
      <span className="projet-ligne__titre">{card.projet.titre}</span>
      <CategorieBadge categorie={categorie} />
      <StatutProjetBadge statut={card.projet.statut} />
      <div className="projet-ligne__progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${card.progression}%`, background: "var(--accent)" }} />
        </div>
        <span>{card.progression}%</span>
      </div>
      <span className="projet-ligne__activite">{card.derniereActiviteRelatif}</span>
      <EcheanceTag jours={card.echeanceJours} />
    </button>
  );
}
