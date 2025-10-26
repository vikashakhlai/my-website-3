import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../utils/media";
import defaultAudio from "../assets/default-audio.png";
import defaultVideo from "../assets/default-video.png";
import { CheckCircle } from "lucide-react";
import styles from "./DialectCard.module.css"; // ✅ импортируем CSS-модуль

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
  isSingle?: boolean; // ← добавим флаг, если карточка одна
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
  isSingle = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const previewSrc =
    mediaType === "audio"
      ? defaultAudio
      : hasError
      ? defaultVideo
      : getMediaUrl(previewUrl || "");

  return (
    <Link
      to={`/dialects/${slug}/media/${id}`}
      className={`${styles.card} ${isSingle ? styles.single : ""}`}
    >
      {/* 🔹 Превью */}
      <div className={styles.previewWrapper}>
        {!isLoaded && (
          <div className={styles.spinnerWrapper}>
            <div className={styles.spinner}></div>
          </div>
        )}

        <img
          src={previewSrc}
          alt={title}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${styles.preview} ${isLoaded ? styles.visible : ""}`}
          loading="lazy"
        />

        {dialectName && (
          <div className={styles.badge}>{dialectName}</div>
        )}
      </div>

      {/* 🔹 Контент */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        {licenseType && (
          <p className={styles.license}>
            © {licenseAuthor || "Автор"} — {licenseType}
          </p>
        )}

        {mediaType === "video" && hasSubtitles && (
          <div className={styles.subtitles}>
            <CheckCircle className={styles.icon} />
            Субтитры есть
          </div>
        )}

        <p className={styles.fusha}>
          Включает литературный арабский (فصحى)
        </p>
      </div>
    </Link>
  );
};

export default DialectCard;
