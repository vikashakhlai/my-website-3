import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TextbookPage.css";
import { TextBookProps } from "../types/TextBook";
import BackZone from "./BackZone";
import useScrollToTop from "../hooks/useScrollToTop";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteButton from "../components/FavoriteButton";

const TextbookPage = () => {
  useScrollToTop();

  const { id } = useParams<{ id: string }>();
  const [textbook, setTextbook] = useState<TextBookProps | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Хук для избранного учебников
  const { favorites, toggleFavorite } = useFavorites("textbook");

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

  if (loading) return <div>Загрузка...</div>;
  if (!textbook) return <div>Учебник не найден</div>;

  // ✅ теперь безопасная проверка
  const isFavorite = favorites.some((f) => f.id === textbook.id);

  return (
    <div className="textbook-page">
      <BackZone to="/StudentBooksPage" />

      <div className="textbook-image">
        <img
          src={textbook.cover_image_url || "/default-cover.jpg"}
          alt={textbook.title}
          className="cover"
        />
      </div>

      <div className="textbook-details">
        <h1>{textbook.title}</h1>

        <p>
          <strong>Авторы:</strong> {textbook.authors || "—"}
        </p>
        <p>
          <strong>Год издания:</strong> {textbook.publication_year || "—"}
        </p>
        <p>
          <strong>Уровень:</strong> {textbook.level || "—"}
        </p>

        {textbook.description && (
          <p>
            <strong>Описание:</strong> {textbook.description}
          </p>
        )}

        {/* ❤️ Кнопка избранного */}
        <div className="favorite-btn-container">
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => toggleFavorite(textbook)}
          />
        </div>

        {/* 📄 Кнопка скачивания PDF */}
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
  );
};

export default TextbookPage;
