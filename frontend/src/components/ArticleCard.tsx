import React from "react";
import { Link } from "react-router-dom";
import styles from "./ArticleCard.module.css";
import { Article } from "../types/article";

interface Props {
  article: Article;
  isDimmed?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

const ArticleCard: React.FC<Props> = ({
  article,
  isDimmed,
  onHover,
  onLeave,
}) => {
  const { id, titleRu, titleAr, description, imageUrl, themeRu } = article;

  return (
    <div
      className={`${styles.cardWrapper} ${isDimmed ? styles.dimmed : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Link to={`/articles/${id}`} className={styles.card}>
        <div className={styles.imageWrapper}>
          <img src={imageUrl} alt={titleRu} />
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.titleRu}>{titleRu}</h3>
            <h3 className={styles.titleAr}>{titleAr}</h3>
          </div>

          {themeRu && <span className={styles.tag}>{themeRu}</span>}

          {description && (
            <p className={styles.description}>
              {description.length > 180
                ? description.slice(0, 180) + "..."
                : description}
            </p>
          )}

          <span className={styles.readMore}>Читать далее →</span>
        </div>
      </Link>
    </div>
  );
};

export default ArticleCard;
