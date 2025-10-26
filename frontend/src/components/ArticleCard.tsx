import React from "react";
import { Link } from "react-router-dom";
import styles from "./ArticleCard.module.css";
import { Article } from "../pages/types/article";

const ArticleCard: React.FC<{ article: Article | undefined }> = ({
  article,
}) => {
  if (!article) {
    return <div className={styles.articleCard}>Загрузка...</div>;
  }

  const { id, titleRu, titleAr, description, content, imageUrl, themeRu } =
    article;

  const handleMouseEnter = () => {
    document.querySelectorAll(`.${styles.articleCard}`).forEach((card) => {
      if (card instanceof HTMLElement) {
        card.classList.add("dim");
      }
    });
    const currentCard = document.getElementById(`card-${id}`);
    if (currentCard) {
      currentCard.classList.remove("dim");
    }
  };

  const handleMouseLeave = () => {
    document.querySelectorAll(`.${styles.articleCard}`).forEach((card) => {
      if (card instanceof HTMLElement) {
        card.classList.remove("dim");
      }
    });
  };

  return (
    <Link
      to={`/articles/${id}`}
      className={styles.articleCard}
      id={`card-${id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.cardContent}>
        <div className={styles.textContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.titleRu}>{titleRu}</div>
            <div className={styles.titleAr}>{titleAr}</div>
          </div>
          <div className={styles.theme}>{themeRu}</div>
          <div className={styles.description}>{description}</div>
          <div className={styles.content}>
            {content.length > 400 ? `${content.substring(0, 400)}...` : content}
          </div>
        </div>
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={titleRu} />
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
