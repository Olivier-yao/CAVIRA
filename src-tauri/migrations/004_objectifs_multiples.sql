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
