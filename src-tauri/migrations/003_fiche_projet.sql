ALTER TABLE projets ADD COLUMN seuil_depenses REAL;
ALTER TABLE journal_entries ADD COLUMN duree_minutes INTEGER;
ALTER TABLE notes ADD COLUMN etape_id TEXT REFERENCES plan_etapes(id);

UPDATE journal_entries SET duree_minutes = 130 WHERE id = 'j-01';
UPDATE journal_entries SET duree_minutes = 100 WHERE id = 'j-06';

UPDATE notes SET etape_id = 'et-2-2' WHERE id = 'note-tci-1';

UPDATE projets SET seuil_depenses = 250 WHERE id = 'proj-tourneyci';
UPDATE projets SET seuil_depenses = 400 WHERE id = 'proj-boite';

INSERT INTO calendrier_entries (id, projet_id, titre, date, type) VALUES
  ('cal-tci-1', 'proj-tourneyci', 'Session dev — round robin', datetime('now', '+1 days'), 'session'),
  ('cal-tci-2', 'proj-tourneyci', 'Session dev — interface admin', datetime('now', '+9 days'), 'session'),
  ('cal-lc-1', 'proj-lacata', 'Playtest à 10 joueurs', datetime('now', '+12 days'), 'session'),
  ('cal-bo-1', 'proj-boite', 'RDV banque', datetime('now', '+8 days'), 'session');

INSERT INTO notes (id, projet_id, contenu, tags, created_at) VALUES
  ('note-tci-2', 'proj-tourneyci',
   'Format d''export retenu pour les résultats : CSV pour les orgas techniques, image récap pour le partage TikTok/Discord.',
   'export,decision', datetime('now', '-6 days')),
  ('note-tci-3', 'proj-tourneyci',
   'Idée à creuser : offre marque blanche pour un organisateur qui veut son propre nom de domaine.',
   'idee,business', datetime('now', '-9 days')),
  ('note-lc-1', 'proj-lacata',
   'Le minuteur à 45s casse le rythme en fin de manche. Tester 30s pour la dernière manche seulement.',
   'playtest,equilibrage', datetime('now', '-2 days'));
