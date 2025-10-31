import { useState } from "react";
import styles from "./LatestArticles.module.css";
import ArticleCard from "./ArticleCard";
import { Article } from "../types/article";

export interface Articles {
  articles: Article[];
}

const LatestArticles = ({ articles }: Articles) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className={styles.wrapper}>
      {articles
        .filter((article) => article.id)
        .map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            isDimmed={hoveredId !== null && hoveredId !== article.id}
            onHover={() => setHoveredId(article.id)}
            onLeave={() => setHoveredId(null)}
          />
        ))}
    </div>
  );
};

export default LatestArticles;
