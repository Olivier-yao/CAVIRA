import { useEffect, useState } from "react";
import "./Parametres.css";
import type { AppData } from "../types";
import {
  THEMES,
  applyTheme,
  deriverThemePersonnalise,
  getCustomThemeColors,
  getStoredTheme,
  setCustomThemeColors,
  type CustomThemeColors,
  type ThemeId,
} from "../lib/theme";
import { DEVISES, getStoredDevise, setStoredDevise, type DeviseCode } from "../lib/devise";
import { addCategorie, modifierCategorie, restaurerDonnees, supprimerCategorie } from "../data/db";
import {
  choisirEtLireImport,
  exporterDonnees,
  exporterRapport,
  getDbPath,
  getDbSizeLabel,
  getDernierExport,
  isTauriRuntime,
  type ImportResultat,
} from "../data/fichiers";
import { formatDateMedium } from "../lib/format";
import { construireFenetre, genererRapportTexte, type PeriodeRapport } from "../lib/rapport";
import {
  avancerCycleSiNecessaire,
  finCycle,
  reinitialiserCycleMaintenant,
  setCycleConfig,
  type CycleConfig,
  type CycleUnite,
} from "../lib/cycles";
import { definirMotDePasse, desactiverVerrouillage, verrouillageActif } from "../lib/verrouillage";

interface ParametresProps {
  data: AppData;
  onDataChanged: () => void;
}

const COULEURS_SUGGEREES = ["#4FD1E8", "#F472A8", "#B6E24A", "#8A90A6", "#8B7BF7", "#F2A93B"];

const PERIODES_RAPPORT: { id: PeriodeRapport; label: string }[] = [
  { id: "30j", label: "30 derniers jours" },
  { id: "mois", label: "Ce mois-ci" },
  { id: "trimestre", label: "Ce trimestre" },
];

