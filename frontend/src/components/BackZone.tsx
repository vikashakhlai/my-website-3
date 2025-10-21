import { useNavigate } from "react-router-dom";
import styles from "./BackZone.module.css";

interface BackZoneProps {
  to: string;
}

const BackZone = ({ to }: BackZoneProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <div className={styles.backZone} onClick={handleClick}>
      <div className={styles.arrow}></div>
    </div>
  );
};

export default BackZone;