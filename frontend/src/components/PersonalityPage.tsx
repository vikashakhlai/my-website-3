import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackZone from "../components/BackZone";
import styles from "./PersonalityPage.module.css";
import useScrollToTop from "../hooks/useScrollToTop";
import { Personality } from "../types/Personality";
import ArticleCard from "./ArticleCard";
import { BACKEND_URL } from "../api/config";
import TimelineContemporaries from "./TimelineContemporaries";
import { Quote } from "./QuotesBlock";
import FavoriteButton from "../components/FavoriteButton";
import { useFavorites } from "../hooks/useFavorites";
import { CommentsSection } from "./CommentsSection";
import { StarRating } from "./StarRating";

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
        setPersonality({
          ...data,
          averageRating: data.averageRating ? Number(data.averageRating) : null,
          ratingCount: data.ratingCount ? Number(data.ratingCount) : 0,
          userRating: data.userRating ? Number(data.userRating) : null,
        });
      } catch (err) {
        console.error("Ошибка загрузки личности:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonality();
  }, [id]);

  // 🔄 SSE — live обновление рейтинга
  useEffect(() => {
    if (!id) return;
    const eventSource = new EventSource(
      `/api-nest/personalities/stream/${id}/rating`
    );

    eventSource.onmessage = (event) => {
      const { average, votes } = JSON.parse(event.data);
      setPersonality((prev) =>
        prev
          ? {
              ...prev,
              averageRating: average != null ? Number(average) : null,
              ratingCount: votes ? Number(votes) : 0,
            }
          : prev
      );
    };

    return () => eventSource.close();
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

  const isFavorite = favorites.some((f) => f.id === personality.id);

  return (
    <div className={styles.pageWrapper}>
      <BackZone to="/personalities" label="Вернуться к списку личностей" />

      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* 📸 Фото + избранное */}
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
              {personality.name}{" "}
              {personality.years && (
                <span className={styles.years}>({personality.years})</span>
              )}
            </h1>

            {personality.position && (
              <p className={styles.meta}>
                <strong>Должность:</strong> {personality.position}
              </p>
            )}

            {personality.facts?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Интересные факты</h2>
                <ul className={styles.factsList}>
                  {personality.facts.map((fact, i) => (
                    <li key={i}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}

            {personality.biography && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Биография</h2>
                <p className={styles.biography}>{personality.biography}</p>
              </div>
            )}

            {quotes.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Цитаты</h2>
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

            {personality.books?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Книги о личности</h2>
                <div className={styles.booksGrid}>
                  {personality.books.map((book) => (
                    <Link to={`/books/${book.id}`} key={book.id}>
                      <img
                        src={book.cover_url || "/uploads/default-book.jpg"}
                        alt={book.title}
                        className={styles.bookCover}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {personality.articles?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Статьи</h2>
                <div className={styles.articlesGrid}>
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

        <div className={styles.ratingSection}>
          <StarRating
            targetType="personality"
            targetId={personality.id}
            average={personality.averageRating ?? null}
            userRating={personality.userRating ?? null}
            onRated={(val) =>
              setPersonality((prev) =>
                prev ? { ...prev, userRating: val } : prev
              )
            }
          />
        </div>

        {/* 💬 Комментарии */}
        <div className={styles.commentsWrapper}>
          <CommentsSection
            targetType="personality"
            targetId={personality.id}
            apiBase="/api-nest"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalityPage;
