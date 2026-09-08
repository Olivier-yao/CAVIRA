import { v4 as uuidLib } from "uuid";
import type {
  AppData,
  CalendrierEntry,
  Categorie,
  Idee,
  JournalEntry,
  Note,
  Objectif,
  PlanEtape,
  Projet,
  ProjetObjectif,
  StatutEtape,
} from "../types";
import type { NewIdeeInput, NewJournalEntryInput, NewProjetInput } from "./db";

function removeWhere<T>(arr: T[], pred: (item: T) => boolean): void {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (pred(arr[i])) arr.splice(i, 1);
  }
}

// Miroir des migrations src-tauri/migrations/*.sql, utilisé uniquement quand
// l'app tourne hors runtime Tauri (aperçu navigateur pendant le développement).
// En build réel, loadAppData() lit toujours SQLite — voir data/db.ts.

function iso(daysAgo: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const categories: Categorie[] = [
  { id: "cat-dev", label: "Dev app", color: "#4FD1E8", sort_order: 1 },
  { id: "cat-jeu", label: "Jeu", color: "#F472A8", sort_order: 2 },
  { id: "cat-reel", label: "Réel", color: "#B6E24A", sort_order: 3 },
  { id: "cat-autre", label: "Autre", color: "#8A90A6", sort_order: 4 },
];

const objectifs: Objectif[] = [
  { id: "obj-vivre", titre: "Vivre de mes projets", description: "", created_at: iso(60) },
  { id: "obj-boite", titre: "Développer ma propre boîte", description: "", created_at: iso(60) },
  { id: "obj-independant", titre: "Être indépendant grâce à mes activités", description: "", created_at: iso(60) },
  { id: "obj-tiktok", titre: "Être connu sur TikTok", description: "", created_at: iso(60) },
  {
    id: "obj-routine",
    titre: "Avoir une routine bien tracée",
    description: "Tenir un rythme quotidien stable et mesurable.",
    created_at: iso(60),
  },
];

const projetObjectifs: ProjetObjectif[] = [
  { projet_id: "proj-lacata", objectif_id: "obj-vivre" },
  { projet_id: "proj-vertax", objectif_id: "obj-vivre" },
  { projet_id: "proj-discord", objectif_id: "obj-vivre" },
  { projet_id: "proj-tourneyci", objectif_id: "obj-vivre" },
  { projet_id: "proj-tourneyci", objectif_id: "obj-boite" },
  { projet_id: "proj-tourneyci", objectif_id: "obj-independant" },
  { projet_id: "proj-boite", objectif_id: "obj-boite" },
  { projet_id: "proj-subvention", objectif_id: "obj-boite" },
  { projet_id: "proj-progression", objectif_id: "obj-independant" },
  { projet_id: "proj-tiktok", objectif_id: "obj-tiktok" },
  { projet_id: "proj-vitrine", objectif_id: "obj-tiktok" },
  { projet_id: "proj-routine", objectif_id: "obj-routine" },
  { projet_id: "proj-vieux-site", objectif_id: "obj-boite" },
];

function mkProjet(
  id: string,
  titre: string,
  categorie_id: string,
  statut: Projet["statut"],
  description: string,
  objectif_final: string,
  echeance_date: string | null,
  seuil_depenses: number | null = null,
): Projet {
  return {
    id,
    titre,
    categorie_id,
    statut,
    description,
    objectif_final,
    echeance_date,
    seuil_depenses,
    created_at: iso(30),
    updated_at: iso(1),
  };
}

const projets: Projet[] = [
  mkProjet(
    "proj-tourneyci",
    "TourneyCI",
    "cat-dev",
    "en_cours",
    "Plateforme de gestion de tournois gaming : brackets automatiques, saisie des scores, export des résultats pour les organisateurs.",
    "Sortir une v1 utilisable en tournoi réel.",
    isoInDays(6),
    250,
  ),
  mkProjet(
    "proj-lacata",
    "La Cata",
    "cat-jeu",
    "en_cours",
    "Jeu de soirée façon télé-prompteur, une manette pour tout le salon.",
    "Faire tester le prototype à 20 groupes différents.",
    null,
  ),
  mkProjet(
    "proj-progression",
    "App de progression",
    "cat-dev",
    "en_cours",
    "Suivi d'apprentissage de la programmation, par compétence et par preuve.",
    "Couvrir tous les domaines du programme perso.",
    null,
  ),
  mkProjet(
    "proj-boite",
    "Ouvrir ma boîte",
    "cat-reel",
    "en_cours",
    "Statut, comptabilité, démarches de création d'entreprise.",
    "Avoir une structure juridique active.",
    null,
    400,
  ),
  mkProjet(
    "proj-vertax",
    "VertaX",
    "cat-jeu",
    "pause",
    "Prototype de jeu vertical, moteur en cours de test.",
    "Valider si le concept mérite d'être poussé.",
    null,
  ),
  mkProjet(
    "proj-tiktok",
    "Chaîne TikTok",
    "cat-reel",
    "en_cours",
    "Format court sur mes projets en cours, plusieurs publications par semaine.",
    "Construire une audience régulière.",
    null,
  ),
  mkProjet(
    "proj-routine",
    "Routine quotidienne",
    "cat-reel",
    "en_cours",
    "Blocs de travail fixes, sport, sommeil, revue du jour.",
    "Tenir un rythme stable sur la durée.",
    null,
  ),
  mkProjet(
    "proj-vitrine",
    "Site vitrine",
    "cat-dev",
    "en_cours",
    "Portfolio de mes projets et prestations.",
    "Avoir une vitrine présentable à partager.",
    null,
  ),
  mkProjet(
    "proj-discord",
    "Serveur communautaire",
    "cat-autre",
    "en_cours",
    "Discord des testeurs de mes projets, modération et annonces.",
    "Avoir un noyau actif de retours réguliers.",
    null,
  ),
  mkProjet(
    "proj-subvention",
    "Dossier subvention",
    "cat-reel",
    "en_cours",
    "Aide à la création d'entreprise : pièces à rassembler, dépôt avant fin octobre.",
    "Déposer un dossier complet dans les temps.",
    isoInDays(45),
  ),
  mkProjet(
    "proj-vieux-site",
    "Ancien site vitrine v1",
    "cat-dev",
    "termine",
    "Première version du portfolio, remplacée par la refonte actuelle.",
    "Avoir une vitrine en ligne rapidement.",
    null,
  ),
  mkProjet(
    "proj-appli-meteo",
    "Appli météo locale",
    "cat-dev",
    "abandonne",
    "Idée testée puis abandonnée faute de valeur ajoutée claire face aux apps existantes.",
    "Voir si une version simplifiée trouvait son public.",
    null,
  ),
];

function mkEtape(
  id: string,
  projet_id: string,
  titre: string,
  statut: PlanEtape["statut"],
  priorite: PlanEtape["priorite"],
  dateCibleDaysFromNow: number | null,
  sort_order: number,
  parent_id: string | null = null,
  note: string | null = null,
): PlanEtape {
  return {
    id,
    projet_id,
    parent_id,
    titre,
    statut,
    priorite,
    date_cible: dateCibleDaysFromNow === null ? null : isoInDays(dateCibleDaysFromNow).slice(0, 10),
    note,
    sort_order,
    created_at: iso(20),
  };
}

const etapes: PlanEtape[] = [
  mkEtape("et-1", "proj-tourneyci", "Cadrage produit", "fait", "moyenne", -18, 1),
  mkEtape("et-1-1", "proj-tourneyci", "Définir les formats de tournoi supportés", "fait", "haute", -20, 1, "et-1"),
  mkEtape("et-1-2", "proj-tourneyci", "Benchmark des outils existants", "fait", "basse", -18, 2, "et-1"),
  mkEtape("et-2", "proj-tourneyci", "Backend brackets", "en_cours", "haute", 6, 2),
  mkEtape("et-2-1", "proj-tourneyci", "Génération d'arbres simple élimination", "fait", "haute", -5, 1, "et-2"),
  mkEtape("et-2-2", "proj-tourneyci", "Double élimination — cas des byes", "en_cours", "haute", 6, 2, "et-2"),
  mkEtape("et-2-3", "proj-tourneyci", "Round robin et poules", "a_faire", "moyenne", 13, 3, "et-2"),
  mkEtape("et-3", "proj-tourneyci", "Interface admin de tournoi", "a_faire", "haute", 24, 3),
  mkEtape("et-3-1", "proj-tourneyci", "Écran de saisie des scores", "a_faire", "moyenne", 20, 1, "et-3"),
  mkEtape("et-3-2", "proj-tourneyci", "Export des résultats (CSV, image)", "a_faire", "basse", 24, 2, "et-3"),
  mkEtape("et-4", "proj-tourneyci", "Intégration Discord", "bloque", "moyenne", null, 4, null, "En attente de validation de l'API bot."),
  mkEtape("et-5", "proj-tourneyci", "Bêta fermée — 20 organisateurs", "a_faire", "haute", 70, 5),

  mkEtape("et-lc-1", "proj-lacata", "Écrire 50 questions de test", "fait", "haute", -10, 1),
  mkEtape("et-lc-2", "proj-lacata", "Playtest à 6 joueurs", "fait", "haute", -1, 2),
  mkEtape("et-lc-3", "proj-lacata", "Équilibrer le minuteur", "en_cours", "moyenne", 4, 3),
  mkEtape("et-lc-4", "proj-lacata", "Playtest à 10 joueurs", "a_faire", "moyenne", 12, 4),

  mkEtape("et-pr-1", "proj-progression", "Domaine réseau : 5 exercices", "fait", "moyenne", -6, 1),
  mkEtape("et-pr-2", "proj-progression", "Compétence « async » validée", "fait", "haute", -2, 2),
  mkEtape("et-pr-3", "proj-progression", "Domaine bases de données", "en_cours", "moyenne", 10, 3),
  mkEtape("et-pr-4", "proj-progression", "Domaine sécurité", "a_faire", "basse", null, 4),

  mkEtape("et-bo-1", "proj-boite", "Choisir la structure juridique", "fait", "haute", -4, 1),
  mkEtape("et-bo-2", "proj-boite", "Ouvrir un compte pro", "a_faire", "haute", 9, 2),
  mkEtape("et-bo-3", "proj-boite", "Déposer les statuts", "a_faire", "moyenne", 16, 3),

  mkEtape("et-vx-1", "proj-vertax", "Prototype de contrôles", "fait", "moyenne", -25, 1),
  mkEtape("et-vx-2", "proj-vertax", "Test du concept en interne", "bloque", "basse", null, 2),

  mkEtape("et-tt-1", "proj-tiktok", "Publication #14", "fait", "moyenne", -1, 1),
  mkEtape("et-tt-2", "proj-tiktok", "Tourner 3 formats cette semaine", "en_cours", "haute", 3, 2),
  mkEtape("et-tt-3", "proj-tiktok", "Analyser les stats du mois", "a_faire", "basse", 20, 3),

  mkEtape("et-ro-1", "proj-routine", "Fixer les blocs de la semaine", "fait", "moyenne", -7, 1),
  mkEtape("et-ro-2", "proj-routine", "Tenir 14 jours sans écart", "en_cours", "haute", 2, 2),

  mkEtape("et-sv-1", "proj-vitrine", "Maquette des sections", "fait", "moyenne", -15, 1),
  mkEtape("et-sv-2", "proj-vitrine", "Intégration responsive", "en_cours", "moyenne", 8, 2),
  mkEtape("et-sv-3", "proj-vitrine", "Textes définitifs", "a_faire", "basse", null, 3),

  mkEtape("et-dc-1", "proj-discord", "Structurer les salons", "fait", "basse", -30, 1),
  mkEtape("et-dc-2", "proj-discord", "Annonce hebdo automatisée", "a_faire", "basse", null, 2),

  mkEtape("et-sub-1", "proj-subvention", "Rassembler les pièces", "en_cours", "haute", 5, 1),
  mkEtape("et-sub-2", "proj-subvention", "Rédiger le dossier", "a_faire", "haute", 30, 2),
  mkEtape("et-sub-3", "proj-subvention", "Déposer avant fin octobre", "a_faire", "haute", 45, 3),

  mkEtape("et-vs-1", "proj-vieux-site", "Maquette et intégration", "fait", "moyenne", null, 1),
  mkEtape("et-vs-2", "proj-vieux-site", "Mise en ligne", "fait", "moyenne", null, 2),
  mkEtape("et-am-1", "proj-appli-meteo", "Prototype avec une API météo", "fait", "basse", null, 1),
  mkEtape("et-am-2", "proj-appli-meteo", "Étude de la concurrence", "fait", "basse", null, 2),
];

function mkJournal(
  id: string,
  projet_id: string,
  type: JournalEntry["type"],
  titre: string,
  montant: number | null,
  daysAgo: number,
  hoursAgo = 0,
  dureeMinutes: number | null = null,
): JournalEntry {
  return {
    id,
    projet_id,
    type,
    titre,
    montant,
    duree_minutes: dureeMinutes,
    description: "",
    created_at: iso(daysAgo, hoursAgo),
  };
}

const journal: JournalEntry[] = [
  mkJournal("j-01", "proj-tourneyci", "action", "Double élimination — cas des byes", null, 0, 3, 130),
  mkJournal("j-02", "proj-lacata", "action", "Playtest à 6 joueurs, 3 bugs relevés", null, 1),
  mkJournal("j-03", "proj-tiktok", "action", "Publication #14 en ligne", null, 1),
  mkJournal("j-04", "proj-boite", "action", "Note : structure juridique retenue", null, 3),
  mkJournal("j-05", "proj-progression", "action", "Compétence « async » validée", null, 2),
  mkJournal("j-06", "proj-tourneyci", "action", "Génération d'arbres simple élimination", null, 4, 0, 100),
  mkJournal("j-07", "proj-routine", "action", "Check-in du matin", null, 5),
  mkJournal("j-08", "proj-vitrine", "action", "Intégration responsive", null, 6),
  mkJournal("j-09", "proj-discord", "action", "Modération + annonce hebdo", null, 7),
  mkJournal("j-10", "proj-subvention", "action", "Récupéré 2 pièces manquantes", null, 8),
  mkJournal("j-11", "proj-progression", "action", "Domaine réseau — exercice 5/5", null, 9),
  mkJournal("j-12", "proj-tiktok", "action", "Tournage de 2 formats", null, 10),
  mkJournal("j-13", "proj-tourneyci", "action", "Cadrage produit finalisé", null, 11),
  mkJournal("j-14", "proj-lacata", "action", "Écriture des questions (lot 2)", null, 16),
  mkJournal("j-15", "proj-boite", "action", "RDV expert-comptable", null, 19),
  mkJournal("j-16", "proj-vertax", "action", "Test du prototype de contrôles", null, 22),
  mkJournal("j-17", "proj-tiktok", "action", "Publication #10 en ligne", null, 24),
  mkJournal("j-18", "proj-routine", "action", "Revue de semaine", null, 26),

  mkJournal("j-d1", "proj-tourneyci", "depense", "Nom de domaine + hébergement", -68, 9),
  mkJournal("j-d2", "proj-boite", "depense", "Frais de dépôt de statuts", -230, 4),
  mkJournal("j-d3", "proj-vitrine", "depense", "Licence photos", -45, 7),
  mkJournal("j-d4", "proj-lacata", "depense", "Impression des prototypes", -37, 16),
  mkJournal("j-d5", "proj-tiktok", "depense", "Micro-cravate", -1800, 24),
  mkJournal("j-d6", "proj-tourneyci", "depense", "Nom de domaine tourneyci.gg (2 ans)", -24, 2),
  mkJournal("j-d7", "proj-tourneyci", "depense", "Licence outil de tests de charge", -49, 11),

  mkJournal("j-e1", "proj-progression", "economie", "Cours en ligne évité", 90, 10),
  mkJournal("j-e2", "proj-tourneyci", "economie", "Hébergement fait maison", 150, 15),
  mkJournal("j-e3", "proj-discord", "economie", "Bot modération auto-hébergé", 60, 8),

  mkJournal("j-b1", "proj-tiktok", "benefice_estime", "Partenariat en discussion", 800, 11),
  mkJournal("j-b2", "proj-boite", "benefice_estime", "Premier client potentiel identifié", 600, 19),
  mkJournal("j-b3", "proj-tourneyci", "benefice_estime", "Offre marque blanche", 500, 24),
  mkJournal("j-b4", "proj-tourneyci", "benefice_estime", "Premier organisateur intéressé — pré-vente estimée", 150, 6),
];

journal.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

function mkNote(
  id: string,
  projet_id: string,
  titre: string,
  contenu: string,
  tags: string,
  daysAgo: number,
  etape_id: string | null = null,
): Note {
  return { id, projet_id, etape_id, titre, contenu, tags, created_at: iso(daysAgo) };
}

const notes: Note[] = [
  mkNote(
    "note-tci-1",
    "proj-tourneyci",
    "Cas des byes",
    "Le cas des byes casse l'arbre quand le nombre d'inscrits n'est pas une puissance de deux. Solution retenue : matchs fantômes résolus automatiquement au premier tour.",
    "algo,brackets",
    2,
    "et-2-2",
  ),
  mkNote(
    "note-tci-2",
    "proj-tourneyci",
    "Format d'export",
    "Format d'export retenu pour les résultats : CSV pour les orgas techniques, image récap pour le partage TikTok/Discord.",
    "export,decision",
    6,
  ),
  mkNote(
    "note-tci-3",
    "proj-tourneyci",
    "Idée marque blanche",
    "Idée à creuser : offre marque blanche pour un organisateur qui veut son propre nom de domaine.",
    "idee,business",
    9,
  ),
  mkNote(
    "note-tci-4",
    "proj-tourneyci",
    "Pricing organisateur",
    "Gratuit jusqu'à 16 joueurs, 9 €/tournoi au-delà. À tester auprès de 5 organisateurs avant la bêta.",
    "pricing",
    5,
  ),
  mkNote(
    "note-tci-5",
    "proj-tourneyci",
    "Concurrence",
    "Les outils existants imposent un compte et un abonnement mensuel ; mon pricing à l'usage est plus lisible.",
    "marché",
    24,
  ),
  mkNote(
    "note-lc-1",
    "proj-lacata",
    "Minuteur en fin de manche",
    "Le minuteur à 45s casse le rythme en fin de manche. Tester 30s pour la dernière manche seulement.",
    "playtest,equilibrage",
    2,
  ),
  mkNote(
    "note-lc-2",
    "proj-lacata",
    "Modèle économique soirée",
    "Prix unique à 7 € plutôt qu'un pricing par pack de questions : moins de friction en soirée.",
    "pricing",
    13,
  ),
  mkNote(
    "note-lc-3",
    "proj-lacata",
    "Packs additionnels",
    "Un pack thématique payant tous les deux mois, si la base gratuite retient assez de groupes.",
    "pricing",
    19,
  ),
  mkNote(
    "note-bo-1",
    "proj-boite",
    "Grille tarifaire prestations",
    "Journée à 450 €, forfait audit à 900 €. Aligner le pricing produit sur ces repères de temps.",
    "pricing",
    8,
  ),
];
notes.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

const calendrier: CalendrierEntry[] = [
  { id: "cal-tci-1", projet_id: "proj-tourneyci", titre: "Session dev — round robin", date: isoInDays(1), type: "session", created_at: iso(0) },
  { id: "cal-tci-2", projet_id: "proj-tourneyci", titre: "Session dev — interface admin", date: isoInDays(9), type: "session", created_at: iso(0) },
  { id: "cal-lc-1", projet_id: "proj-lacata", titre: "Playtest à 10 joueurs", date: isoInDays(12), type: "session", created_at: iso(0) },
  { id: "cal-bo-1", projet_id: "proj-boite", titre: "RDV banque", date: isoInDays(8), type: "session", created_at: iso(0) },
];

function mkIdee(
  id: string,
  titre: string,
  description: string,
  categorie_id: string,
  interet: number,
  effort_estime: string,
  objectif_id: string | null,
  daysAgo: number,
): Idee {
  return { id, titre, description, categorie_id, interet, effort_estime, objectif_id, created_at: iso(daysAgo) };
}

const idees: Idee[] = [
  mkIdee(
    "idee-1",
    "Mode spectateur pour TourneyCI",
    "Page publique en lecture seule d'un bracket en cours, partageable par lien. Pourrait servir d'entrée gratuite vers l'offre payante organisateur.",
    "cat-dev",
    4,
    "2 semaines",
    "obj-boite",
    10,
  ),
  mkIdee(
    "idee-2",
    "Version mobile de La Cata",
    "Un téléphone par joueur, l'écran principal reste le prompteur.",
    "cat-jeu",
    4,
    "1 mois",
    "obj-vivre",
    16,
  ),
  mkIdee(
    "idee-3",
    "Formation « premier projet »",
    "Vendre un parcours court basé sur l'App de progression.",
    "cat-reel",
    3,
    "3 semaines",
    "obj-independant",
    23,
  ),
  mkIdee(
    "idee-4",
    "Générateur de miniatures TikTok",
    "Petit outil interne pour standardiser les vignettes.",
    "cat-dev",
    3,
    "1 semaine",
    "obj-tiktok",
    27,
  ),
  mkIdee(
    "idee-5",
    "Jeu de cartes physique",
    "Décliner La Cata en boîte imprimée, print-on-demand.",
    "cat-jeu",
    2,
    "2 mois",
    "obj-vivre",
    34,
  ),
  mkIdee(
    "idee-6",
    "Coworking mensuel local",
    "Réunir des indépendants du coin une fois par mois.",
    "cat-reel",
    2,
    "Continu",
    null,
    40,
  ),
  mkIdee(
    "idee-7",
    "Newsletter de suivi",
    "Résumé mensuel de mes projets, généré depuis le journal.",
    "cat-autre",
    1,
    "1 semaine",
    "obj-vivre",
    51,
  ),
];

export const mockData: AppData = {
  categories,
  objectifs,
  projets,
  etapes,
  journal,
  notes,
  calendrier,
  projetObjectifs,
  idees,
};

export function mockCreerProjet(id: string, input: NewProjetInput): void {
  const now = new Date().toISOString();
  projets.push({
    id,
    titre: input.titre,
    categorie_id: input.categorieId,
    statut: input.statut,
    description: input.description,
    objectif_final: input.objectifFinal,
    echeance_date: null,
    seuil_depenses: input.seuilDepenses,
    created_at: now,
    updated_at: now,
  });
  for (const objectifId of input.objectifIds) {
    projetObjectifs.push({ projet_id: id, objectif_id: objectifId });
  }
}

export function mockModifierProjet(id: string, input: NewProjetInput): void {
  const p = projets.find((x) => x.id === id);
  if (p) {
    p.titre = input.titre;
    p.categorie_id = input.categorieId;
    p.statut = input.statut;
    p.description = input.description;
    p.objectif_final = input.objectifFinal;
    p.seuil_depenses = input.seuilDepenses;
    p.updated_at = new Date().toISOString();
  }
  removeWhere(projetObjectifs, (po) => po.projet_id === id);
  for (const objectifId of input.objectifIds) {
    projetObjectifs.push({ projet_id: id, objectif_id: objectifId });
  }
}

export function mockSupprimerProjet(id: string): void {
  removeWhere(etapes, (e) => e.projet_id === id);
  removeWhere(journal, (j) => j.projet_id === id);
  removeWhere(notes, (n) => n.projet_id === id);
  removeWhere(calendrier, (c) => c.projet_id === id);
  removeWhere(projetObjectifs, (po) => po.projet_id === id);
  removeWhere(projets, (p) => p.id === id);
}

export function mockModifierEtape(
  etapeId: string,
  input: { titre: string; statut: StatutEtape; priorite: PlanEtape["priorite"]; dateCible: string | null; note: string | null },
): void {
  const e = etapes.find((x) => x.id === etapeId);
  if (e) {
    e.titre = input.titre;
    e.statut = input.statut;
    e.priorite = input.priorite;
    e.date_cible = input.dateCible;
    e.note = input.note;
  }
}

export function mockSupprimerEtape(etapeId: string): void {
  removeWhere(etapes, (e) => e.id === etapeId || e.parent_id === etapeId);
}

export function mockAddObjectif(titre: string, description: string): void {
  objectifs.push({ id: uuidLib(), titre, description, created_at: new Date().toISOString() });
}

export function mockModifierObjectif(id: string, titre: string, description: string): void {
  const o = objectifs.find((x) => x.id === id);
  if (o) {
    o.titre = titre;
    o.description = description;
  }
}

export function mockSupprimerObjectif(id: string): void {
  removeWhere(projetObjectifs, (po) => po.objectif_id === id);
  removeWhere(objectifs, (o) => o.id === id);
}

export function mockModifierCategorie(id: string, label: string, color: string): void {
  const c = categories.find((x) => x.id === id);
  if (c) {
    c.label = label;
    c.color = color;
  }
}

export function mockSupprimerCategorie(id: string): void {
  removeWhere(categories, (c) => c.id === id);
}

function remplacerContenu<T>(arr: T[], nouveauContenu: T[]): void {
  arr.length = 0;
  arr.push(...nouveauContenu);
}

export function mockRestaurerDonnees(data: AppData): void {
  remplacerContenu(categories, data.categories);
  remplacerContenu(objectifs, data.objectifs);
  remplacerContenu(projets, data.projets);
  remplacerContenu(etapes, data.etapes);
  remplacerContenu(journal, data.journal);
  remplacerContenu(notes, data.notes);
  remplacerContenu(calendrier, data.calendrier);
  remplacerContenu(projetObjectifs, data.projetObjectifs);
  remplacerContenu(idees, data.idees);
}

export function mockAddCategorie(label: string, color: string): void {
  categories.push({ id: uuidLib(), label, color, sort_order: categories.length + 1 });
}

export function mockToggleEtape(etapeId: string, statut: StatutEtape): void {
  const e = etapes.find((x) => x.id === etapeId);
  if (e) e.statut = statut;
}

export function mockAddEtape(projetId: string, titre: string, sortOrder: number): void {
  etapes.push({
    id: uuidLib(),
    projet_id: projetId,
    parent_id: null,
    titre,
    statut: "a_faire",
    priorite: "moyenne",
    date_cible: null,
    note: null,
    sort_order: sortOrder,
    created_at: new Date().toISOString(),
  });
}

export function mockAddJournalEntry(input: NewJournalEntryInput): void {
  journal.unshift({
    id: uuidLib(),
    projet_id: input.projetId,
    type: input.type,
    titre: input.titre,
    montant: input.montant,
    duree_minutes: null,
    description: "",
    created_at: new Date().toISOString(),
  });
}

export function mockAddNote(projetId: string, titre: string, contenu: string, tags: string): void {
  notes.unshift({
    id: uuidLib(),
    projet_id: projetId,
    etape_id: null,
    titre,
    contenu,
    tags,
    created_at: new Date().toISOString(),
  });
}

export function mockAddIdee(input: NewIdeeInput): void {
  idees.unshift({
    id: uuidLib(),
    titre: input.titre,
    description: input.description,
    categorie_id: input.categorieId,
    interet: input.interet,
    effort_estime: null,
    objectif_id: null,
    created_at: new Date().toISOString(),
  });
}

export function mockPromouvoirIdee(idee: Idee, nouveauProjetId: string): void {
  projets.push({
    id: nouveauProjetId,
    titre: idee.titre,
    categorie_id: idee.categorie_id ?? "cat-autre",
    statut: "preparation",
    description: idee.description,
    objectif_final: "",
    echeance_date: null,
    seuil_depenses: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (idee.objectif_id) {
    projetObjectifs.push({ projet_id: nouveauProjetId, objectif_id: idee.objectif_id });
  }
  const idx = idees.findIndex((i) => i.id === idee.id);
  if (idx !== -1) idees.splice(idx, 1);
}
