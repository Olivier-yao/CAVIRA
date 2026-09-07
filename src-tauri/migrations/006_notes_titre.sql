ALTER TABLE notes ADD COLUMN titre TEXT NOT NULL DEFAULT '';

UPDATE notes SET titre = 'Cas des byes' WHERE id = 'note-tci-1';
UPDATE notes SET titre = 'Format d''export' WHERE id = 'note-tci-2';
UPDATE notes SET titre = 'Idée marque blanche' WHERE id = 'note-tci-3';
UPDATE notes SET titre = 'Minuteur en fin de manche' WHERE id = 'note-lc-1';

INSERT INTO notes (id, projet_id, etape_id, titre, contenu, tags, created_at) VALUES
  ('note-tci-4', 'proj-tourneyci', NULL, 'Pricing organisateur',
   'Gratuit jusqu''à 16 joueurs, 9 €/tournoi au-delà. À tester auprès de 5 organisateurs avant la bêta.',
   'pricing', datetime('now', '-5 days')),
  ('note-tci-5', 'proj-tourneyci', NULL, 'Concurrence',
   'Les outils existants imposent un compte et un abonnement mensuel ; mon pricing à l''usage est plus lisible.',
   'marché', datetime('now', '-24 days')),
  ('note-lc-2', 'proj-lacata', NULL, 'Modèle économique soirée',
   'Prix unique à 7 € plutôt qu''un pricing par pack de questions : moins de friction en soirée.',
   'pricing', datetime('now', '-13 days')),
  ('note-lc-3', 'proj-lacata', NULL, 'Packs additionnels',
   'Un pack thématique payant tous les deux mois, si la base gratuite retient assez de groupes.',
   'pricing', datetime('now', '-19 days')),
  ('note-bo-1', 'proj-boite', NULL, 'Grille tarifaire prestations',
   'Journée à 450 €, forfait audit à 900 €. Aligner le pricing produit sur ces repères de temps.',
   'pricing', datetime('now', '-8 days'));
