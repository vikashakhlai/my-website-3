import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../utils/media";
import defaultAudio from "../assets/default-audio.png";
import defaultVideo from "../assets/default-video.png";
import { Captions, Mic, Clock, Handshake } from "lucide-react";
import styles from "./DialectCard.module.css";
import { Media, MediaLevel, MediaTopic } from "../types/media";

interface DialectCardProps {
  media: Media;
  activeTopics?: number[];
}

const DialectCard: React.FC<DialectCardProps> = ({
  media,
  activeTopics = [],
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const {
    id,
    title,
    previewUrl,
    type,
    dialect,
    licenseType,
    licenseAuthor,
    subtitlesLink,
    level,
    topics = [],
    duration,
    speaker,
    sourceRole,
  } = media;

  const previewSrc =
    type === "audio"
      ? defaultAudio
      : hasError
      ? defaultVideo
      : getMediaUrl(previewUrl || "");

  const levelLabel: Record<MediaLevel, string> = {
    beginner: "Начинающий",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  // 🎨 Цветовая тема по диалекту
  const dialectColors: Record<string, string> = {
    "Египетский арабский": "#6366F1",
    "Палестинский арабский": "#10B981",
    "Марокканский арабский": "#F59E0B",
    "Саудовский арабский": "#3B82F6",
    "Суданский арабский": "#8B5CF6",
    "Алжирский арабский": "#339438",
    "Ливанский арабский": "#ffa704",
    "Сирийский арабский": "#00d9ff",
  };

  const regionColor = dialectColors[dialect?.name || ""] || "#6B7280";
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

  if (!dialect) return null; // скрываем фусху

  return (
    <Link
      to={`/dialects/${dialect?.slug ?? ""}/media/${id}`}
      className={styles.card}
    >
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

        {dialect?.name && (
          <div
            className={styles.badge}
            style={{ backgroundColor: regionColor }}
          >
            {dialect.name}
          </div>
        )}
      </div>

      {/* === Контент === */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        {/* === Темы === */}
        {topics.length > 0 && (
          <div className={styles.topics}>
            {topics.map((t: MediaTopic) => (
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
          {type === "video" && subtitlesLink && (
            <span>
              <Captions size={14} /> Субтитры
            </span>
          )}
          {level && (
            <span
              className={styles.levelTag}
              style={{ backgroundColor: regionColor }}
            >
              {levelLabel[level]}
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
