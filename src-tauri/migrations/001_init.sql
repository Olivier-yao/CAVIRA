CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE objectifs (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projets (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  categorie_id TEXT NOT NULL REFERENCES categories(id),
  statut TEXT NOT NULL DEFAULT 'idee', -- idee | preparation | en_cours | pause | termine | abandonne
  description TEXT NOT NULL DEFAULT '',
  objectif_final TEXT NOT NULL DEFAULT '',
  objectif_id TEXT REFERENCES objectifs(id),
  echeance_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE plan_etapes (
  id TEXT PRIMARY KEY,
  projet_id TEXT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES plan_etapes(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'a_faire', -- a_faire | en_cours | fait | bloque
  priorite TEXT NOT NULL DEFAULT 'moyenne', -- basse | moyenne | haute
  date_cible TEXT,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE calendrier_entries (
  id TEXT PRIMARY KEY,
  projet_id TEXT REFERENCES projets(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'session', -- session | echeance
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  projet_id TEXT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- action | depense | economie | benefice_estime
  titre TEXT NOT NULL,
  montant REAL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  projet_id TEXT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE idees (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  categorie_id TEXT REFERENCES categories(id),
  interet INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
