-- Onglet Routine : suivi quotidien d'habitudes (sport, lecture, etc.)
-- avec statistiques hebdomadaires. Une "case cochée" est une simple
-- présence (routine_id, date) plutôt qu'un booléen, même principe que
-- le calcul de série (streak) déjà utilisé ailleurs dans l'app.

CREATE TABLE routines (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  actif INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE routine_checks (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(routine_id, date)
);
