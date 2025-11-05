import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { Article } from "../types/article";
import styles from "./AllPersonalitiesPage.module.css";
import { api } from "../api/auth";
import useScrollToTop from "../hooks/useScrollToTop";

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

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Все статьи</h1>

      <div className={styles.list}>
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
    </div>
  );
};

export default ArticlesPage;
