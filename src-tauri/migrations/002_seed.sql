INSERT INTO categories (id, label, color, sort_order) VALUES
  ('cat-dev', 'Dev app', '#8B7BF7', 1),
  ('cat-jeu', 'Jeu', '#F45B8D', 2),
  ('cat-reel', 'Réel', '#4FD1E8', 3),
  ('cat-autre', 'Autre', '#B4E066', 4);

INSERT INTO objectifs (id, titre, description) VALUES
  ('obj-vivre', 'Vivre de mes projets', 'Atteindre un revenu stable généré uniquement par mes projets personnels.'),
  ('obj-boite', 'Développer ma propre boîte', 'Structurer et lancer mon activité en entreprise.'),
  ('obj-independant', 'Être indépendant grâce à mes activités', 'Ne plus dépendre d''un revenu externe.'),
  ('obj-tiktok', 'Être connu sur TikTok', 'Construire une audience régulière autour de mes projets.');

INSERT INTO projets (id, titre, categorie_id, statut, description, objectif_final, objectif_id, echeance_date) VALUES
  ('proj-tourneyci', 'TourneyCI', 'cat-dev', 'en_cours',
   'Plateforme de gestion de tournois gaming : brackets automatiques, saisie des scores, export des résultats pour les organisateurs.',
   'Sortir une v1 utilisable en tournoi réel.', 'obj-boite', datetime('now', '+6 days')),
  ('proj-lacata', 'La Cata', 'cat-jeu', 'en_cours',
   'Jeu de soirée façon télé-prompteur, une manette pour tout le salon.',
   'Faire tester le prototype à 20 groupes différents.', 'obj-vivre', NULL),
  ('proj-progression', 'App de progression', 'cat-dev', 'en_cours',
   'Suivi d''apprentissage de la programmation, par compétence et par preuve.',
   'Couvrir tous les domaines du programme perso.', 'obj-vivre', NULL),
  ('proj-boite', 'Ouvrir ma boîte', 'cat-reel', 'en_cours',
   'Statut, comptabilité, démarches de création d''entreprise.',
   'Avoir une structure juridique active.', 'obj-boite', NULL),
  ('proj-vertax', 'VertaX', 'cat-jeu', 'pause',
   'Prototype de jeu vertical, moteur en cours de test.',
   'Valider si le concept mérite d''être poussé.', 'obj-vivre', NULL),
  ('proj-tiktok', 'Chaîne TikTok', 'cat-reel', 'en_cours',
   'Format court sur mes projets en cours, plusieurs publications par semaine.',
   'Construire une audience régulière.', 'obj-tiktok', NULL),
  ('proj-routine', 'Routine quotidienne', 'cat-reel', 'en_cours',
   'Blocs de travail fixes, sport, sommeil, revue du jour.',
   'Tenir un rythme stable sur la durée.', 'obj-independant', NULL),
  ('proj-vitrine', 'Site vitrine', 'cat-dev', 'en_cours',
   'Portfolio de mes projets et prestations.',
   'Avoir une vitrine présentable à partager.', 'obj-boite', NULL),
  ('proj-discord', 'Serveur communautaire', 'cat-autre', 'en_cours',
   'Discord des testeurs de mes projets, modération et annonces.',
   'Avoir un noyau actif de retours réguliers.', 'obj-vivre', NULL),
  ('proj-subvention', 'Dossier subvention', 'cat-reel', 'en_cours',
   'Aide à la création d''entreprise : pièces à rassembler, dépôt avant fin octobre.',
   'Déposer un dossier complet dans les temps.', 'obj-boite', datetime('now', '+45 days'));

-- Plan d'attaque détaillé : TourneyCI
INSERT INTO plan_etapes (id, projet_id, parent_id, titre, statut, priorite, date_cible, note, sort_order) VALUES
  ('et-1', 'proj-tourneyci', NULL, 'Cadrage produit', 'fait', 'moyenne', date('now', '-18 days'), NULL, 1),
  ('et-1-1', 'proj-tourneyci', 'et-1', 'Définir les formats de tournoi supportés', 'fait', 'haute', date('now', '-20 days'), NULL, 1),
  ('et-1-2', 'proj-tourneyci', 'et-1', 'Benchmark des outils existants', 'fait', 'basse', date('now', '-18 days'), NULL, 2),
  ('et-2', 'proj-tourneyci', NULL, 'Backend brackets', 'en_cours', 'haute', date('now', '+6 days'), NULL, 2),
  ('et-2-1', 'proj-tourneyci', 'et-2', 'Génération d''arbres simple élimination', 'fait', 'haute', date('now', '-5 days'), NULL, 1),
  ('et-2-2', 'proj-tourneyci', 'et-2', 'Double élimination — cas des byes', 'en_cours', 'haute', date('now', '+6 days'),
   'Le cas des byes casse l''arbre quand le nombre d''inscrits n''est pas une puissance de deux. Solution retenue : matchs fantômes résolus automatiquement au premier tour.', 2),
  ('et-2-3', 'proj-tourneyci', 'et-2', 'Round robin et poules', 'a_faire', 'moyenne', date('now', '+13 days'), NULL, 3),
  ('et-3', 'proj-tourneyci', NULL, 'Interface admin de tournoi', 'a_faire', 'haute', date('now', '+24 days'), NULL, 3),
  ('et-3-1', 'proj-tourneyci', 'et-3', 'Écran de saisie des scores', 'a_faire', 'moyenne', date('now', '+20 days'), NULL, 1),
  ('et-3-2', 'proj-tourneyci', 'et-3', 'Export des résultats (CSV, image)', 'a_faire', 'basse', date('now', '+24 days'), NULL, 2),
  ('et-4', 'proj-tourneyci', NULL, 'Intégration Discord', 'bloque', 'moyenne', NULL,
   'En attente de validation de l''API bot.', 4),
  ('et-5', 'proj-tourneyci', NULL, 'Bêta fermée — 20 organisateurs', 'a_faire', 'haute', date('now', '+70 days'), NULL, 5);

