import React from "react";
import styles from "./Loader.module.css";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const containerClasses = className.includes("overlay")
    ? `${styles.loaderContainer} ${styles.overlay}`
    : `${styles.loaderContainer} ${className}`;

  return (
    <div className={containerClasses}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {text && <p className={styles.loaderText}>{text}</p>}
    </div>
  );
};

export default Loader;

