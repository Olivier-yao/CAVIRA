ALTER TABLE projets ADD COLUMN seuil_depenses REAL;
ALTER TABLE journal_entries ADD COLUMN duree_minutes INTEGER;
ALTER TABLE notes ADD COLUMN etape_id TEXT REFERENCES plan_etapes(id);
