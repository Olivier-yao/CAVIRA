-- Matrice de priorisation urgent/important (cahier des charges §4).
-- L'urgence se calcule automatiquement (échéance proche, étape bloquée) ;
-- l'importance reste un jugement du créateur du projet, donc un champ
-- qu'il fixe lui-même, sur le même principe que la priorité des étapes.

ALTER TABLE projets ADD COLUMN importance TEXT NOT NULL DEFAULT 'moyenne';

UPDATE projets SET importance = 'haute' WHERE id IN ('proj-tourneyci', 'proj-boite', 'proj-routine');
UPDATE projets SET importance = 'basse' WHERE id IN ('proj-vertax', 'proj-vitrine', 'proj-discord');
