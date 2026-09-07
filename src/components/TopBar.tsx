import "./TopBar.css";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <span className="topbar__search-icon">⌕</span>
        <input placeholder="Rechercher un projet, une note, une étape…" />
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar__title">CENTRE DE COMMANDE</div>
      <div className="topbar__actions">
        <button className="btn btn--ghost">Panneau</button>
        <button className="btn btn--accent">
          <span>+</span> Nouveau projet
        </button>
      </div>
    </header>
  );
}
