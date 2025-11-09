import React from "react";
import styles from "./SkeletonCard.module.css";

export type SkeletonVariant = "book" | "personality" | "dialect" | "article" | "textbook";
export type SkeletonLayout = "grid" | "list";

interface SkeletonCardProps {
  variant: SkeletonVariant;
  count?: number;
  layout?: SkeletonLayout;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant,
  count = 8,
  layout = "grid",
}) => {
  const cards = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`${styles.card} ${styles[variant]}`}>
      {/* Book & Textbook: Portrait cover + text lines */}
      {(variant === "book" || variant === "textbook") && (
        <>
          <div className={styles.cover}></div>
          <div className={styles.content}>
            <div className={styles.line}></div>
            <div className={`${styles.line} ${styles.lineShort}`}></div>
            {variant === "textbook" && (
              <>
                <div className={`${styles.line} ${styles.lineShort}`}></div>
                <div className={styles.line}></div>
              </>
            )}
          </div>
        </>
      )}

      {/* Personality: Square/portrait photo + 1-2 lines */}
      {variant === "personality" && (
        <>
          <div className={styles.image}></div>
          <div className={styles.content}>
            <div className={styles.line}></div>
            <div className={`${styles.line} ${styles.lineShort}`}></div>
          </div>
        </>
      )}

      {/* Dialect: Smaller card with optional icon + 1 line */}
      {variant === "dialect" && (
        <>
          <div className={styles.preview}></div>
          <div className={styles.content}>
            <div className={styles.line}></div>
            <div className={styles.tags}>
              <div className={styles.tag}></div>
              <div className={styles.tag}></div>
            </div>
          </div>
        </>
      )}

      {/* Article: Horizontal list item with title + subtitle */}
      {variant === "article" && (
        <>
          <div className={styles.imageWrapper}></div>
          <div className={styles.content}>
            <div className={styles.line}></div>
            <div className={`${styles.line} ${styles.lineShort}`}></div>
            <div className={styles.tag}></div>
            <div className={`${styles.line} ${styles.lineMedium}`}></div>
          </div>
        </>
      )}
    </div>
  ));

  return (
    <div className={`${styles.container} ${styles[layout]} ${styles[`variant-${variant}`]}`}>
      {cards}
    </div>
  );
};

export default SkeletonCard;

