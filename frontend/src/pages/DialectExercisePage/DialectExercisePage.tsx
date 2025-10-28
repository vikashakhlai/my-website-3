import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./DialectExercisePage.css";
import MediaPlayer from "../../components/MediaPlayer";
import AudioWithBackground from "../../components/AudioWithBackground";
import DialogueCompare from "../../components/DialogueCompare";

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
}

interface Dialogue {
  id: number;
  title: string;
  description?: string;
  medias: any[];
}

const DialectExercisePage = () => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dialectColors: Record<string, string> = {
    "Египетский арабский": "#6366F1",
    "Палестинский арабский": "#10B981",
    "Марокканский арабский": "#F59E0B",
    "Саудовский арабский": "#3B82F6",
    "Суданский арабский": "#8B5CF6",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: mediaData } = await axios.get(`/api-nest/media/${id}`);
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
      {media.type === "audio" ? (
        <AudioWithBackground key={media.id} media={media} />
      ) : (
        <MediaPlayer key={media.id} media={media} />
      )}

      {/* 🧾 Метаданные */}
      <div className="exercise-meta">
        <div className="meta-inline">
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
        </div>
      </div>

      {/* 🗣️ Таблица диалогов */}
      {dialogue && <DialogueCompare dialogue={dialogue} />}
    </div>
  );
};

export default DialectExercisePage;
