import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BackZone from "./BackZone";
import useScrollToTop from "../hooks/useScrollToTop";
import "./TextbookPage.css";
import FavoriteButton from "./FavoriteButton";
import { useFavorites } from "../hooks/useFavorites";
import { StarRating } from "./StarRating";
import { CommentsSection } from "./CommentsSection";
import { api } from "../api/auth";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useAuth } from "../context/AuthContext";

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
  canDownload?: boolean;
}

const TextbookPage = () => {
  const { id } = useParams<{ id: string }>();
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites("textbook");
  const [localFavorite, setLocalFavorite] = useState(false);
  const requireAuth = useRequireAuth();
  const { isAuthenticated } = useAuth();

  useScrollToTop();

  /** 📘 Получаем учебник */
  const fetchTextbook = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/textbooks/${id}?t=${Date.now()}`);

      setTextbook({
        ...data,
        canDownload: data.canDownload ?? false,
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
    if (!requireAuth()) return;

    const wasFavorite = favorites.some((f) => f.id === textbook.id);
    await toggleFavorite(textbook);
    setLocalFavorite(!wasFavorite);
  };

  /** 🔄 SSE: автообновление среднего рейтинга */
  useEffect(() => {
    if (!id) return;
    const eventSource = new EventSource(
      `/api-nest/textbooks/stream/${id}/rating`,
      { withCredentials: true }
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
      <BackZone to="/StudentBooksPage" label="Вернуться к списку учебников" />

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
            <button
              className={`download-btn${
                textbook.canDownload ? "" : " locked"
              }`}
              onClick={async () => {
                if (!requireAuth()) return;

                if (!textbook.canDownload) {
                  alert("У вас нет доступа к загрузке этого файла.");
                  return;
                }

                try {
                  const { data } = await api.get(
                    `/textbooks/${textbook.id}/download`
                  );
                  if (data?.url) {
                    window.location.href = data.url;
                  }
                } catch (e) {
                  alert("Ошибка: не удалось скачать файл");
                  console.error(e);
                }
              }}
            >
              {textbook.canDownload
                ? "📘 Скачать PDF"
                : isAuthenticated
                ? "🔒 Недоступно"
                : "🔒 Войти, чтобы скачать"}
            </button>
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