export function Parametres({ data, onDataChanged }: ParametresProps) {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme());
  const [couleursPersonnalisees, setCouleursPersonnalisees] = useState<CustomThemeColors>(getCustomThemeColors());
  const [devise, setDevise] = useState<DeviseCode>(getStoredDevise());
  const [showAddCategorie, setShowAddCategorie] = useState(false);
  const [nomCategorie, setNomCategorie] = useState("");
  const [couleurCategorie, setCouleurCategorie] = useState(COULEURS_SUGGEREES[0]);
  const [categorieEnEditionId, setCategorieEnEditionId] = useState<string | null>(null);
  const [nomEdition, setNomEdition] = useState("");
  const [couleurEdition, setCouleurEdition] = useState("");
  const [confirmSuppressionCategorieId, setConfirmSuppressionCategorieId] = useState<string | null>(null);

  const [emplacement, setEmplacement] = useState("Aperçu navigateur — indisponible");
  const [taille, setTaille] = useState("—");
  const [dernierExport, setDernierExport] = useState<string | null>(getDernierExport());
  const [exportEnCours, setExportEnCours] = useState(false);
  const [importEnAttente, setImportEnAttente] = useState<ImportResultat | null>(null);
  const [importErreur, setImportErreur] = useState<string | null>(null);
  const [importEnCours, setImportEnCours] = useState(false);
  const [periodeRapport, setPeriodeRapport] = useState<PeriodeRapport>("30j");
  const [rapportEnCours, setRapportEnCours] = useState(false);
  const [cycleConfig, setCycleConfigState] = useState<CycleConfig>(() => avancerCycleSiNecessaire());
  const [cycleReinitialise, setCycleReinitialise] = useState(false);

  const [verrouille, setVerrouille] = useState(verrouillageActif());
  const [formMdpOuvert, setFormMdpOuvert] = useState(false);
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmationMdp, setConfirmationMdp] = useState("");
  const [erreurMdp, setErreurMdp] = useState<string | null>(null);
  const [confirmDesactivation, setConfirmDesactivation] = useState(false);

  useEffect(() => {
    if (!isTauriRuntime()) return;
    getDbPath().then(setEmplacement);
    getDbSizeLabel().then(setTaille);
  }, []);

  function handleChoisirTheme(id: ThemeId) {
    setTheme(id);
    applyTheme(id, couleursPersonnalisees);
  }

  function handleChangerCouleurPersonnalisee(patch: Partial<CustomThemeColors>) {
    const nouveau = { ...couleursPersonnalisees, ...patch };
    setCouleursPersonnalisees(nouveau);
    setCustomThemeColors(nouveau);
    if (theme === "custom") applyTheme("custom", nouveau);
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

  function handleOuvrirEditionCategorie(id: string, label: string, color: string) {
    setCategorieEnEditionId(id);
    setNomEdition(label);
    setCouleurEdition(color);
    setConfirmSuppressionCategorieId(null);
  }

  async function handleEnregistrerCategorie() {
    if (!categorieEnEditionId || !nomEdition.trim()) return;
    await modifierCategorie(categorieEnEditionId, nomEdition.trim(), couleurEdition);
    setCategorieEnEditionId(null);
    onDataChanged();
  }

  async function handleSupprimerCategorie(id: string) {
    if (confirmSuppressionCategorieId !== id) {
      setConfirmSuppressionCategorieId(id);
      return;
    }
    await supprimerCategorie(id);
    setCategorieEnEditionId(null);
    setConfirmSuppressionCategorieId(null);
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

  async function handleChoisirFichierImport() {
    if (!isTauriRuntime()) return;
    setImportErreur(null);
    try {
      const resultat = await choisirEtLireImport();
      if (resultat) setImportEnAttente(resultat);
    } catch (e) {
      setImportErreur(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleGenererRapport() {
    if (!isTauriRuntime()) return;
    setRapportEnCours(true);
    try {
      const fenetre = construireFenetre(periodeRapport);
      const texte = genererRapportTexte(data, fenetre);
      await exporterRapport(texte, `cavira-rapport-${periodeRapport}.txt`);
    } finally {
      setRapportEnCours(false);
    }
  }

  function handleToggleCycle() {
    const nouveau = { ...cycleConfig, actif: !cycleConfig.actif, debut: cycleConfig.debut || new Date().toISOString() };
    setCycleConfig(nouveau);
    setCycleConfigState(nouveau);
  }

  function handleChangerIntervalle(valeur: number) {
    const nouveau = { ...cycleConfig, intervalle: Math.max(1, valeur) };
    setCycleConfig(nouveau);
    setCycleConfigState(nouveau);
  }

  function handleChangerUnite(unite: CycleUnite) {
    const nouveau = { ...cycleConfig, unite };
    setCycleConfig(nouveau);
    setCycleConfigState(nouveau);
  }

  function handleReinitialiserCycle() {
    setCycleConfigState(reinitialiserCycleMaintenant());
    setCycleReinitialise(true);
    window.setTimeout(() => setCycleReinitialise(false), 2500);
  }

  function handleOuvrirFormMdp() {
    setNouveauMdp("");
    setConfirmationMdp("");
    setErreurMdp(null);
    setFormMdpOuvert(true);
  }

  async function handleDefinirMdp() {
    if (nouveauMdp.length < 4) {
      setErreurMdp("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }
    if (nouveauMdp !== confirmationMdp) {
      setErreurMdp("Les deux mots de passe ne correspondent pas.");
      return;
    }
    await definirMotDePasse(nouveauMdp);
    setVerrouille(true);
    setFormMdpOuvert(false);
    setNouveauMdp("");
    setConfirmationMdp("");
    setErreurMdp(null);
  }

  function handleDesactiverVerrouillage() {
    if (!confirmDesactivation) {
      setConfirmDesactivation(true);
      return;
    }
    desactiverVerrouillage();
    setVerrouille(false);
    setConfirmDesactivation(false);
    setFormMdpOuvert(false);
  }

  async function handleConfirmerImport() {
    if (!importEnAttente) return;
    setImportEnCours(true);
    try {
      await restaurerDonnees(importEnAttente.data);
      setImportEnAttente(null);
      onDataChanged();
    } catch (e) {
      setImportErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setImportEnCours(false);
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
          <button
            className={`theme-option${theme === "custom" ? " theme-option--active" : ""}`}
            onClick={() => handleChoisirTheme("custom")}
          >
            <div className="theme-option__swatches">
              {[
                couleursPersonnalisees.bg,
                deriverThemePersonnalise(couleursPersonnalisees)["--surface"],
                deriverThemePersonnalise(couleursPersonnalisees)["--border"],
                couleursPersonnalisees.accent,
              ].map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </div>
            <div className="theme-option__label">
              <span className={`theme-option__dot${theme === "custom" ? " theme-option__dot--on" : ""}`} />
              Personnalisé
            </div>
          </button>
        </div>

        {theme === "custom" && (
          <div className="theme-custom-editor">
            <label className="theme-custom-editor__champ">
              <span>Fond</span>
              <input
                type="color"
                value={couleursPersonnalisees.bg}
                onChange={(e) => handleChangerCouleurPersonnalisee({ bg: e.target.value })}
              />
              <span className="mono">{couleursPersonnalisees.bg.toUpperCase()}</span>
            </label>
            <label className="theme-custom-editor__champ">
              <span>Accent</span>
              <input
                type="color"
                value={couleursPersonnalisees.accent}
                onChange={(e) => handleChangerCouleurPersonnalisee({ accent: e.target.value })}
              />
              <span className="mono">{couleursPersonnalisees.accent.toUpperCase()}</span>
            </label>
            <p className="theme-custom-editor__note">
              Les surfaces, bordures et textes sont calculés automatiquement à partir de ces deux couleurs.
            </p>
          </div>
        )}
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
            if (categorieEnEditionId === cat.id) {
              return (
                <div key={cat.id} className="categorie-row categorie-row--edition">
                  <input
                    className="categorie-row__nom-input"
                    value={nomEdition}
                    onChange={(e) => setNomEdition(e.target.value)}
                    autoFocus
                  />
                  <div className="categorie-add-form__couleurs">
                    {COULEURS_SUGGEREES.map((c) => (
                      <button
                        key={c}
                        className={`categorie-add-form__couleur${couleurEdition === c ? " categorie-add-form__couleur--active" : ""}`}
                        style={{ background: c }}
                        onClick={() => setCouleurEdition(c)}
                      />
                    ))}
                  </div>
                  <button
                    className="btn btn--danger categorie-row__supprimer"
                    onClick={() => handleSupprimerCategorie(cat.id)}
                    disabled={n > 0}
                    title={n > 0 ? "Retire d'abord les projets de cette catégorie" : undefined}
                  >
                    {confirmSuppressionCategorieId === cat.id ? "Confirmer" : "Supprimer"}
                  </button>
                  <button className="btn btn--ghost" onClick={() => setCategorieEnEditionId(null)}>
                    Annuler
                  </button>
                  <button className="btn btn--accent" onClick={handleEnregistrerCategorie}>
                    Enregistrer
                  </button>
                </div>
              );
            }
            return (
              <button
                key={cat.id}
                className="categorie-row"
                onClick={() => handleOuvrirEditionCategorie(cat.id, cat.label, cat.color)}
              >
                <span className="categorie-row__couleur" style={{ background: cat.color }} />
                <span className="categorie-row__nom">{cat.label}</span>
                <span className="categorie-row__count mono">
                  {n} projet{n > 1 ? "s" : ""}
                </span>
                <span className="categorie-row__hex mono">{cat.color.toUpperCase()}</span>
              </button>
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

      <section className="card parametres-section">
        <h2>Rapport de progression</h2>
        <p className="parametres-section__desc">
          Génère un résumé texte de ta progression sur une période donnée — utile pour un bilan personnel ou pour
          partager un état d'avancement.
        </p>
        <div className="devise-liste">
          {PERIODES_RAPPORT.map((p) => (
            <button
              key={p.id}
              className={`devise-chip${periodeRapport === p.id ? " devise-chip--active" : ""}`}
              onClick={() => setPeriodeRapport(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="parametres-actions">
          <button
            className="btn btn--accent"
            onClick={handleGenererRapport}
            disabled={!isTauriRuntime() || rapportEnCours}
            title={isTauriRuntime() ? undefined : "Disponible uniquement dans l'application native"}
          >
            {rapportEnCours ? "Génération…" : "Générer le rapport"}
          </button>
        </div>
      </section>

      <section className="card parametres-section">
        <div className="parametres-section__top">
          <div>
            <h2>Cycles de la Vue globale</h2>
            <p className="parametres-section__desc">
              Réinitialise périodiquement les compteurs de la Vue globale pour repartir sur une base neutre. Rien
              n'est supprimé : chaque cycle passé reste consultable dans « Cycles précédents ».
            </p>
          </div>
          <button
            className={`cycle-toggle${cycleConfig.actif ? " cycle-toggle--on" : ""}`}
            onClick={handleToggleCycle}
            role="switch"
            aria-checked={cycleConfig.actif}
            aria-label="Activer les cycles"
          >
            <span className="cycle-toggle__knob" />
          </button>
        </div>

        {cycleConfig.actif && (
          <div className="cycle-config">
            <div className="cycle-config__intervalle">
              <span>Réinitialiser tous les</span>
              <input
                type="number"
                min={1}
                value={cycleConfig.intervalle}
                onChange={(e) => handleChangerIntervalle(Number(e.target.value))}
              />
              <select value={cycleConfig.unite} onChange={(e) => handleChangerUnite(e.target.value as CycleUnite)}>
                <option value="jours">jour{cycleConfig.intervalle > 1 ? "s" : ""}</option>
                <option value="mois">mois</option>
                <option value="annees">année{cycleConfig.intervalle > 1 ? "s" : ""}</option>
              </select>
            </div>
            <div className="cycle-config__info">
              <span>
                Cycle actuel depuis le {formatDateMedium(cycleConfig.debut)} · prochaine réinitialisation le{" "}
                {formatDateMedium(finCycle(cycleConfig).toISOString())}
              </span>
              <button className="btn btn--ghost" onClick={handleReinitialiserCycle}>
                Réinitialiser maintenant
              </button>
              {cycleReinitialise && <span className="cycle-config__confirm">✓ Cycle réinitialisé</span>}
            </div>
          </div>
        )}
      </section>

      <section className="card parametres-section">
        <div className="parametres-section__top">
          <div>
            <h2>Verrouillage de l'application</h2>
            <p className="parametres-section__desc">
              Demande un mot de passe à chaque ouverture de CAVIRA. Protège l'accès à l'application sur cette
              machine — les données restent stockées en clair sur le disque.
            </p>
          </div>
          <button
            className={`cycle-toggle${verrouille ? " cycle-toggle--on" : ""}`}
            onClick={() => (verrouille ? handleDesactiverVerrouillage() : handleOuvrirFormMdp())}
            role="switch"
            aria-checked={verrouille}
            aria-label="Activer le verrouillage"
          >
            <span className="cycle-toggle__knob" />
          </button>
        </div>

        {verrouille && !formMdpOuvert && (
          <div className="parametres-actions">
            <button className="btn btn--ghost" onClick={handleOuvrirFormMdp}>
              Changer le mot de passe
            </button>
            {confirmDesactivation && (
              <button className="btn btn--danger" onClick={handleDesactiverVerrouillage}>
                Confirmer la désactivation
              </button>
            )}
          </div>
        )}

        {formMdpOuvert && (
          <div className="cycle-config">
            <div className="verrouillage-mdp-form">
              <input
                type="password"
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                placeholder="Nouveau mot de passe"
                autoFocus
              />
              <input
                type="password"
                value={confirmationMdp}
                onChange={(e) => setConfirmationMdp(e.target.value)}
                placeholder="Confirmer le mot de passe"
                onKeyDown={(e) => e.key === "Enter" && handleDefinirMdp()}
              />
            </div>
            {erreurMdp && <p className="parametres-import-erreur">{erreurMdp}</p>}
            <div className="parametres-actions">
              <button className="btn btn--ghost" onClick={() => setFormMdpOuvert(false)}>
                Annuler
              </button>
              <button className="btn btn--accent" onClick={handleDefinirMdp}>
                Enregistrer
              </button>
            </div>
          </div>
        )}
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
            <button
              className="btn btn--ghost"
              onClick={handleChoisirFichierImport}
              disabled={!isTauriRuntime()}
              title={isTauriRuntime() ? undefined : "Disponible uniquement dans l'application native"}
            >
              Importer un fichier
            </button>
          </div>

          {importErreur && <p className="parametres-import-erreur">{importErreur}</p>}

          {importEnAttente && (
            <div className="parametres-import-confirm">
              <div className="parametres-import-confirm__label">Remplacer toutes les données actuelles ?</div>
              <p>
                Ce fichier contient {importEnAttente.compteurs.projets} projet(s),{" "}
                {importEnAttente.compteurs.etapes} étape(s), {importEnAttente.compteurs.journal} entrée(s) de
                journal, {importEnAttente.compteurs.notes} note(s), {importEnAttente.compteurs.idees} idée(s).
                Cette action remplace définitivement les données présentes sur cette machine — assure-toi d'avoir
                exporté une sauvegarde récente si besoin.
              </p>
              <div className="parametres-import-confirm__actions">
                <button className="btn btn--ghost" onClick={() => setImportEnAttente(null)}>
                  Annuler
                </button>
                <button className="btn btn--danger" onClick={handleConfirmerImport} disabled={importEnCours}>
                  {importEnCours ? "Remplacement…" : "Remplacer mes données"}
                </button>
              </div>
            </div>
          )}
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
