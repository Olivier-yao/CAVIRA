-- Deux projets de test pour la vue Archives (terminé / abandonné) : le
-- seed initial n'en avait aucun, ce qui rendait la fonctionnalité
-- invisible.

INSERT INTO projets (id, titre, categorie_id, statut, description, objectif_final, created_at, updated_at) VALUES
  ('proj-vieux-site', 'Ancien site vitrine v1', 'cat-dev', 'termine',
   'Première version du portfolio, remplacée par la refonte actuelle.',
   'Avoir une vitrine en ligne rapidement.', datetime('now', '-200 days'), datetime('now', '-40 days')),
  ('proj-appli-meteo', 'Appli météo locale', 'cat-dev', 'abandonne',
   'Idée testée puis abandonnée faute de valeur ajoutée claire face aux apps existantes.',
   'Voir si une version simplifiée trouvait son public.', datetime('now', '-120 days'), datetime('now', '-90 days'));

INSERT INTO plan_etapes (id, projet_id, titre, statut, priorite, sort_order) VALUES
  ('et-vs-1', 'proj-vieux-site', 'Maquette et intégration', 'fait', 'moyenne', 1),
  ('et-vs-2', 'proj-vieux-site', 'Mise en ligne', 'fait', 'moyenne', 2),
  ('et-am-1', 'proj-appli-meteo', 'Prototype avec une API météo', 'fait', 'basse', 1),
  ('et-am-2', 'proj-appli-meteo', 'Étude de la concurrence', 'fait', 'basse', 2);

INSERT INTO projet_objectifs (projet_id, objectif_id) VALUES
  ('proj-vieux-site', 'obj-boite');
