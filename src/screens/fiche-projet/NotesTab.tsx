import { useState } from "react";
import type { AppData } from "../../types";
import { notesProjet } from "../../lib/ficheProjet";
import { formatRelativeLong } from "../../lib/format";
import { addNote } from "../../data/db";

interface NotesTabProps {
  data: AppData;
  projetId: string;
  onDataChanged: () => void;
}

export function NotesTab({ data, projetId, onDataChanged }: NotesTabProps) {
  const notes = notesProjet(data.notes, projetId);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [tags, setTags] = useState("");

  async function handleAjouter() {
    const c = contenu.trim();
    if (!c) return;
    await addNote(projetId, titre.trim(), c, tags.trim());
    setTitre("");
    setContenu("");
    setTags("");
    onDataChanged();
  }

  return (
    <div className="notes-tab">
      <div className="notes-tab__add card">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre (optionnel)…" />
        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Nouvelle note…"
          rows={3}
        />
        <div className="notes-tab__add-footer">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags séparés par des virgules"
          />
          <button className="btn btn--accent" onClick={handleAjouter}>
            Ajouter
          </button>
        </div>
      </div>

      <div className="notes-tab__list">
        {notes.length === 0 && <p className="notes-tab__vide">Aucune note pour ce projet.</p>}
        {notes.map((note) => (
          <div key={note.id} className="card note-card">
            <div className="note-card__meta">{formatRelativeLong(note.created_at)}</div>
            {note.titre && <div className="note-card__titre">{note.titre}</div>}
            <p className="note-card__contenu">{note.contenu}</p>
            {note.tags && (
              <div className="note-card__tags">
                {note.tags.split(",").map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
