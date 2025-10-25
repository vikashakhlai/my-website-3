import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

interface Media {
  id: number;
  title: string;
  mediaUrl: string;
  subtitlesLink?: string | null;
  dialectId: number;
  licenseType?: string;
  licenseAuthor?: string;
}

const DialectExercisePage = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  // 🎬 Загружаем данные о медиа
  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) {
        setError("ID не указан");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🔍 Запрос: /api-nest/media/" + id);
        const response = await axios.get(`/api-nest/media/${id}`);
        console.log("✅ Ответ:", response.data);
        setMedia(response.data);
      } catch (err) {
        console.error("❌ Ошибка загрузки:", err);
        setError("Не удалось загрузить медиа");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id]);

  // ⚙️ Инициализация Video.js — только когда media и videoRef в DOM
  useEffect(() => {
    if (!media) return;

    const timer = setTimeout(() => {
      const videoEl = videoRef.current;
      if (!videoEl || !videoEl.isConnected) {
        console.warn("❌ videoRef всё ещё не в DOM — инициализация невозможна");
        return;
      }

      if (playerRef.current) {
        playerRef.current.dispose();
      }

      playerRef.current = videojs(videoEl, {
        controls: true,
        preload: "auto",
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [{ src: media.mediaUrl, type: "video/mp4" }],
      });

      if (media.subtitlesLink) {
        playerRef.current.addRemoteTextTrack(
          {
            kind: "subtitles",
            src: media.subtitlesLink,
            srclang: "ar",
            label: "Арабский (египетский)",
            default: true,
          },
          false
        );
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [media]);

  // 🌀 Состояния загрузки
  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!media) return <p className="text-center mt-10">Медиа не найдено</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">{media.title}</h2>

      {/* ✅ Видео элемент гарантированно в DOM */}
      <div data-vjs-player className="relative">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-city"
          controls
        />
      </div>

      <div className="mt-4 text-gray-600 text-sm">
        <p>Диалект ID: {media.dialectId}</p>
        {slug && (
          <p>
            🌍 Диалект: <strong>{slug}</strong>
          </p>
        )}
        {media.licenseType === "cc-by" && (
          <p>
            🔗 Видео предоставлено по лицензии CC-BY, автор:{" "}
            <strong>{media.licenseAuthor}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default DialectExercisePage;
