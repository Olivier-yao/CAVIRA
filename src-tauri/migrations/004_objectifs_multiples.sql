-- Un projet peut être rattaché à plusieurs objectifs (cahier des charges
-- §3.6). La FK simple projets.objectif_id ne le permettait pas.

CREATE TABLE projet_objectifs (
  projet_id TEXT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  objectif_id TEXT NOT NULL REFERENCES objectifs(id) ON DELETE CASCADE,
  PRIMARY KEY (projet_id, objectif_id)
);

INSERT INTO projet_objectifs (projet_id, objectif_id)
SELECT id, objectif_id FROM projets WHERE objectif_id IS NOT NULL;

ALTER TABLE projets DROP COLUMN objectif_id;

INSERT INTO objectifs (id, titre, description) VALUES
  ('obj-routine', 'Avoir une routine bien tracée', 'Tenir un rythme quotidien stable et mesurable.');

DELETE FROM projet_objectifs;

INSERT INTO projet_objectifs (projet_id, objectif_id) VALUES
  ('proj-lacata', 'obj-vivre'),
  ('proj-vertax', 'obj-vivre'),
  ('proj-discord', 'obj-vivre'),
  ('proj-tourneyci', 'obj-vivre'),
  ('proj-tourneyci', 'obj-boite'),
  ('proj-tourneyci', 'obj-independant'),
  ('proj-boite', 'obj-boite'),
  ('proj-subvention', 'obj-boite'),
  ('proj-progression', 'obj-independant'),
  ('proj-tiktok', 'obj-tiktok'),
  ('proj-vitrine', 'obj-tiktok'),
  ('proj-routine', 'obj-routine');
