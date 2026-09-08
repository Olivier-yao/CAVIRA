import { useEffect } from "react";
import "./Splash.css";

interface SplashProps {
  onTermine: () => void;
}

const LETTRES = "CAVIRA".split("");
const DELAI_LETTRE_DEBUT = 2300;
const DELAI_LETTRE_PAS = 130;
const DUREE_TOTALE = 4000;

export function Splash({ onTermine }: SplashProps) {
  useEffect(() => {
    const t = setTimeout(onTermine, DUREE_TOTALE);
    return () => clearTimeout(t);
  }, [onTermine]);

  return (
    <div id="cavira-splash" className="is-playing">
      <div className="stack">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <defs>
            <radialGradient id="cavHubGrad" cx="34%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#CFC7FF" />
              <stop offset="58%" stopColor="#A796FA" />
              <stop offset="100%" stopColor="#8B7BF7" />
            </radialGradient>
            <filter id="cavGlowSoft" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="cavGlowWide" x="-90%" y="-90%" width="280%" height="280%">
              <feGaussianBlur stdDeviation="17" />
            </filter>
            <filter id="cavGlowDot" x="-160%" y="-160%" width="420%" height="420%">
              <feGaussianBlur stdDeviation="4.5" />
            </filter>
          </defs>

          <g className="halo">
            <path
              d="M130.97 144.24 A54 54 0 1 1 130.97 55.76"
              stroke="#8B7BF7"
              strokeWidth="7"
              strokeLinecap="round"
              opacity=".55"
              filter="url(#cavGlowWide)"
            />
            <path
              d="M130.97 144.24 A54 54 0 1 1 130.97 55.76"
              stroke="#A796FA"
              strokeWidth="6"
              strokeLinecap="round"
              opacity=".7"
              filter="url(#cavGlowSoft)"
            />
            <circle cx="100" cy="100" r="12" fill="#8B7BF7" opacity=".5" filter="url(#cavGlowSoft)" />
          </g>

          <path className="arc" d="M130.97 144.24 A54 54 0 1 1 130.97 55.76" stroke="#8B7BF7" strokeWidth="6" strokeLinecap="round" />

          <circle className="hub" cx="100" cy="100" r="11" fill="url(#cavHubGrad)" />

          <g className="spark">
            <circle cx="130.97" cy="55.76" r="6" fill="#E8EAF2" opacity=".85" filter="url(#cavGlowDot)" />
            <circle cx="130.97" cy="55.76" r="3.6" fill="#F2EFFF" />
          </g>
        </svg>

        <div className="word">
          {LETTRES.map((lettre, i) => (
            <span key={i} style={{ animationDelay: `${DELAI_LETTRE_DEBUT + i * DELAI_LETTRE_PAS}ms` }}>
              {lettre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
