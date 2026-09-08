const ACTIF_KEY = "cavira:verrouillage-actif";
const HASH_KEY = "cavira:verrouillage-hash";

async function hacher(motDePasse: string): Promise<string> {
  const data = new TextEncoder().encode(motDePasse);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function verrouillageActif(): boolean {
  try {
    return localStorage.getItem(ACTIF_KEY) === "1" && !!localStorage.getItem(HASH_KEY);
  } catch {
    return false;
  }
}

export async function definirMotDePasse(motDePasse: string): Promise<void> {
  const hash = await hacher(motDePasse);
  try {
    localStorage.setItem(HASH_KEY, hash);
    localStorage.setItem(ACTIF_KEY, "1");
  } catch {
    // Pas grave si la préférence ne persiste pas.
  }
}

export function desactiverVerrouillage(): void {
  try {
    localStorage.removeItem(ACTIF_KEY);
    localStorage.removeItem(HASH_KEY);
  } catch {
    // Rien à faire.
  }
}

export async function verifierMotDePasse(saisie: string): Promise<boolean> {
  try {
    const hash = localStorage.getItem(HASH_KEY);
    if (!hash) return false;
    return (await hacher(saisie)) === hash;
  } catch {
    return false;
  }
}
