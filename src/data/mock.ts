import type { Categorie, DashboardData, JournalEntry, Objectif, PlanEtape, Projet } from "../types";

// Miroir de src-tauri/migrations/002_seed.sql, utilisé uniquement quand l'app
// tourne hors runtime Tauri (aperçu navigateur pendant le développement).
// En build réel, loadDashboardData() lit toujours SQLite — voir data/db.ts.

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
  { id: "cat-dev", label: "Dev app", color: "#8B7BF7", sort_order: 1 },
  { id: "cat-jeu", label: "Jeu", color: "#F45B8D", sort_order: 2 },
  { id: "cat-reel", label: "Réel", color: "#4FD1E8", sort_order: 3 },
  { id: "cat-autre", label: "Autre", color: "#B4E066", sort_order: 4 },
];

const objectifs: Objectif[] = [
  { id: "obj-vivre", titre: "Vivre de mes projets", description: "", created_at: iso(60) },
  { id: "obj-boite", titre: "Développer ma propre boîte", description: "", created_at: iso(60) },
  { id: "obj-independant", titre: "Être indépendant grâce à mes activités", description: "", created_at: iso(60) },
  { id: "obj-tiktok", titre: "Être connu sur TikTok", description: "", created_at: iso(60) },
];

const projets: Projet[] = [
  mkProjet("proj-tourneyci", "TourneyCI", "cat-dev", "en_cours", "obj-boite", isoInDays(6)),
  mkProjet("proj-lacata", "La Cata", "cat-jeu", "en_cours", "obj-vivre", null),
  mkProjet("proj-progression", "App de progression", "cat-dev", "en_cours", "obj-vivre", null),
  mkProjet("proj-boite", "Ouvrir ma boîte", "cat-reel", "en_cours", "obj-boite", null),
  mkProjet("proj-vertax", "VertaX", "cat-jeu", "pause", "obj-vivre", null),
  mkProjet("proj-tiktok", "Chaîne TikTok", "cat-reel", "en_cours", "obj-tiktok", null),
  mkProjet("proj-routine", "Routine quotidienne", "cat-reel", "en_cours", "obj-independant", null),
  mkProjet("proj-vitrine", "Site vitrine", "cat-dev", "en_cours", "obj-boite", null),
  mkProjet("proj-discord", "Serveur communautaire", "cat-autre", "en_cours", "obj-vivre", null),
  mkProjet("proj-subvention", "Dossier subvention", "cat-reel", "en_cours", "obj-boite", isoInDays(45)),
];

function mkProjet(
  id: string,
  titre: string,
  categorie_id: string,
  statut: Projet["statut"],
  objectif_id: string,
  echeance_date: string | null,
): Projet {
  return {
    id,
    titre,
    categorie_id,
    statut,
    description: "",
    objectif_final: "",
    objectif_id,
    echeance_date,
    created_at: iso(30),
    updated_at: iso(1),
  };
}

function mkEtape(
  id: string,
  projet_id: string,
  titre: string,
  statut: PlanEtape["statut"],
  priorite: PlanEtape["priorite"],
  dateCibleDaysFromNow: number | null,
  sort_order: number,
  parent_id: string | null = null,
): PlanEtape {
  return {
    id,
    projet_id,
    parent_id,
    titre,
    statut,
    priorite,
    date_cible: dateCibleDaysFromNow === null ? null : isoInDays(dateCibleDaysFromNow).slice(0, 10),
    note: null,
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
  mkEtape("et-4", "proj-tourneyci", "Intégration Discord", "bloque", "moyenne", null, 4),
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
];

function mkJournal(
  id: string,
  projet_id: string,
  type: JournalEntry["type"],
  titre: string,
  montant: number | null,
  daysAgo: number,
  hoursAgo = 0,
): JournalEntry {
  return { id, projet_id, type, titre, montant, description: "", created_at: iso(daysAgo, hoursAgo) };
}

const journal: JournalEntry[] = [
  mkJournal("j-01", "proj-tourneyci", "action", "Double élimination — cas des byes", null, 0, 3),
  mkJournal("j-02", "proj-lacata", "action", "Playtest à 6 joueurs, 3 bugs relevés", null, 1),
  mkJournal("j-03", "proj-tiktok", "action", "Publication #14 en ligne", null, 1),
  mkJournal("j-04", "proj-boite", "action", "Note : structure juridique retenue", null, 3),
  mkJournal("j-05", "proj-progression", "action", "Compétence « async » validée", null, 2),
  mkJournal("j-06", "proj-tourneyci", "action", "Génération d'arbres simple élimination", null, 4),
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

  mkJournal("j-e1", "proj-progression", "economie", "Cours en ligne évité", 90, 10),
  mkJournal("j-e2", "proj-tourneyci", "economie", "Hébergement fait maison", 150, 15),
  mkJournal("j-e3", "proj-discord", "economie", "Bot modération auto-hébergé", 60, 8),

  mkJournal("j-b1", "proj-tiktok", "benefice_estime", "Partenariat en discussion", 800, 11),
  mkJournal("j-b2", "proj-boite", "benefice_estime", "Premier client potentiel identifié", 600, 19),
  mkJournal("j-b3", "proj-tourneyci", "benefice_estime", "Offre marque blanche", 500, 24),
];

journal.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

export const mockDashboardData: DashboardData = { categories, objectifs, projets, etapes, journal };
