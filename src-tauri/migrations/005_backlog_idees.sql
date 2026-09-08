ALTER TABLE idees ADD COLUMN effort_estime TEXT;
ALTER TABLE idees ADD COLUMN objectif_id TEXT REFERENCES objectifs(id);
