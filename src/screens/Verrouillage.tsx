import { useState } from "react";
import "./Verrouillage.css";
import { verifierMotDePasse } from "../lib/verrouillage";

interface VerrouillageProps {
  onDeverrouille: () => void;
}

export function Verrouillage({ onDeverrouille }: VerrouillageProps) {
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState(false);
  const [verificationEnCours, setVerificationEnCours] = useState(false);

  async function handleValider() {
    if (!motDePasse) return;
    setVerificationEnCours(true);
    const ok = await verifierMotDePasse(motDePasse);
    setVerificationEnCours(false);
    if (ok) {
      onDeverrouille();
    } else {
      setErreur(true);
      setMotDePasse("");
    }
  }

  return (
    <div className="verrouillage-screen">
      <div className="verrouillage-card">
        <div className="verrouillage-logo">C</div>
        <h1>CAVIRA</h1>
        <p className="verrouillage-sous-titre">Application verrouillée — entre ton mot de passe pour continuer.</p>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => {
            setMotDePasse(e.target.value);
            setErreur(false);
          }}
          placeholder="Mot de passe"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleValider()}
        />
        {erreur && <p className="verrouillage-erreur">Mot de passe incorrect.</p>}
        <button className="btn btn--accent" onClick={handleValider} disabled={!motDePasse || verificationEnCours}>
          {verificationEnCours ? "Vérification…" : "Déverrouiller"}
        </button>
      </div>
    </div>
  );
}
