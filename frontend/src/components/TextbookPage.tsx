import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BackZone from "./BackZone";
import useScrollToTop from "../hooks/useScrollToTop";
import "./TextbookPage.css";
import FavoriteButton from "./FavoriteButton";
import { useFavorites } from "../hooks/useFavorites";
import { StarRating } from "./StarRating";
import { CommentsSection } from "./CommentsSection";

export interface Textbook {
  id: number;
  title: string;
  authors?: string | null;
  description?: string | null;
  publication_year?: number | null;
  cover_image_url?: string | null;
  level?: string | null;
  pdf_url?: string | null;
  averageRating?: number | null;
  ratingCount?: number;
  userRating?: number | null;
  isFavorite?: boolean;
}

const TextbookPage = () => {
  const { id } = useParams<{ id: string }>();
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites("textbook");
  const [localFavorite, setLocalFavorite] = useState(false);

  useScrollToTop();

  /** 📘 Получаем учебник */
  const fetchTextbook = useCallback(async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api-nest/textbooks/${id}?t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();

      setTextbook({
        ...data,
        averageRating: data.averageRating ? Number(data.averageRating) : null,
        ratingCount: data.ratingCount ? Number(data.ratingCount) : 0,
        userRating: data.userRating ? Number(data.userRating) : null,
      });
    } catch (err) {
      console.error("Ошибка загрузки учебника:", err);
      setError("Не удалось загрузить данные учебника");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTextbook();
  }, [fetchTextbook]);

  /** ❤️ Избранное */
  useEffect(() => {
    if (textbook?.id) {
      setLocalFavorite(favorites.some((f) => f.id === textbook.id));
    }
  }, [favorites, textbook?.id]);

  const handleToggleFavorite = async () => {
    if (!textbook) return;
    const wasFavorite = favorites.some((f) => f.id === textbook.id);
    await toggleFavorite(textbook);
    setLocalFavorite(!wasFavorite);
  };

  /** 🔄 SSE: автообновление среднего рейтинга */
  useEffect(() => {
    if (!id) return;
    const eventSource = new EventSource(
      `/api-nest/textbooks/stream/textbook/${id}`
    );

    eventSource.onmessage = (event) => {
      const { average, votes } = JSON.parse(event.data);
      setTextbook((prev) =>
        prev
          ? {
              ...prev,
              averageRating:
                average !== null && average !== undefined
                  ? Number(average)
                  : null,
              ratingCount: votes ? Number(votes) : 0,
            }
          : prev
      );
    };

    return () => eventSource.close();
  }, [id]);

  if (loading) return <div className="textbook-page">Загрузка...</div>;
  if (error) return <div className="textbook-page">Ошибка: {error}</div>;
  if (!textbook) return <div className="textbook-page">Учебник не найден</div>;

  return (
    <div className="textbook-page">
      {/* 🔙 Кнопка назад */}
      <div className="back-fixed">
        <BackZone to="/StudentBooksPage" />
      </div>

      {/* Основной контент */}
      <div className="textbook-header">
        <div className="textbook-image">
          <img
            src={textbook.cover_image_url || "/default-cover.jpg"}
            alt={textbook.title}
          />
        </div>

        <div className="textbook-details">
          <div className="title-row">
            <h1>{textbook.title}</h1>
            <FavoriteButton
              isFavorite={localFavorite}
              onToggle={handleToggleFavorite}
            />
          </div>

          <div className="book-meta">
            <p>
              <strong>Авторы:</strong> {textbook.authors || "—"}
            </p>
            <p>
              <strong>Год издания:</strong> {textbook.publication_year || "—"}
            </p>
            <p>
              <strong>Уровень:</strong> {textbook.level || "—"}
            </p>
          </div>

          {textbook.description && (
            <p className="description">{textbook.description}</p>
          )}

          {/* ⭐ Рейтинг */}
          <div className="rating-section">
            <StarRating
              targetType="textbook"
              targetId={textbook.id}
              average={textbook.averageRating ?? null}
              userRating={textbook.userRating ?? null}
              onRated={(val) =>
                setTextbook((prev) =>
                  prev ? { ...prev, userRating: val } : prev
                )
              }
            />
          </div>

          {/* 📘 Кнопка скачивания PDF */}
          {textbook.pdf_url ? (
            <a
              href={`/uploads/textbooks-pdfs/${textbook.pdf_url}`}
              download
              className="download-btn"
            >
              📘 Скачать PDF
            </a>
          ) : (
            <p className="no-pdf">PDF не доступен</p>
          )}
        </div>
      </div>

      {/* 💬 Комментарии */}
      <div className="comments-wrapper">
        <CommentsSection
          targetType="textbook"
          targetId={textbook.id}
          apiBase="/api-nest"
        />
      </div>
    </div>
  );
};

export default TextbookPage;
