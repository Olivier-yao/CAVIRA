import { useEffect, useState } from "react";
import "./Parametres.css";
import type { AppData } from "../types";
import { THEMES, applyTheme, getStoredTheme, type ThemeId } from "../lib/theme";
import { DEVISES, getStoredDevise, setStoredDevise, type DeviseCode } from "../lib/devise";
import { addCategorie } from "../data/db";
import { exporterDonnees, getDbPath, getDbSizeLabel, getDernierExport, isTauriRuntime } from "../data/fichiers";
import { formatDateMedium } from "../lib/format";

interface ParametresProps {
  data: AppData;
  onDataChanged: () => void;
}

const COULEURS_SUGGEREES = ["#4FD1E8", "#F472A8", "#B6E24A", "#8A90A6", "#8B7BF7", "#F2A93B"];

export function Parametres({ data, onDataChanged }: ParametresProps) {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme());
  const [devise, setDevise] = useState<DeviseCode>(getStoredDevise());
  const [showAddCategorie, setShowAddCategorie] = useState(false);
  const [nomCategorie, setNomCategorie] = useState("");
  const [couleurCategorie, setCouleurCategorie] = useState(COULEURS_SUGGEREES[0]);

  const [emplacement, setEmplacement] = useState("Aperçu navigateur — indisponible");
  const [taille, setTaille] = useState("—");
  const [dernierExport, setDernierExport] = useState<string | null>(getDernierExport());
  const [exportEnCours, setExportEnCours] = useState(false);

  useEffect(() => {
    if (!isTauriRuntime()) return;
    getDbPath().then(setEmplacement);
    getDbSizeLabel().then(setTaille);
  }, []);

  function handleChoisirTheme(id: ThemeId) {
    setTheme(id);
    applyTheme(id);
  }

  function handleChoisirDevise(code: DeviseCode) {
    setDevise(code);
    setStoredDevise(code);
  }

  async function handleAjouterCategorie() {
    const nom = nomCategorie.trim();
    if (!nom) return;
    await addCategorie(nom, couleurCategorie);
    setNomCategorie("");
    setShowAddCategorie(false);
    onDataChanged();
  }

  async function handleExporter() {
    if (!isTauriRuntime()) return;
    setExportEnCours(true);
    try {
      const ok = await exporterDonnees(data);
      if (ok) setDernierExport(getDernierExport());
    } finally {
      setExportEnCours(false);
    }
  }

  return (
    <div className="parametres-screen">
      <header className="parametres-screen__header">
        <h1>Paramètres</h1>
        <p className="parametres-screen__subtitle mono">Données locales · aucun compte</p>
      </header>

      <section className="card parametres-section">
        <h2>Thème</h2>
        <p className="parametres-section__desc">La bascule anime les couleurs sur 320 ms, sans flash.</p>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-option${theme === t.id ? " theme-option--active" : ""}`}
              onClick={() => handleChoisirTheme(t.id)}
            >
              <div className="theme-option__swatches">
                {t.swatches.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </div>
              <div className="theme-option__label">
                <span className={`theme-option__dot${theme === t.id ? " theme-option__dot--on" : ""}`} />
                {t.label}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="card parametres-section">
        <div className="parametres-section__top">
          <div>
            <h2>Catégories de projet</h2>
            <p className="parametres-section__desc">
              Nom et couleur libres. La couleur se propage aux cartes, au calendrier et à la roadmap.
            </p>
          </div>
          <button className="categorie-add-btn" onClick={() => setShowAddCategorie((v) => !v)}>
            + Catégorie
          </button>
        </div>

        {showAddCategorie && (
          <div className="categorie-add-form">
            <input
              value={nomCategorie}
              onChange={(e) => setNomCategorie(e.target.value)}
              placeholder="Nom de la catégorie…"
              autoFocus
            />
            <div className="categorie-add-form__couleurs">
              {COULEURS_SUGGEREES.map((c) => (
                <button
                  key={c}
                  className={`categorie-add-form__couleur${couleurCategorie === c ? " categorie-add-form__couleur--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setCouleurCategorie(c)}
                />
              ))}
            </div>
            <button className="btn btn--accent" onClick={handleAjouterCategorie}>
              Ajouter
            </button>
          </div>
        )}

        <div className="categorie-liste">
          {data.categories.map((cat) => {
            const n = data.projets.filter((p) => p.categorie_id === cat.id).length;
            return (
              <div key={cat.id} className="categorie-row">
                <span className="categorie-row__couleur" style={{ background: cat.color }} />
                <span className="categorie-row__nom">{cat.label}</span>
                <span className="categorie-row__count mono">
                  {n} projet{n > 1 ? "s" : ""}
                </span>
                <span className="categorie-row__hex mono">{cat.color.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card parametres-section">
        <h2>Devise</h2>
        <p className="parametres-section__desc">
          S'applique à tous les montants (journal de suivi, seuils d'alerte). Change uniquement l'affichage, pas les
          montants déjà saisis.
        </p>
        <div className="devise-liste">
          {DEVISES.map((d) => (
            <button
              key={d.code}
              className={`devise-chip${devise === d.code ? " devise-chip--active" : ""}`}
              onClick={() => handleChoisirDevise(d.code)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <div className="parametres-row2">
        <section className="card parametres-section">
          <h2>Données</h2>
          <p className="parametres-section__desc">
            Base SQLite locale, un seul fichier sur ta machine. Sauvegarde manuelle recommandée avant chaque mise à
            jour.
          </p>
          <div className="parametres-kv">
            <div className="parametres-kv__row">
              <span>Emplacement</span>
              <span className="mono" title={emplacement}>
                {emplacement}
              </span>
            </div>
            <div className="parametres-kv__row">
              <span>Taille</span>
              <span className="mono">{taille}</span>
            </div>
            <div className="parametres-kv__row">
              <span>Dernier export</span>
              <span className="mono">{dernierExport ? formatDateMedium(dernierExport) : "Aucun export"}</span>
            </div>
          </div>
          <div className="parametres-actions">
            <button
              className="btn btn--accent"
              onClick={handleExporter}
              disabled={!isTauriRuntime() || exportEnCours}
              title={isTauriRuntime() ? undefined : "Disponible uniquement dans l'application native"}
            >
              {exportEnCours ? "Export…" : "Exporter maintenant"}
            </button>
            <button className="btn btn--ghost" disabled title="Bientôt disponible">
              Importer un fichier
            </button>
          </div>
        </section>

        <section className="card parametres-section">
          <h2>À propos</h2>
          <div className="parametres-kv">
            <div className="parametres-kv__row">
              <span>Version</span>
              <span className="mono">0.1.0 · MVP</span>
            </div>
            <div className="parametres-kv__row">
              <span>Runtime</span>
              <span className="mono">Tauri 2 · Windows / macOS / Linux</span>
            </div>
            <div className="parametres-kv__row">
              <span>Réseau</span>
              <span className="mono parametres-kv__ok">Aucun appel sortant</span>
            </div>
          </div>
          <div className="parametres-note">
            Seuil d'alerte financière, raccourcis clavier et rappels d'échéance se règlent dans les sections dédiées.
          </div>
        </section>
      </div>
    </div>
  );
}
