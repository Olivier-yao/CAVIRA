import { useMemo, useState } from "react";
import "./RechercheNotes.css";
import type { AppData } from "../types";
import { formatDateShort } from "../lib/format";
import { rechercherNotes, tousLesTags } from "../lib/rechercheNotes";

interface RechercheNotesProps {
  data: AppData;
  onOpenProjet: (projetId: string) => void;
}

export function RechercheNotes({ data, onOpenProjet }: RechercheNotesProps) {
  const [requete, setRequete] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => tousLesTags(data.notes), [data.notes]);
  const groupes = useMemo(() => rechercherNotes(data, requete, tag), [data, requete, tag]);
  const nbResultats = groupes.reduce((s, g) => s + g.resultats.length, 0);

  return (
    <div className="recherche-notes-screen">
      <header className="recherche-notes-screen__header">
        <h1>Recherche dans les notes</h1>
        <p className="recherche-notes-screen__subtitle">
          Tous projets ·{" "}
          {requete.trim() || tag ? `${nbResultats} résultat${nbResultats > 1 ? "s" : ""}` : `${data.notes.length} notes`}
          {requete.trim() && ` pour « ${requete.trim()} »`}
        </p>
      </header>

      <div className="recherche-notes-toolbar">
        <input
          className="recherche-notes-toolbar__search"
          value={requete}
          onChange={(e) => setRequete(e.target.value)}
          placeholder="Rechercher dans le titre, le contenu, les tags…"
          autoFocus
        />
        <select value={tag ?? ""} onChange={(e) => setTag(e.target.value || null)}>
          <option value="">Tous les tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>
      </div>

      {groupes.length === 0 ? (
        <p className="recherche-notes-screen__vide">Aucune note ne correspond.</p>
      ) : (
        <div className="recherche-notes-groupes">
          {groupes.map((groupe) => {
            const categorie = data.categories.find((c) => c.id === groupe.projet.categorie_id);
            return (
              <div key={groupe.projet.id} className="recherche-notes-groupe">
                <div className="recherche-notes-groupe__entete">
                  <span className="recherche-notes-groupe__dot" style={{ background: categorie?.color }} />
                  <button className="recherche-notes-groupe__titre" onClick={() => onOpenProjet(groupe.projet.id)}>
                    {groupe.projet.titre}
                  </button>
                  <span className="recherche-notes-groupe__count">
                    {groupe.totalNotes} note{groupe.totalNotes > 1 ? "s" : ""}
                  </span>
                </div>
                {groupe.resultats.map((note) => (
                  <button key={note.id} className="card note-resultat" onClick={() => onOpenProjet(groupe.projet.id)}>
                    <div className="note-resultat__top">
                      <span className="note-resultat__titre">{note.titre || "(sans titre)"}</span>
                      <span className="note-resultat__date">{formatDateShort(note.created_at)}</span>
                      {note.tags && <span className="badge note-resultat__tag">#{note.tags.split(",")[0].trim()}</span>}
                    </div>
                    <p className="note-resultat__extrait">{note.contenu}</p>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
