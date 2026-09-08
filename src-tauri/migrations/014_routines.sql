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

INSERT INTO routines (id, titre, actif, sort_order) VALUES
  ('routine-sport', 'Sport', 1, 1),
  ('routine-lecture', 'Lecture', 1, 2),
  ('routine-meditation', 'Méditation', 1, 3),
  ('routine-code-perso', 'Code perso (hors travail)', 1, 4);

INSERT INTO routine_checks (id, routine_id, date) VALUES
  ('rc-1', 'routine-sport', date('now', '-1 day')),
  ('rc-2', 'routine-sport', date('now', '-2 day')),
  ('rc-3', 'routine-lecture', date('now')),
  ('rc-4', 'routine-lecture', date('now', '-1 day')),
  ('rc-5', 'routine-meditation', date('now')),
  ('rc-6', 'routine-meditation', date('now', '-1 day')),
  ('rc-7', 'routine-meditation', date('now', '-2 day')),
  ('rc-8', 'routine-code-perso', date('now', '-2 day'));
