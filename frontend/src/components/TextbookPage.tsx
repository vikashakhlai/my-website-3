import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TextbookPage.css";
import { TextBookProps } from "../pages/types/TextBook";
import BackZone from "./BackZone";
import useScrollToTop from "../hooks/useScrollToTop";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteButton from "../components/FavoriteButton";

const TextbookPage = () => {
  useScrollToTop();

  const { id } = useParams<{ id: string }>();
  const [textbook, setTextbook] = useState<TextBookProps | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Подключаем избранное для учебников
  const { favorites, toggleFavorite } = useFavorites("textbook");

  // 🔹 Локальное состояние для мгновенного обновления кнопки
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

  // 🔹 Обновляем локальное состояние при изменении списка избранного
  useEffect(() => {
    if (textbook) {
      setLocalFavorite(favorites.some((f) => f.id === textbook.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites, textbook?.id]);

  // 🔹 Обработчик клика
  const handleToggleFavorite = async () => {
    if (!textbook) return;

    const wasFavorite = favorites.some((f) => f.id === textbook.id);
    await toggleFavorite(textbook);
    setLocalFavorite(!wasFavorite);
  };

  if (loading) return <div>Загрузка...</div>;
  if (!textbook) return <div>Учебник не найден</div>;

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
            isFavorite={localFavorite}
            onToggle={handleToggleFavorite}
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
