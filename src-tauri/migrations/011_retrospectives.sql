-- Rétrospectives périodiques (cahier des charges §4) : un mini bilan
-- guidé, par projet ou global (projet_id NULL), à une échelle plus large
-- que l'action ponctuelle du journal de suivi.

CREATE TABLE retrospectives (
  id TEXT PRIMARY KEY,
  projet_id TEXT REFERENCES projets(id) ON DELETE CASCADE,
  periode TEXT NOT NULL,
  bien_marche TEXT NOT NULL,
  a_bloque TEXT NOT NULL,
  ajustement TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
