-- Fiche routine : journal libre pour noter ce qui a été fait à chaque
-- session d'une routine (ex: "30 min de course, 20 pompes" pour Sport),
-- distinct de la simple case cochée routine_checks.

CREATE TABLE routine_notes (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO routine_notes (id, routine_id, contenu, created_at) VALUES
  ('rn-1', 'routine-sport', '5 km de course à pied, 20 min. Rythme correct.', datetime('now', '-1 day')),
  ('rn-2', 'routine-lecture', 'Chapitre 4 de "Deep Work" — 25 pages.', datetime('now')),
  ('rn-3', 'routine-meditation', '10 minutes de respiration guidée avant de dormir.', datetime('now', '-1 day'));
