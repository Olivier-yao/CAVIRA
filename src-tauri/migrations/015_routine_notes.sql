-- Fiche routine : journal libre pour noter ce qui a été fait à chaque
-- session d'une routine (ex: "30 min de course, 20 pompes" pour Sport),
-- distinct de la simple case cochée routine_checks.

CREATE TABLE routine_notes (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
