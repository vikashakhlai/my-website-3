import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackZone from "../components/BackZone";
import styles from "./BookPage/BookPage.module.css";
import useScrollToTop from "../hooks/useScrollToTop";
import { Personality } from "../types/Personality";
import ArticleCard from "./ArticleCard";
import { BACKEND_URL } from "../api/config";
import TimelineContemporaries from "./TimelineContemporaries";

const PersonalityPage = () => {
  const { id } = useParams<{ id: string }>();
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useScrollToTop();

  useEffect(() => {
    if (!id) {
      setError("ID личности не указан");
      setLoading(false);
      return;
    }

    const fetchPersonality = async () => {
      try {
        const response = await fetch(`/api-nest/personalities/${id}`);
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        const data: Personality = await response.json();
        setPersonality(data);
      } catch (err) {
        console.error("Ошибка загрузки личности:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonality();
  }, [id]);

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error)
    return (
      <div className={styles.container}>
        <p className={styles.error}>Ошибка: {error}</p>
      </div>
    );
  if (!personality)
    return <div className={styles.container}>Личность не найдена</div>;

  return (
    <div className={styles.pageWrapper}>
      <BackZone to="/personalities" />

      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.mainContent}>
          {/* Фото личности */}
          <div className={styles.coverWrapper}>
            <img
              src={
                personality.imageUrl
                  ? `${BACKEND_URL}${personality.imageUrl}`
                  : `${BACKEND_URL}/uploads/default-person.jpg`
              }
              alt={personality.name}
              className={styles.cover}
            />
          </div>

          {/* Информация */}
          <div className={styles.info}>
            <h1 className={styles.title}>
              {personality.name} {personality.years && `(${personality.years})`}
            </h1>

            {personality.position && (
              <div className={styles.property}>
                <strong>Должность:</strong> {personality.position}
              </div>
            )}

            {/* Интересные факты */}
            <div className={styles.property}>
              <strong>Интересные факты:</strong>
              {personality.facts?.length ? (
                <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                  {personality.facts.map((fact, index) => (
                    <li key={index} style={{ marginBottom: "4px" }}>
                      {fact}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#777" }}>Нет данных</p>
              )}
            </div>

            {/* Биография */}
            {personality.biography && (
              <div className={styles.property}>
                <strong>Биография:</strong>
                <p className={styles.description} style={{ marginTop: "8px" }}>
                  {personality.biography}
                </p>
              </div>
            )}

            {/* Книги личности */}
            {personality.books && personality.books.length > 0 && (
              <div className={styles.similarSection}>
                <h2 className={styles.similarTitle}>Книги о личности</h2>
                <div className={styles.similarBooks}>
                  {personality.books.map((book) => (
                    <Link
                      to={`/books/${book.id}`}
                      key={book.id}
                      className={styles.similarBook}
                    >
                      <img
                        src={book.cover_url || "/uploads/default-book.jpg"}
                        alt={book.title}
                        className={styles.similarCover}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Статьи личности */}
            {personality.articles && personality.articles.length > 0 && (
              <div className={styles.property}>
                <strong>Статьи о личности:</strong>
                <div
                  className={styles.articlesGrid}
                  style={{ marginTop: "16px" }}
                >
                  {personality.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {personality.years && (
              <TimelineContemporaries
                personalityId={personality.id}
                currentYears={personality.years}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityPage;
