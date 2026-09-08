-- Finances personnelles : suivi de l'argent de la vie courante, distinct
-- du journal financier par projet (journal_entries). Chaque mouvement
-- porte une note obligatoire précisant la source (où/comment l'argent a
-- été obtenu ou dépensé) — c'est la donnée centrale de cet écran.

CREATE TABLE finances_perso (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('entree', 'depense', 'economie')),
  montant REAL NOT NULL,
  note TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
