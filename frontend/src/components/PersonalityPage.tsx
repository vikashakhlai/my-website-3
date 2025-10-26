import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackZone from "../components/BackZone";
import styles from "./BookPage/BookPage.module.css";
import useScrollToTop from "../hooks/useScrollToTop";
import { Personality } from "../pages/types/Personality";
import ArticleCard from "./ArticleCard";
import { BACKEND_URL } from "../api/config";
import TimelineContemporaries from "./TimelineContemporaries";
import { Quote } from "./QuotesBlock";
import FavoriteButton from "../components/FavoriteButton";
import { useFavorites } from "../hooks/useFavorites";

const PersonalityPage = () => {
  const { id } = useParams<{ id: string }>();
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { favorites, toggleFavorite } = useFavorites("personality");

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
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
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

  // 📜 Цитаты
  useEffect(() => {
    if (!id) return;
    const fetchQuotes = async () => {
      try {
        const res = await fetch(`/api-nest/quotes/by-personality/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setQuotes(data);
      } catch (err) {
        console.error("Ошибка загрузки цитат:", err);
      }
    };
    fetchQuotes();
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

  // 💡 Проверяем избранное
  const isFavorite = favorites.some((f) => f.id === personality.id);

  return (
    <div className={styles.pageWrapper}>
      <BackZone to="/personalities" />

      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.mainContent}>
          {/* 📸 Фото личности с кнопкой избранного */}
          <div className={styles.coverWrapper}>
            <img
              src={
                personality.imageUrl
                  ? `${BACKEND_URL}${personality.imageUrl}`
                  : `${BACKEND_URL}/uploads/personalities_photoes/default.webp`
              }
              alt={personality.name}
              className={styles.cover}
            />
            <div className={styles.favoriteButtonWrapper}>
              <FavoriteButton
                isFavorite={isFavorite}
                onToggle={() => toggleFavorite(personality)}
              />
            </div>
          </div>

          {/* ℹ️ Информация */}
          <div className={styles.info}>
            <h1 className={styles.title}>
              {personality.name} {personality.years && `(${personality.years})`}
            </h1>

            {personality.position && (
              <div className={styles.property}>
                <strong>Должность:</strong> {personality.position}
              </div>
            )}

            {/* 📚 Интересные факты */}
            <div className={styles.property}>
              <strong>Интересные факты:</strong>
              {personality.facts?.length ? (
                <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                  {personality.facts.map((fact, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>
                      {fact}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#777" }}>Нет данных</p>
              )}
            </div>

            {/* 🧾 Биография */}
            {personality.biography && (
              <div className={styles.property}>
                <strong>Биография:</strong>
                <p className={styles.description} style={{ marginTop: "8px" }}>
                  {personality.biography}
                </p>
              </div>
            )}

            {/* 💬 Цитаты */}
            {quotes.length > 0 && (
              <div className={styles.property}>
                <h2 className={styles.similarTitle}>Цитаты</h2>
                <div className={styles.quotesBlock}>
                  {quotes.map((q) => (
                    <div key={q.id} className={styles.quoteCard}>
                      <p dir="rtl" className={styles.quoteAr}>
                        {q.text_ar}
                      </p>
                      <p className={styles.quoteRu}>{q.text_ru}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📚 Книги личности */}
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

            {/* 📰 Статьи */}
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
