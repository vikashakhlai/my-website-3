import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../utils/media";
import defaultAudio from "../assets/default-audio.png";
import defaultVideo from "../assets/default-video.png";
import { Captions, Mic, Clock, Handshake } from "lucide-react";
import styles from "./DialectCard.module.css";

interface Topic {
  id: number;
  name: string;
}

interface DialectCardProps {
  id: number;
  slug: string;
  title: string;
  previewUrl?: string;
  mediaType?: "video" | "audio";
  dialectName?: string;
  licenseType?: string;
  licenseAuthor?: string;
  hasSubtitles?: boolean;
  level?: "beginner" | "intermediate" | "advanced";
  topics?: Topic[];
  region?: string;
  duration?: string;
  speaker?: string;
  sourceRole?: string;
  activeTopics?: number[];
}

const DialectCard: React.FC<DialectCardProps> = ({
  id,
  slug,
  title,
  previewUrl,
  mediaType = "video",
  dialectName,
  licenseType,
  licenseAuthor,
  hasSubtitles,
  level,
  topics = [],
  duration,
  speaker,
  sourceRole,
  activeTopics = [],
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const previewSrc =
    mediaType === "audio"
      ? defaultAudio
      : hasError
      ? defaultVideo
      : getMediaUrl(previewUrl || "");

  const levelLabel =
    level === "beginner"
      ? "Начинающий"
      : level === "intermediate"
      ? "Средний"
      : level === "advanced"
      ? "Продвинутый"
      : null;

  // 🎨 Цветовая тема по диалекту
  const dialectColors: Record<string, string> = {
    "Египетский арабский": "#6366F1",
    "Палестинский арабский": "#10B981",
    "Марокканский арабский": "#F59E0B",
    "Саудовский арабский": "#3B82F6",
    "Суданский арабский": "#8B5CF6",
    "Алжирский арабский": "#339438ff",
    "Ливанский арабский": "#ffa704ff",
    "Сирийский арабский": "#00d9ffff",
  };

  const regionColor = dialectColors[dialectName || ""] || "#6B7280";
  const isExclusive = licenseType?.toLowerCase() === "original";

  const renderSource = () => {
    if (isExclusive) {
      return <p className={styles.exclusive}>🔥 Эксклюзив Oasis</p>;
    }
    if (licenseAuthor) {
      return (
        <p className={styles.source}>
          🎥 Видео предоставлено: <strong>{licenseAuthor}</strong>
        </p>
      );
    }
    return null;
  };

  return (
    <Link to={`/dialects/${slug}/media/${id}`} className={styles.card}>
      <div className={styles.previewWrapper}>
        {!isLoaded && <div className={styles.skeleton}></div>}

        <img
          src={previewSrc}
          alt={title}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${styles.preview} ${isLoaded ? styles.visible : ""}`}
          loading="lazy"
        />

        {dialectName && (
          <div
            className={styles.badge}
            style={{ backgroundColor: regionColor }}
          >
            {dialectName}
          </div>
        )}
      </div>

      {/* === Контент === */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        {/* === Темы === */}
        {topics.length > 0 && (
          <div className={styles.topics}>
            {topics.map((t) => (
              <span
                key={t.id}
                className={`${styles.topic} ${
                  activeTopics.includes(t.id) ? styles.topicActive : ""
                }`}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        {renderSource()}

        {/* === Партнёр проекта === */}
        {sourceRole && (
          <p className={styles.partner}>
            <Handshake size={14} /> {sourceRole}
          </p>
        )}

        {/* === Информация === */}
        <div className={styles.metaInfo}>
          {speaker && (
            <span>
              <Mic size={14} /> {speaker}
            </span>
          )}
          {duration && (
            <span>
              <Clock size={14} /> {duration}
            </span>
          )}
          {mediaType === "video" && hasSubtitles && (
            <span>
              <Captions size={14} /> Субтитры
            </span>
          )}
          {levelLabel && (
            <span
              className={styles.levelTag}
              style={{ backgroundColor: regionColor }}
            >
              {levelLabel}
            </span>

          )}
        </div>

        <p className={styles.fusha}>
          🗣 Есть полная версия на литературном арабском (فصحى)
        </p>
      </div>
    </Link>
  );
};

export default DialectCard;
