import { useNavigate } from "react-router-dom";
import styles from "./BackZone.module.css";

interface BackZoneProps {
  to: string;
}

const BackZone = ({ to }: BackZoneProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.backZone} onClick={() => navigate(to)} title="Назад">
      <svg
        className={styles.arrow}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default BackZone;
