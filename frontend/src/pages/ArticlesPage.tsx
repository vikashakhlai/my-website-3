import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { Article } from "../types/article";
import styles from "./AllPersonalitiesPage.module.css";
import { api } from "../api/auth";
import useScrollToTop from "../hooks/useScrollToTop";
import SkeletonCard from "../components/SkeletonCard";

const ArticlesPage = () => {
  useScrollToTop();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/articles")
      .then((res) => {
        setArticles(res.data.filter((article: Article) => article.id));
      })
      .catch((err) => {
        console.error("Ошибка в ArticlesPage:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Все статьи</h1>

      {loading ? (
        <SkeletonCard variant="article" count={6} layout="list" />
      ) : (
        <div className={`${styles.list} ${styles.fadeIn}`}>
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <p style={{ textAlign: "center", width: "100%" }}>
              Пока нет доступных статей
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
