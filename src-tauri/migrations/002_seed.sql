-- Uniquement les catégories par défaut : nécessaires pour que le
-- formulaire de création de projet ait des options dès le premier
-- lancement. Aucune autre donnée de démonstration n'est semée — une
-- installation neuve doit démarrer totalement vide (voir l'écran
-- "Premier lancement").
INSERT INTO categories (id, label, color, sort_order) VALUES
  ('cat-dev', 'Dev app', '#8B7BF7', 1),
  ('cat-jeu', 'Jeu', '#F45B8D', 2),
  ('cat-reel', 'Réel', '#4FD1E8', 3),
  ('cat-autre', 'Autre', '#B4E066', 4);
