import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { Article } from "../types/article";
import styles from "./AllPersonalitiesPage.module.css";

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api-nest/articles")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки статей");
        return res.json();
      })
      .then((data) => {
        setArticles(data.filter((article: Article) => article.id));
      })
      .catch((err) => {
        console.error("Ошибка в ArticlesPage:", err);
      });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Все статьи</h1>

      <div className={styles.list}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default ArticlesPage;