-- Plans d'attaque légers : autres projets
INSERT INTO plan_etapes (id, projet_id, parent_id, titre, statut, priorite, date_cible, sort_order) VALUES
  ('et-lc-1', 'proj-lacata', NULL, 'Écrire 50 questions de test', 'fait', 'haute', date('now', '-10 days'), 1),
  ('et-lc-2', 'proj-lacata', NULL, 'Playtest à 6 joueurs', 'fait', 'haute', date('now', '-1 days'), 2),
  ('et-lc-3', 'proj-lacata', NULL, 'Équilibrer le minuteur', 'en_cours', 'moyenne', date('now', '+4 days'), 3),
  ('et-lc-4', 'proj-lacata', NULL, 'Playtest à 10 joueurs', 'a_faire', 'moyenne', date('now', '+12 days'), 4),

  ('et-pr-1', 'proj-progression', NULL, 'Domaine réseau : 5 exercices', 'fait', 'moyenne', date('now', '-6 days'), 1),
  ('et-pr-2', 'proj-progression', NULL, 'Compétence « async » validée', 'fait', 'haute', date('now', '-2 days'), 2),
  ('et-pr-3', 'proj-progression', NULL, 'Domaine bases de données', 'en_cours', 'moyenne', date('now', '+10 days'), 3),
  ('et-pr-4', 'proj-progression', NULL, 'Domaine sécurité', 'a_faire', 'basse', NULL, 4),

  ('et-bo-1', 'proj-boite', NULL, 'Choisir la structure juridique', 'fait', 'haute', date('now', '-4 days'), 1),
  ('et-bo-2', 'proj-boite', NULL, 'Ouvrir un compte pro', 'a_faire', 'haute', date('now', '+9 days'), 2),
  ('et-bo-3', 'proj-boite', NULL, 'Déposer les statuts', 'a_faire', 'moyenne', date('now', '+16 days'), 3),

  ('et-vx-1', 'proj-vertax', NULL, 'Prototype de contrôles', 'fait', 'moyenne', date('now', '-25 days'), 1),
  ('et-vx-2', 'proj-vertax', NULL, 'Test du concept en interne', 'bloque', 'basse', NULL, 2),

  ('et-tt-1', 'proj-tiktok', NULL, 'Publication #14', 'fait', 'moyenne', date('now', '-1 days'), 1),
  ('et-tt-2', 'proj-tiktok', NULL, 'Tourner 3 formats cette semaine', 'en_cours', 'haute', date('now', '+3 days'), 2),
  ('et-tt-3', 'proj-tiktok', NULL, 'Analyser les stats du mois', 'a_faire', 'basse', date('now', '+20 days'), 3),

  ('et-ro-1', 'proj-routine', NULL, 'Fixer les blocs de la semaine', 'fait', 'moyenne', date('now', '-7 days'), 1),
  ('et-ro-2', 'proj-routine', NULL, 'Tenir 14 jours sans écart', 'en_cours', 'haute', date('now', '+2 days'), 2),

  ('et-sv-1', 'proj-vitrine', NULL, 'Maquette des sections', 'fait', 'moyenne', date('now', '-15 days'), 1),
  ('et-sv-2', 'proj-vitrine', NULL, 'Intégration responsive', 'en_cours', 'moyenne', date('now', '+8 days'), 2),
  ('et-sv-3', 'proj-vitrine', NULL, 'Textes définitifs', 'a_faire', 'basse', NULL, 3),

  ('et-dc-1', 'proj-discord', NULL, 'Structurer les salons', 'fait', 'basse', date('now', '-30 days'), 1),
  ('et-dc-2', 'proj-discord', NULL, 'Annonce hebdo automatisée', 'a_faire', 'basse', NULL, 2),

  ('et-sub-1', 'proj-subvention', NULL, 'Rassembler les pièces', 'en_cours', 'haute', date('now', '+5 days'), 1),
  ('et-sub-2', 'proj-subvention', NULL, 'Rédiger le dossier', 'a_faire', 'haute', date('now', '+30 days'), 2),
  ('et-sub-3', 'proj-subvention', NULL, 'Déposer avant fin octobre', 'a_faire', 'haute', date('now', '+45 days'), 3);

