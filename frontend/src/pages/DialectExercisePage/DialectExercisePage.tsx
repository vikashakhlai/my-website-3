import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./DialectExercisePage.css";
import MediaPlayer from "../../components/MediaPlayer";
import AudioWithBackground from "../../components/AudioWithBackground";
import DialogueCompare from "../../components/DialogueCompare";
import BackZone from "../../components/BackZone";
import FavoriteButton from "../../components/FavoriteButton";
import { useFavorites } from "../../hooks/useFavorites"; // 🆕 хук избранного
import { useAuth } from "../../context/AuthContext"; // 🆕 для проверки авторизации
import { StarRating } from "../../components/StarRating";
import { CommentsSection } from "../../components/CommentsSection";

interface Media {
  id: number;
  title: string;
  name?: string;
  previewUrl?: string;
  mediaUrl: string;
  subtitlesLink?: string | null;
  dialectId: number | null;
  licenseType?: string;
  licenseAuthor?: string;
  type: "video" | "audio" | "text";
  tags?: string[];
  dialogueGroupId?: number | null;
  dialect?: { name: string };
  duration?: string;
  level?: string;
  speaker?: string;
  isFavorite?: boolean;
}

interface Dialogue {
  id: number;
  title: string;
  description?: string;
  medias: any[];
}

const DialectExercisePage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth(); // 🧾 для защиты действий
  const [media, setMedia] = useState<Media | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ❤️ избранное
  const { favorites, toggleFavorite } = useFavorites("media");
  const [localFavorite, setLocalFavorite] = useState(false);

  const dialectColors: Record<string, string> = {
    "Египетский арабский": "#6366F1",
    "Палестинский арабский": "#10B981",
    "Марокканский арабский": "#F59E0B",
    "Саудовский арабский": "#3B82F6",
    "Суданский арабский": "#8B5CF6",
  };

  // 🔹 Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data: mediaData } = await axios.get(`/api-nest/media/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setMedia(mediaData);

        if (mediaData.dialogueGroupId) {
          const { data: dialogues } = await axios.get(`/api-nest/dialogues`);
          const foundDialogue = dialogues.find(
            (d: Dialogue) => d.id === mediaData.dialogueGroupId
          );
          if (foundDialogue) setDialogue(foundDialogue);
        }
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🔹 Синхронизация избранного при изменении списка
  useEffect(() => {
    if (media?.id) {
      setLocalFavorite(favorites.some((f) => f.id === media.id));
    }
  }, [favorites, media?.id]);

  const mediaPlayer = useMemo(() => {
    if (!media) return null;
    return media.type === "audio" ? (
      <AudioWithBackground media={media} />
    ) : (
      <MediaPlayer media={media} />
    );
  }, [media?.id, media?.type]);

  // ❤️ Обработчик избранного
  const handleToggleFavorite = async () => {
    if (!media) return;
    if (!isAuthenticated) {
      alert("Только авторизованные пользователи могут добавлять в избранное");
      return;
    }

    const wasFavorite = favorites.some((f) => f.id === media.id);
    await toggleFavorite(media);
    setLocalFavorite(!wasFavorite);
  };

  if (loading) return <p className="loading">Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!media) return <p className="error">Медиа не найдено</p>;

  const dialectName = media?.dialect?.name || media.name || "Арабский";
  const dialectColor = dialectColors[dialectName] || "#6366F1";

  const levelLabel =
    media.level === "beginner"
      ? "Начинающий"
      : media.level === "intermediate"
      ? "Средний"
      : media.level === "advanced"
      ? "Продвинутый"
      : null;

  return (
    <div className="dialect-exercise">
      {mediaPlayer}

      {/* 🧾 Метаданные */}
      <div className="exercise-meta">
        <div className="meta-inline">
          <BackZone to="/dialects" />
          {media.licenseType === "original" && (
            <div className="exclusive">Эксклюзив Oasis</div>
          )}

          <span
            className="dialect-badge"
            style={{ backgroundColor: dialectColor }}
          >
            {dialectName}
          </span>

          <span className="meta-item">
            🎙 <strong>{media.speaker || "Партнёр проекта"}</strong>
          </span>

          {levelLabel && (
            <span
              className={`meta-item level ${media.level?.toLowerCase() || ""}`}
            >
              {levelLabel}
            </span>
          )}

          {/* ❤️ Кнопка избранного */}
          <FavoriteButton
            isFavorite={localFavorite}
            onToggle={handleToggleFavorite}
          />
        </div>
      </div>

      {/* 🗣️ Таблица диалогов */}
      {dialogue && <DialogueCompare dialogue={dialogue} />}
      {/* 💬 Комментарии и ⭐ Рейтинг */}
      <div className="feedback-section">
        <h2 className="feedback-title">Обратная связь</h2>

        {/* ⭐ Рейтинг */}
        <div className="rating-block">
          <h3>Оцените материал</h3>
          <div className="rating-wrapper">
            <StarRating targetType="media" targetId={media.id} />
          </div>
        </div>

        {/* 💬 Комментарии */}
        <div className="comments-block">
          <CommentsSection targetType="media" targetId={media.id} />
        </div>
      </div>
    </div>
  );
};

export default DialectExercisePage;
