import PersonCard from "./PersonCard";
import { PersonalityPreview } from "../types/Personality";
import styles from "./PersonList.module.css";

interface PersonsProps {
  persons: PersonalityPreview[];
}

const PersonList = ({ persons }: PersonsProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {persons.map((person) => (
          <div key={person.id} className={styles.gridItem}>
            <PersonCard person={person} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonList;
