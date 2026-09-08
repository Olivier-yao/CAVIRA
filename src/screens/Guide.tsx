import type { ReactNode } from "react";
import "./Guide.css";
import {
  IconBacklog,
  IconCalendrier,
  IconGuide,
  IconObjectifs,
  IconParametres,
  IconProjets,
  IconRecherche,
  IconRoadmap,
  IconRoutine,
  IconVueGlobale,
} from "../components/icons";

interface FlowNode {
  label: string;
  icon?: ReactNode;
}

function Chip({ node, variant }: { node: FlowNode; variant?: "root" }) {
  return (
    <div className={`flow-chip${variant === "root" ? " flow-chip--root" : ""}`}>
      {node.icon && <span className="flow-chip__icon">{node.icon}</span>}
      <span>{node.label}</span>
    </div>
  );
}

function FlowRow({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="flow-row">
      {nodes.map((n, i) => (
        <div className="flow-row__item" key={i}>
          <Chip node={n} />
          {i < nodes.length - 1 && <span className="flow-row__arrow">→</span>}
        </div>
      ))}
    </div>
  );
}

function FlowBranch({ root, leaves }: { root: FlowNode; leaves: FlowNode[] }) {
  return (
    <div className="flow-branch">
      <Chip node={root} variant="root" />
      <div className="flow-branch__leaves">
        {leaves.map((l, i) => (
          <div className="flow-branch__leaf" key={i}>
            <Chip node={l} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="guide-bloc">
      <h3>{titre}</h3>
      {children}
    </div>
  );
}

function Rubrique({
  id,
  titre,
  icon,
  resume,
  diagram,
  children,
}: {
  id: string;
  titre: string;
  icon: ReactNode;
  resume: string;
  diagram?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="card guide-rubrique">
      <div className="guide-rubrique__header">
        <span className="guide-rubrique__icon">{icon}</span>
        <div>
          <h2>{titre}</h2>
          <p className="guide-rubrique__resume">{resume}</p>
        </div>
      </div>
      {diagram && <div className="guide-rubrique__diagram">{diagram}</div>}
      {children}
    </section>
  );
}

const SOMMAIRE: { id: string; label: string; icon: ReactNode }[] = [
  { id: "vue-ensemble", label: "Vue d'ensemble", icon: <IconGuide /> },
  { id: "vue-globale", label: "Vue globale", icon: <IconVueGlobale /> },
  { id: "projets", label: "Projets", icon: <IconProjets /> },
  { id: "fiche-projet", label: "Fiche projet", icon: <IconProjets /> },
  { id: "calendrier", label: "Calendrier", icon: <IconCalendrier /> },
  { id: "roadmap", label: "Roadmap", icon: <IconRoadmap /> },
  { id: "routine", label: "Routine", icon: <IconRoutine /> },
  { id: "objectifs", label: "Objectifs", icon: <IconObjectifs /> },
  { id: "backlog", label: "Backlog d'idées", icon: <IconBacklog /> },
  { id: "recherche", label: "Recherche & ⌘K", icon: <IconRecherche /> },
  { id: "panneau", label: "Panneau de rappels", icon: <IconGuide /> },
  { id: "parametres", label: "Paramètres", icon: <IconParametres /> },
];

export function Guide() {
  function allerA(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="guide-screen">
      <header className="guide-screen__header">
        <h1>Guide de l'application</h1>
        <p className="guide-screen__subtitle">
          À quoi sert chaque écran, comment il fonctionne, comment il se connecte aux autres, et ce qui reste entre
          tes mains.
        </p>
      </header>

      <div className="guide-screen__body">
        <nav className="guide-sommaire">
          {SOMMAIRE.map((s) => (
            <button key={s.id} className="guide-sommaire__item" onClick={() => allerA(s.id)}>
              <span className="guide-sommaire__icon">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="guide-contenu">
          <section id="vue-ensemble" className="card guide-rubrique">
            <div className="guide-rubrique__header">
              <span className="guide-rubrique__icon">
                <IconGuide />
              </span>
              <div>
                <h2>Vue d'ensemble</h2>
                <p className="guide-rubrique__resume">
                  Comment une idée devient un projet, comment un projet nourrit les autres écrans, et ce qui tourne
                  indépendamment.
                </p>
              </div>
            </div>

            <div className="guide-rubrique__diagram guide-rubrique__diagram--stack">
              <FlowRow nodes={[{ label: "Idée (Backlog)", icon: <IconBacklog /> }, { label: "Projet", icon: <IconProjets /> }]} />
              <FlowBranch
                root={{ label: "Fiche projet", icon: <IconProjets /> }}
                leaves={[
                  { label: "Plan d'attaque" },
                  { label: "Journal de suivi" },
                  { label: "Notes" },
                  { label: "Calendrier du projet" },
                  { label: "Rétrospectives" },
                ]}
              />
              <FlowRow
                nodes={[
                  { label: "Projets + Routine" },
                  { label: "Vue globale", icon: <IconVueGlobale /> },
                ]}
              />
              <FlowRow nodes={[{ label: "Projets" }, { label: "Roadmap", icon: <IconRoadmap /> }]} />
            </div>

            <Bloc titre="Fonctionnement">
              <ul>
                <li>
                  Une idée notée dans le <strong>Backlog</strong> peut être « promue » en projet réel d'un clic —
                  elle garde son titre, sa description, sa catégorie et son objectif rattaché, et disparaît du
                  backlog.
                </li>
                <li>
                  Chaque projet a une fiche à 5 onglets (Plan d'attaque, Calendrier, Journal de suivi, Notes,
                  Rétros), plus ses collaborateurs et ses liens vers d'autres projets.
                </li>
                <li>
                  Le <strong>Journal de suivi</strong> (actions, dépenses, économies, bénéfices estimés) est la
                  seule source de données financières et d'activité de toute l'app — Vue globale, Roadmap et
                  Cycles la lisent, aucun ne recalcule rien séparément.
                </li>
                <li>
                  La <strong>Routine</strong> (habitudes quotidiennes) alimente la régularité affichée dans la
                  sidebar, indépendamment des actions de projet.
                </li>
                <li>
                  Les <strong>Objectifs</strong> de vie sont rattachés aux projets (plusieurs projets peuvent
                  nourrir un même objectif) et leur progression apparaît sur la Roadmap.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>
                Rien ne se calcule sans que tu aies toi-même noté une action, une dépense ou coché une routine —
                l'app reflète ce que tu saisis, elle ne devine jamais une progression ou un montant.
              </p>
            </Bloc>
          </section>

          <Rubrique
            id="vue-globale"
            titre="Vue globale"
            icon={<IconVueGlobale />}
            resume="Le tableau de bord : un instantané de l'activité récente sur tous les projets à la fois."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>
                  4 cartes chiffrées (projets actifs, actions, bilan net, échéances proches), recalculées selon la
                  période choisie — Ce mois-ci / 30 jours / Trimestre.
                </li>
                <li>
                  Le graphique « Régularité d'action » montre les jours où au moins une action a été notée, avec la
                  série en cours ; survoler une barre affiche le détail exact de ce jour.
                </li>
                <li>
                  « Bilan financier global » est un graphique fixe sur 6 mois — volontairement indépendant des
                  pastilles de période, pour garder une vue longue durée toujours visible.
                </li>
                <li>
                  Si les <strong>Cycles</strong> sont activés (Paramètres), une section « Cycle actuel » apparaît
                  en haut avec ses propres compteurs, remis à zéro périodiquement, plus l'historique des cycles
                  précédents.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <ul>
                <li>Chaque chiffre vient du Journal de suivi de tous les projets actifs.</li>
                <li>« Prochaine échéance » et « Dernière activité » ouvrent directement le projet concerné.</li>
              </ul>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>
                Écran de lecture seule — la seule action possible ici est de changer la période affichée. Le reste
                se règle dans Paramètres (activer les cycles, leur intervalle).
              </p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="projets"
            titre="Projets"
            icon={<IconProjets />}
            resume="La liste de tous les projets, avec trois façons de les regarder et trois filtres."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>3 vues : Grille (cartes), Liste (tableau compact), Matrice (importance × urgence).</li>
                <li>
                  3 onglets : Actifs, Archives (terminés/abandonnés), Masqués (retirés temporairement de la vue
                  sans être archivés).
                </li>
                <li>
                  L'<strong>urgence</strong> est calculée automatiquement (échéance ≤ 7 jours ou étape bloquée) ;
                  l'<strong>importance</strong> est un champ que tu choisis toi-même à la création du projet.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <ul>
                <li>Clic sur une carte ou une ligne → ouvre la Fiche projet.</li>
                <li>Les catégories et leurs couleurs viennent de Paramètres.</li>
              </ul>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Créer, modifier, masquer ou archiver un projet est toujours une action manuelle.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="fiche-projet"
            titre="Fiche projet"
            icon={<IconProjets />}
            resume="Le détail complet d'un projet — tout ce que tu notes dessus vit ici."
            diagram={
              <FlowBranch
                root={{ label: "Un projet" }}
                leaves={[
                  { label: "Plan d'attaque — étapes" },
                  { label: "Journal de suivi — actions & finances" },
                  { label: "Notes" },
                  { label: "Calendrier — sessions" },
                  { label: "Rétros" },
                ]}
              />
            }
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>
                  <strong>Plan d'attaque</strong> : étapes hiérarchiques (sous-étapes), statut, priorité, échéance —
                  glisser une étape sur le Calendrier change sa date cible.
                </li>
                <li>
                  <strong>Journal de suivi</strong> : 4 types d'entrées — action, dépense, économie, bénéfice
                  estimé. C'est la seule saisie financière de toute l'app.
                </li>
                <li>
                  <strong>Notes</strong> : texte libre avec tags, éventuellement rattachées à une étape précise.
                </li>
                <li>
                  <strong>Calendrier</strong> et <strong>Rétros</strong> (bilan périodique guidé : bien marché / a
                  bloqué / ajustement) propres au projet.
                </li>
                <li>
                  Au-dessus des onglets : <strong>Collaborateurs</strong> (noms libres, solo par défaut) et{" "}
                  <strong>Liens</strong> (« alimente » / « alimenté par » un autre projet).
                </li>
                <li>
                  Le menu « ··· » : dupliquer, marquer terminé/abandonné, exporter en texte, masquer, supprimer.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <ul>
                <li>Chaque étape et action alimente la Vue globale, la Roadmap et le Panneau de rappels.</li>
                <li>Les chips de liens naviguent directement d'une fiche projet à l'autre.</li>
              </ul>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>
                Tout est saisi à la main — la progression affichée (%) est le seul calcul automatique, dérivé des
                étapes cochées « fait ».
              </p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="calendrier"
            titre="Calendrier"
            icon={<IconCalendrier />}
            resume="Vue semaine/mois de toutes les échéances et sessions, tous projets confondus."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>
                  Chaque étape avec une échéance et chaque entrée de calendrier de projet apparaissent sur leur
                  jour.
                </li>
                <li>
                  Les étapes se replanifient en les faisant glisser vers un autre jour. Les sessions/échéances de
                  projet restent pour l'instant en lecture seule ici.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>Clic sur un événement → ouvre la fiche projet correspondante, à la bonne étape.</p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Déplacer une étape est une action manuelle ; rien ne se replanifie tout seul.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="roadmap"
            titre="Roadmap"
            icon={<IconRoadmap />}
            resume="Vue chronologique des projets et suivi de la progression par objectif de vie."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>Une frise chronologique des projets sur leur période d'activité.</li>
                <li>
                  « Progression par objectif » : un pourcentage dérivé de l'avancement des projets rattachés à
                  chaque objectif.
                </li>
                <li>Les rétrospectives globales apparaissent tout en bas de l'écran.</li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>Clic sur un projet de la frise → sa fiche. Alimentée par les mêmes objectifs et projets que la Vue globale.</p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Rien à saisir directement ici, à part une nouvelle rétrospective globale.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="routine"
            titre="Routine"
            icon={<IconRoutine />}
            resume="Un tableau hebdomadaire d'habitudes à cocher chaque jour, avec série et taux de complétion."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>Chaque ligne est une routine active, chaque colonne un jour de la semaine en cours.</li>
                <li>Cocher une case l'enregistre pour ce jour précis — décocher la retire.</li>
                <li>
                  Cliquer sur le nom d'une routine ouvre sa <strong>Fiche routine</strong> : le même bandeau
                  semaine, plus un journal de notes libres pour détailler ce qui a été fait.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>
                Alimente le compteur « Régularité » de la sidebar — indépendant du streak « actions » de la Vue
                globale, qui lui vient du Journal de suivi des projets.
              </p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Cocher chaque jour est manuel ; rien ne se coche tout seul, même rétroactivement.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="objectifs"
            titre="Objectifs"
            icon={<IconObjectifs />}
            resume="Les grandes ambitions personnelles, plus larges qu'un seul projet."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>Un objectif a un titre et une description.</li>
                <li>
                  Un ou plusieurs projets peuvent lui être rattachés — depuis le formulaire du projet, pas depuis
                  cet écran.
                </li>
                <li>Sa progression est la moyenne d'avancement des projets qui lui sont rattachés.</li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>Alimenté par les projets ; visible aussi sur la Roadmap.</p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Créer un objectif est manuel ; le rattacher à un projet se fait au niveau du projet.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="backlog"
            titre="Backlog d'idées"
            icon={<IconBacklog />}
            resume="La salle d'attente des projets — tout ce qui mérite d'être noté sans être encore lancé."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>Chaque idée a un niveau d'intérêt, un effort estimé, une catégorie et un objectif optionnel.</li>
                <li>
                  Le bouton « Promouvoir » la transforme en vrai projet (statut « préparation ») en gardant ces
                  informations, et la retire du backlog.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>Une idée promue devient un Projet et suit ensuite le même chemin que tous les autres.</p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>La promotion est toujours un choix manuel — aucune idée ne devient projet toute seule, même bien notée.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="recherche"
            titre="Recherche notes & ⌘K"
            icon={<IconRecherche />}
            resume="Retrouver n'importe quelle note, projet, étape, objectif ou idée par mot-clé."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>L'écran « Recherche notes » filtre les notes par mots-clés et par tags.</li>
                <li>
                  La palette <strong>⌘K / Ctrl+K</strong> (accessible depuis n'importe quel écran, ou en cliquant
                  la barre de recherche en haut) cherche en même temps dans les projets, étapes, notes, objectifs
                  et idées, avec une navigation au clavier.
                </li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>Chaque résultat ouvre directement le bon écran — par exemple une étape ouvre sa fiche projet, à l'onglet Plan d'attaque.</p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Aucune — recherche pure, rien n'est modifié.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="panneau"
            titre="Panneau de rappels"
            icon={<IconGuide />}
            resume="Le bouton « Panneau » en haut à droite : un tiroir qui résume ce qui a besoin d'attention maintenant."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>3 groupes : échéances proches (≤ 7 jours ou en retard), seuils de dépenses dépassés, étapes bloquées.</li>
                <li>Le badge sur le bouton compte le total de tous les groupes.</li>
                <li>Cliquer un élément ferme le panneau et ouvre directement le projet concerné.</li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>Recalculé à chaque ouverture à partir des projets actifs — les projets archivés ou masqués n'y apparaissent jamais.</p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Rien ici n'est actionnable directement — agir (repousser une échéance, débloquer une étape) se fait sur la fiche du projet.</p>
            </Bloc>
          </Rubrique>

          <Rubrique
            id="parametres"
            titre="Paramètres"
            icon={<IconParametres />}
            resume="Tout ce qui règle le comportement de l'app plutôt que son contenu."
          >
            <Bloc titre="Fonctionnement">
              <ul>
                <li>
                  <strong>Thème</strong> : 4 thèmes prédéfinis, ou un thème personnalisé — choisis une couleur de
                  fond et une couleur d'accent, le reste (surfaces, bordures, textes) est calculé automatiquement
                  pour rester lisible.
                </li>
                <li><strong>Devise</strong> : change uniquement l'affichage des montants déjà saisis, jamais leur valeur.</li>
                <li><strong>Catégories</strong> : nom + couleur, utilisées partout — Projets, Calendrier, Roadmap.</li>
                <li>
                  <strong>Cycles de la Vue globale</strong> : remet à zéro ses compteurs après un intervalle choisi
                  (jours/mois/années), sans jamais supprimer l'historique (« Cycles précédents »).
                </li>
                <li><strong>Verrouillage</strong> : demande un mot de passe à chaque ouverture de l'app — protège l'accès, ne chiffre pas les données.</li>
                <li><strong>Données</strong> : emplacement et taille du fichier local, export/import JSON complet, génération d'un rapport texte.</li>
              </ul>
            </Bloc>
            <Bloc titre="Connexions">
              <p>Le thème et la devise s'appliquent instantanément partout ; l'import remplace la totalité des données de l'app, après confirmation explicite.</p>
            </Bloc>
            <Bloc titre="Ce qui dépend de toi">
              <p>Tout ici est un choix explicite, à l'exception du déclenchement d'un cycle arrivé à échéance, qui se fait tout seul au prochain lancement.</p>
            </Bloc>
          </Rubrique>
        </div>
      </div>
    </div>
  );
}
