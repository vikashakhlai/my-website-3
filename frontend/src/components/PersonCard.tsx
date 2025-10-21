import { Link } from "react-router-dom";
import styles from "./PersonCard.module.css";
import { PersonalityPreview } from "../types/Personality";

const PersonCard = ({ person }: { person: PersonalityPreview }) => {
  const factsArray = Array.isArray(person.facts)
    ? person.facts
    : person.facts
    ? [person.facts]
    : [];

  return (
    <Link to={`/personalities/${person.id}`} className={styles.card}>
      <img src={person.imageUrl} alt={person.name} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.name}>
          {person.name} ({person.years})
        </h3>
        <p className={styles.position}>{person.position}</p>
        {factsArray.length > 0 && (
          <ul className={styles.factsList}>
            {factsArray.map((fact, index) => (
              <li key={index} className={styles.factItem}>
                {fact}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
};

export default PersonCard;
