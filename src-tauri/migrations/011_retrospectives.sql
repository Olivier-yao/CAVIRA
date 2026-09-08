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

INSERT INTO retrospectives (id, projet_id, periode, bien_marche, a_bloque, ajustement, created_at) VALUES
  ('retro-tci-1', 'proj-tourneyci', 'hebdo',
   'La génération d''arbres en simple élimination tourne enfin sans bug sur les effectifs impairs.',
   'Le cas des byes en double élimination a pris plus de temps que prévu à cadrer.',
   'Prototyper les cas limites (byes, forfaits) sur papier avant de coder la logique.',
   datetime('now', '-6 days')),
  ('retro-globale-1', NULL, 'mensuelle',
   'Bonne régularité générale : au moins une action sur un projet presque tous les jours ce mois-ci.',
   'Trop de projets actifs en parallèle, l''attention se disperse sur les semaines chargées.',
   'Me concentrer sur 2-3 projets prioritaires par semaine plutôt que d''avancer un peu partout.',
   datetime('now', '-20 days'));
