ALTER TABLE idees ADD COLUMN effort_estime TEXT;
ALTER TABLE idees ADD COLUMN objectif_id TEXT REFERENCES objectifs(id);

INSERT INTO idees (id, titre, description, categorie_id, interet, effort_estime, objectif_id, created_at) VALUES
  ('idee-1', 'Mode spectateur pour TourneyCI',
   'Page publique en lecture seule d''un bracket en cours, partageable par lien. Pourrait servir d''entrée gratuite vers l''offre payante organisateur.',
   'cat-dev', 4, '2 semaines', 'obj-boite', datetime('now', '-10 days')),
  ('idee-2', 'Version mobile de La Cata',
   'Un téléphone par joueur, l''écran principal reste le prompteur.',
   'cat-jeu', 4, '1 mois', 'obj-vivre', datetime('now', '-16 days')),
  ('idee-3', 'Formation « premier projet »',
   'Vendre un parcours court basé sur l''App de progression.',
   'cat-reel', 3, '3 semaines', 'obj-independant', datetime('now', '-23 days')),
  ('idee-4', 'Générateur de miniatures TikTok',
   'Petit outil interne pour standardiser les vignettes.',
   'cat-dev', 3, '1 semaine', 'obj-tiktok', datetime('now', '-27 days')),
  ('idee-5', 'Jeu de cartes physique',
   'Décliner La Cata en boîte imprimée, print-on-demand.',
   'cat-jeu', 2, '2 mois', 'obj-vivre', datetime('now', '-34 days')),
  ('idee-6', 'Coworking mensuel local',
   'Réunir des indépendants du coin une fois par mois.',
   'cat-reel', 2, 'Continu', NULL, datetime('now', '-40 days')),
  ('idee-7', 'Newsletter de suivi',
   'Résumé mensuel de mes projets, généré depuis le journal.',
   'cat-autre', 1, '1 semaine', 'obj-vivre', datetime('now', '-51 days'));
