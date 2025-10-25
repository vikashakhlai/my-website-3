import React from "react";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../utils/media";

interface DialectCardProps {
  id: number;
  slug: string;
  title: string;
  mediaUrl?: string;
  mediaType?: "video" | "audio";
  dialectName?: string;
}

const DialectCard: React.FC<DialectCardProps> = ({
  id,
  slug,
  title,
  mediaUrl,
  mediaType = "video",
  dialectName,
}) => {
  const preview =
    mediaType === "audio"
      ? "/images/default-audio.jpg"
      : getMediaUrl(mediaUrl || "/images/default-video.jpg");

  return (
    <Link
      to={`/dialects/${slug}/media/${id}`}
      className="block bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Превью видео / аудио */}
      <div className="relative w-full h-52 overflow-hidden">
        <img
          src={preview}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* Диалект поверх картинки */}
        {dialectName && (
          <div
            className="absolute bottom-2 left-2 px-3 py-1 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: "#686cdf" }}
          >
            {dialectName}
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          Узнай больше о диалекте {dialectName || "арабского языка"} и
          потренируй понимание речи.
        </p>
      </div>
    </Link>
  );
};

export default DialectCard;
