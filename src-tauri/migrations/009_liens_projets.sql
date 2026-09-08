-- Liens entre projets (cahier des charges §4) : pouvoir indiquer qu'un
-- projet en alimente un autre (ex : l'app de progression alimente le
-- contenu de la chaîne TikTok), pour visualiser les synergies.

CREATE TABLE projet_liens (
  projet_id TEXT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  alimente_id TEXT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (projet_id, alimente_id),
  CHECK (projet_id != alimente_id)
);

INSERT INTO projet_liens (projet_id, alimente_id) VALUES
  ('proj-progression', 'proj-tiktok');
