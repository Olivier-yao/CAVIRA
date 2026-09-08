-- Masquage d'un projet (menu ··· de la fiche projet) : le sortir des
-- vues actives sans changer son statut réel, distinct d'un archivage
-- (terminé/abandonné) qui est un vrai changement d'état.

ALTER TABLE projets ADD COLUMN masque INTEGER NOT NULL DEFAULT 0;
