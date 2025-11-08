import { useNavigate } from "react-router-dom";
import styles from "./BackZone.module.css";

interface BackZoneProps {
  to: string;
  label?: string;
}

const BackZone = ({ to, label = "Назад" }: BackZoneProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <div 
      className={styles.backZone} 
      onClick={handleClick} 
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      title={label}
    >
      <svg
        className={styles.arrow}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default BackZone;