-- Note attachée à l'étape 2.2
INSERT INTO notes (id, projet_id, contenu, tags, created_at) VALUES
  ('note-tci-1', 'proj-tourneyci',
   'Le cas des byes casse l''arbre quand le nombre d''inscrits n''est pas une puissance de deux. Solution retenue : matchs fantômes résolus automatiquement au premier tour.',
   'algo,brackets', datetime('now', '-2 days'));

-- Journal : au moins une action par jour sur les 12 derniers jours (série en cours),
-- puis des entrées plus espacées jusqu'à 28 jours en arrière pour le graphe de régularité.
INSERT INTO journal_entries (id, projet_id, type, titre, montant, description, created_at) VALUES
  ('j-01', 'proj-tourneyci', 'action', 'Double élimination — cas des byes', NULL, 'Avancé la résolution des matchs fantômes.', datetime('now', '-3 hours')),
  ('j-02', 'proj-lacata', 'action', 'Playtest à 6 joueurs, 3 bugs relevés', NULL, '', datetime('now', '-1 days')),
  ('j-03', 'proj-tiktok', 'action', 'Publication #14 en ligne', NULL, '', datetime('now', '-1 days')),
  ('j-04', 'proj-boite', 'action', 'Note : structure juridique retenue', NULL, '', datetime('now', '-3 days')),
  ('j-05', 'proj-progression', 'action', 'Compétence « async » validée', NULL, '', datetime('now', '-2 days')),
  ('j-06', 'proj-tourneyci', 'action', 'Génération d''arbres simple élimination', NULL, '', datetime('now', '-4 days')),
  ('j-07', 'proj-routine', 'action', 'Check-in du matin', NULL, '', datetime('now', '-5 days')),
  ('j-08', 'proj-vitrine', 'action', 'Intégration responsive — hero + liste projets', NULL, '', datetime('now', '-6 days')),
  ('j-09', 'proj-discord', 'action', 'Modération + annonce hebdo', NULL, '', datetime('now', '-7 days')),
  ('j-10', 'proj-subvention', 'action', 'Récupéré 2 pièces manquantes', NULL, '', datetime('now', '-8 days')),
  ('j-11', 'proj-progression', 'action', 'Domaine réseau — exercice 5/5', NULL, '', datetime('now', '-9 days')),
  ('j-12', 'proj-tiktok', 'action', 'Tournage de 2 formats', NULL, '', datetime('now', '-10 days')),
  ('j-13', 'proj-tourneyci', 'action', 'Cadrage produit finalisé', NULL, '', datetime('now', '-11 days')),
  ('j-14', 'proj-lacata', 'action', 'Écriture des questions (lot 2)', NULL, '', datetime('now', '-16 days')),
  ('j-15', 'proj-boite', 'action', 'RDV expert-comptable', NULL, '', datetime('now', '-19 days')),
  ('j-16', 'proj-vertax', 'action', 'Test du prototype de contrôles', NULL, '', datetime('now', '-22 days')),
  ('j-17', 'proj-tiktok', 'action', 'Publication #10 en ligne', NULL, '', datetime('now', '-24 days')),
  ('j-18', 'proj-routine', 'action', 'Revue de semaine', NULL, '', datetime('now', '-26 days')),

  ('j-d1', 'proj-tourneyci', 'depense', 'Nom de domaine + hébergement', -68, 'Renouvellement annuel.', datetime('now', '-9 days')),
  ('j-d2', 'proj-boite', 'depense', 'Frais de dépôt de statuts', -230, '', datetime('now', '-4 days')),
  ('j-d3', 'proj-vitrine', 'depense', 'Licence photos', -45, '', datetime('now', '-7 days')),
  ('j-d4', 'proj-lacata', 'depense', 'Impression des prototypes', -37, '', datetime('now', '-16 days')),
  ('j-d5', 'proj-tiktok', 'depense', 'Micro-cravate', -1800, 'Achat matériel, amorti sur plusieurs mois.', datetime('now', '-24 days')),

  ('j-e1', 'proj-progression', 'economie', 'Cours en ligne évité (ressources gratuites)', 90, '', datetime('now', '-10 days')),
  ('j-e2', 'proj-tourneyci', 'economie', 'Hébergement fait maison plutôt que SaaS', 150, '', datetime('now', '-15 days')),
  ('j-e3', 'proj-discord', 'economie', 'Bot modération auto-hébergé', 60, '', datetime('now', '-8 days')),

  ('j-b1', 'proj-tiktok', 'benefice_estime', 'Partenariat en discussion', 800, 'Estimation si le partenariat se confirme.', datetime('now', '-11 days')),
  ('j-b2', 'proj-boite', 'benefice_estime', 'Premier client potentiel identifié', 600, '', datetime('now', '-19 days')),
  ('j-b3', 'proj-tourneyci', 'benefice_estime', 'Offre marque blanche à un organisateur', 500, '', datetime('now', '-24 days'));
