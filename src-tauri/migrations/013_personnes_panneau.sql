-- Collaborateurs d'un projet : préciser si un projet se fait seul ou à
-- plusieurs, avec possibilité d'ajouter/retirer des personnes. Le statut
-- "solo" se déduit automatiquement d'une liste vide, pas besoin d'un
-- champ séparé.

CREATE TABLE projet_personnes (
  id TEXT PRIMARY KEY,
  projet_id TEXT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
