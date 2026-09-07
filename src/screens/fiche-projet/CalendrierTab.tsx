import type { AppData } from "../../types";
import { calendrierItemsProjet, chargeTravail } from "../../lib/ficheProjet";
import { daysUntil, formatDateDDMM, formatMonthShort } from "../../lib/format";

interface CalendrierTabProps {
  data: AppData;
  projetId: string;
}

export function CalendrierTab({ data, projetId }: CalendrierTabProps) {
  const items = calendrierItemsProjet(data.etapes, data.calendrier, projetId);
  const charge = chargeTravail(data.calendrier, data.etapes, projetId);

  return (
    <div className="calendrier-tab">
      <div className="calendrier-tab__main card">
        <h2>Échéances et sessions à venir</h2>
        <div className="calendrier-tab__list">
          {items.length === 0 && <p className="calendrier-tab__vide">Rien de planifié pour l'instant.</p>}
          {items.map((item) => {
            const j = daysUntil(item.date);
            return (
              <div key={item.id} className="calendrier-item">
                <div className="calendrier-item__date">
                  <span className="calendrier-item__day">{formatDateDDMM(item.date).split("/")[0]}</span>
                  <span className="calendrier-item__month">{formatMonthShort(new Date(item.date))}</span>
                </div>
                <div className="calendrier-item__body">
                  <div className="calendrier-item__titre">{item.titre}</div>
                  <div className="calendrier-item__sous">{item.sousTitre}</div>
                </div>
                <span className={`badge calendrier-item__badge${item.isJalon ? " calendrier-item__badge--jalon" : ""}`}>
                  {item.isJalon ? "Jalon" : j >= 0 ? `J-${j}` : `J+${-j}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendrier-tab__side card">
        <h3>Charge de travail</h3>
        <p className="calendrier-tab__charge-texte">
          {charge.sessionsCetteSemaine} session{charge.sessionsCetteSemaine > 1 ? "s" : ""} planifiée
          {charge.sessionsCetteSemaine > 1 ? "s" : ""} cette semaine. {charge.echeances10j} échéance
          {charge.echeances10j > 1 ? "s" : ""} dans les 10 jours.
        </p>
      </div>
    </div>
  );
}
