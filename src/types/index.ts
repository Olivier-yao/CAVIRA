export type StatutProjet = "idee" | "preparation" | "en_cours" | "pause" | "termine" | "abandonne";
export type StatutEtape = "a_faire" | "en_cours" | "fait" | "bloque";
export type PrioriteEtape = "basse" | "moyenne" | "haute";
export type ImportanceProjet = "basse" | "moyenne" | "haute";
export type PeriodeRetro = "hebdo" | "mensuelle";
export type TypeJournal = "action" | "depense" | "economie" | "benefice_estime";
export type TypeCalendrier = "session" | "echeance";

export interface Categorie {
  id: string;
  label: string;
  color: string;
  sort_order: number;
}

export interface Objectif {
  id: string;
  titre: string;
  description: string;
  created_at: string;
}

export interface Projet {
  id: string;
  titre: string;
  categorie_id: string;
  statut: StatutProjet;
  description: string;
  objectif_final: string;
  echeance_date: string | null;
  seuil_depenses: number | null;
  importance: ImportanceProjet;
  masque: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanEtape {
  id: string;
  projet_id: string;
  parent_id: string | null;
  titre: string;
  statut: StatutEtape;
  priorite: PrioriteEtape;
  date_cible: string | null;
  note: string | null;
  sort_order: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  projet_id: string;
  type: TypeJournal;
  titre: string;
  montant: number | null;
  duree_minutes: number | null;
  description: string;
  created_at: string;
}

export interface Note {
  id: string;
  projet_id: string;
  etape_id: string | null;
  titre: string;
  contenu: string;
  tags: string;
  created_at: string;
}

export interface Idee {
  id: string;
  titre: string;
  description: string;
  categorie_id: string | null;
  interet: number;
  effort_estime: string | null;
  objectif_id: string | null;
  created_at: string;
}

export interface ProjetObjectif {
  projet_id: string;
  objectif_id: string;
}

export interface ProjetLien {
  projet_id: string;
  alimente_id: string;
  created_at: string;
}

export interface ProjetPersonne {
  id: string;
  projet_id: string;
  nom: string;
  created_at: string;
}

export interface Retrospective {
  id: string;
  projet_id: string | null;
  periode: PeriodeRetro;
  bien_marche: string;
  a_bloque: string;
  ajustement: string;
  created_at: string;
}

export interface CalendrierEntry {
  id: string;
  projet_id: string | null;
  titre: string;
  date: string;
  type: TypeCalendrier;
  created_at: string;
}

export interface Routine {
  id: string;
  titre: string;
  actif: boolean;
  sort_order: number;
  created_at: string;
}

export interface RoutineCheck {
  id: string;
  routine_id: string;
  date: string;
  created_at: string;
}

export interface RoutineNote {
  id: string;
  routine_id: string;
  contenu: string;
  created_at: string;
}

export type TypeFinancePerso = "entree" | "depense" | "economie";

export interface FinancePerso {
  id: string;
  type: TypeFinancePerso;
  montant: number;
  note: string;
  date: string;
  created_at: string;
}

export interface AppData {
  categories: Categorie[];
  objectifs: Objectif[];
  projets: Projet[];
  etapes: PlanEtape[];
  journal: JournalEntry[];
  notes: Note[];
  calendrier: CalendrierEntry[];
  projetObjectifs: ProjetObjectif[];
  projetLiens: ProjetLien[];
  retrospectives: Retrospective[];
  projetPersonnes: ProjetPersonne[];
  idees: Idee[];
  routines: Routine[];
  routineChecks: RoutineCheck[];
  routineNotes: RoutineNote[];
  financesPerso: FinancePerso[];
}
