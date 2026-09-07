import "./PremierLancement.css";

interface PremierLancementProps {
  onCreerProjet: () => void;
  onNoterIdee: () => void;
}

const POINTS = [
  { numero: "01", titre: "Un projet, un plan", texte: "Découpe en étapes et sous-étapes, avec priorité et date cible." },
  { numero: "02", titre: "Un journal honnête", texte: "Sessions, dépenses, économies, bénéfices estimés." },
  { numero: "03", titre: "Une vue de vie", texte: "Chaque projet nourrit un objectif de haut niveau." },
];

export function PremierLancement({ onCreerProjet, onNoterIdee }: PremierLancementProps) {
  return (
    <div className="premier-lancement">
      <div className="premier-lancement__icone">◱</div>
      <h1>Rien n'est encore en chantier.</h1>
      <p className="premier-lancement__texte">
        Ce centre de commande réunit le plan d'attaque, le calendrier, les finances et le journal de chacun de tes
        projets. Tout reste sur cette machine, dans un seul fichier.
      </p>
      <div className="premier-lancement__actions">
        <button className="btn btn--accent" onClick={onCreerProjet}>
          Créer mon premier projet
        </button>
        <button className="btn btn--ghost" onClick={onNoterIdee}>
          Noter une idée pour plus tard
        </button>
      </div>
      <div className="premier-lancement__points">
        {POINTS.map((p) => (
          <div key={p.numero} className="card premier-lancement__point">
            <span className="premier-lancement__numero">{p.numero}</span>
            <div className="premier-lancement__point-titre">{p.titre}</div>
            <p className="premier-lancement__point-texte">{p.texte}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
