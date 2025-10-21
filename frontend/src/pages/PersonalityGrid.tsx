import { Personality } from "../types/Personality";
import PersonCard from "../components/PersonCard";
import styles from "./AllPersonalitiesPage.module.css";

interface PersonalityGridProps {
  personalities: Personality[];
  isFetching: boolean;
}

const PersonalityGrid = ({ personalities, isFetching }: PersonalityGridProps) => {
  return (
    <div className={styles.gridWrapper}>
      {isFetching && <div className={styles.overlay}>Загрузка...</div>}
      <div className={styles.grid}>
        {personalities.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
};

export default PersonalityGrid;
