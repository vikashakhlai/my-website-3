import styles from "./LatestArticles.module.css";
import ArticleCard from "./ArticleCard";
import { Article } from "../types/article";

export interface Articles {
  articles: Article[];
}

const LatestArticles = ({ articles }: Articles) => {
  return (
    <div className={styles.wrapper}>
      {articles
        .filter((article) => article.id)
        .map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
    </div>
  );
};

export default LatestArticles;
