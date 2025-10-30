import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TextbookPage.css";
import { TextBookProps } from "../types/TextBook";
import BackZone from "./BackZone";
import useScrollToTop from "../hooks/useScrollToTop";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteButton from "../components/FavoriteButton";
import { StarRating } from "../components/StarRating";
import { CommentsSection } from "../components/CommentsSection";

const TextbookPage = () => {
  useScrollToTop();

  const { id } = useParams<{ id: string }>();
  const [textbook, setTextbook] = useState<TextBookProps | null>(null);
  const [loading, setLoading] = useState(true);

  const { favorites, toggleFavorite } = useFavorites("textbook");
  const [localFavorite, setLocalFavorite] = useState(false);

  useEffect(() => {
    const fetchTextbook = async () => {
      try {
        const response = await fetch(`/api-nest/textbooks/${id}`);
        if (!response.ok) throw new Error("Не удалось загрузить учебник");
        const data = await response.json();
        setTextbook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTextbook();
  }, [id]);

  useEffect(() => {
    if (textbook) {
      setLocalFavorite(favorites.some((f) => f.id === textbook.id));
    }
  }, [favorites, textbook?.id]);

  const handleToggleFavorite = async () => {
    if (!textbook) return;
    const wasFavorite = favorites.some((f) => f.id === textbook.id);
    await toggleFavorite(textbook);
    setLocalFavorite(!wasFavorite);
  };

  if (loading) return <div className="loader">Загрузка...</div>;
  if (!textbook) return <div>Учебник не найден</div>;

  return (
    <div className="textbook-page">
      {/* 🔙 Фиксированная стрелка */}
      <div className="back-fixed">
        <BackZone to="/StudentBooksPage" />
      </div>

      <div className="textbook-header">
        <div className="textbook-image">
          <img
            src={textbook.cover_image_url || "/default-cover.jpg"}
            alt={textbook.title}
            className="cover"
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
