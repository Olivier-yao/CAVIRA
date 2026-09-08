import "./TopBar.css";

interface TopBarProps {
  onNouveauProjet: () => void;
  onOpenPalette: () => void;
  onOpenPanneau: () => void;
  nbRappels: number;
}

export function TopBar({ onNouveauProjet, onOpenPalette, onOpenPanneau, nbRappels }: TopBarProps) {
  return (
    <header className="topbar">
      <button className="topbar__search" onClick={onOpenPalette}>
        <span className="topbar__search-icon">⌕</span>
        <span className="topbar__search-placeholder">Rechercher un projet, une note, une étape…</span>
        <kbd>⌘K</kbd>
      </button>
      <div className="topbar__title">CENTRE DE COMMANDE</div>
      <div className="topbar__actions">
        <button className="btn btn--ghost topbar__panneau" onClick={onOpenPanneau}>
          Panneau
          {nbRappels > 0 && <span className="topbar__panneau-badge">{nbRappels}</span>}
        </button>
        <button className="btn btn--accent" onClick={onNouveauProjet}>
          <span>+</span> Nouveau projet
        </button>
      </div>
    </header>
  );
}
