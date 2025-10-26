import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "./DialectExercisePage.css";

interface Media {
  id: number;
  title: string;
  name?: string;
  previewUrl?: string;
  mediaUrl: string;
  subtitlesLink?: string | null;
  dialectId: number;
  licenseType?: string;
  licenseAuthor?: string;
}

const DialectExercisePage = () => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  // 🎬 Загрузка данных
  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) {
        setError("ID не указан");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`/api-nest/media/${id}`);
        setMedia(response.data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        setError("Не удалось загрузить медиа");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [id]);

  // ⚙️ Инициализация Video.js
  useLayoutEffect(() => {
    if (!media) return;

    // Если плеер уже инициализирован — удаляем
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const el = videoRef.current;
    if (!el) return;

    // 🕒 Ждём пока элемент реально в DOM (даже после анимаций React Router)
    const timer = setTimeout(() => {
      const player = videojs(el, {
        controls: true,
        preload: "auto",
        fluid: false, // ❌ отключаем резиновый режим
        responsive: false,
        width: 480,
        height: 270,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [{ src: media.mediaUrl, type: "video/mp4" }],
        controlBar: { subsCapsButton: true },
        textTrackSettings: false,
        poster: media.previewUrl || "", // ✅ вот так правильно
      });

      // ✅ Добавляем дорожку субтитров, если есть
      player.ready(() => {
        if (media.subtitlesLink) {
          player.addRemoteTextTrack(
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
      });

      playerRef.current = player;
    }, 200); // ⏱️ небольшая задержка гарантирует, что React уже вставил video

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [media]);

  // 🌀 Состояния
  if (loading) return <p className="loading">Загрузка...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!media) return <p className="loading">Медиа не найдено</p>;

  return (
    <div className="dialect-exercise">
      {/* 🎥 Видео */}
      <div className="video-wrapper" data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-city"
          controls
        />
      </div>

      {/* 📄 Заголовок и информация */}
      <div className="video-info">
        <h2 className="video-title">{media.title}</h2>

        {media.name && <span className="dialect-tag">{media.name}</span>}

        {media.licenseType === "cc-by" && (
          <p className="license">
            🔗 Видео предоставлено по лицензии CC-BY, автор:{" "}
            <strong>{media.licenseAuthor}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default DialectExercisePage;
