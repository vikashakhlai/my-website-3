// src/pages/DialectExercisePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./DialectExercisePage.css";
import MediaPlayer from "../../components/MediaPlayer";
import AudioWithBackground from "../../components/AudioWithBackground";
import DialogueCompare from "../../components/DialogueCompare";
import BackZone from "../../components/BackZone";
import FavoriteButton from "../../components/FavoriteButton";
import { useAuth } from "../../context/AuthContext";
import { StarRating } from "../../components/StarRating";
import { CommentsSection } from "../../components/CommentsSection";
import { api } from "../../api/auth";

import type { Media } from "../../types/media"; // ✅ импорт АДЕКВАТНОГО media-типа

interface Dialogue {
  id: number;
  title: string;
  description?: string;
  medias: any[];
}

const DIALECT_COLORS: Record<string, string> = {
  "Египетский арабский": "#6366F1",
  "Палестинский арабский": "#10B981",
  "Марокканский арабский": "#F59E0B",
  "Саудовский арабский": "#3B82F6",
  "Суданский арабский": "#8B5CF6",
};

export default function DialectExercisePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [media, setMedia] = useState<Media | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [fav, setFav] = useState(false);

  // SSE refs
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔒 блокировка страницы для гостей (твой запрос)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/dialects/" + id);
    }
  }, [isAuthenticated, navigate, id]);

  const levelLabel =
    media?.level === "beginner"
      ? "Начинающий"
      : media?.level === "intermediate"
      ? "Средний"
      : media?.level === "advanced"
      ? "Продвинутый"
      : null;

  const dialectName = media?.dialect?.name || media?.name || "Арабский";
  const dialectColor = DIALECT_COLORS[dialectName] || "#6366F1";

  const apiBase = useMemo(
    () =>
      (api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, "") : "") ||
      "/api/v1",
    []
  );

  // ===== 1) Загрузка media + диалога + избранного =====
  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const { data: mediaData } = await api.get<Media>(`/media/${id}`, {
          signal,
        });
        setMedia(mediaData);

        if (mediaData.dialogueGroupId) {
          const { data: dialogues } = await api.get<Dialogue[]>(`/dialogues`, {
            signal,
          });
          setDialogue(
            dialogues.find((d) => d.id === mediaData.dialogueGroupId) || null
          );
        }

        const { data: favList } = await api.get<any[]>(`/favorites/media`, {
          signal,
        });
        setFav(favList.some((f) => f.id === Number(id)));
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
          console.error("Ошибка загрузки медиа:", e);
          setErr("Не удалось загрузить данные");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id, isAuthenticated]);

  // ===== 2) SSE =====
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    if (esRef.current) esRef.current.close();
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    let stopped = false;

    const connect = () => {
      if (stopped) return;

      const url = `${apiBase}/ratings/stream/media/${id}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          setMedia((prev) =>
            prev
              ? {
                  ...prev,
                  averageRating: payload.average,
                  ratingCount: payload.votes,
                }
              : prev
          );
        } catch (e) {
          console.warn("SSE parse error:", e);
        }
      };

      es.onerror = () => {
        es.close();
        reconnectTimerRef.current = setTimeout(connect, 2000);
      };
    };

    connect();
    return () => {
      stopped = true;
      esRef.current?.close();
      reconnectTimerRef.current && clearTimeout(reconnectTimerRef.current);
    };
  }, [id, apiBase, isAuthenticated]);

  // ===== 3) Избранное =====
  const handleToggleFavorite = async () => {
    if (!media) return;
    try {
      if (fav) {
        await api.delete(`/favorites/media/${media.id}`);
        setFav(false);
      } else {
        await api.post(`/favorites/media/${media.id}`);
        setFav(true);
      }
    } catch (e) {
      console.error("Ошибка избранного:", e);
    }
  };

  // ===== 4) Плеер =====
  const mediaPlayer = useMemo(() => {
    if (!media) return null;
    return media.type === "audio" ? (
      <AudioWithBackground media={media} />
    ) : (
      <MediaPlayer media={media} />
    );
  }, [media]);

  if (loading) return <p className="loading">Загрузка...</p>;
  if (err) return <p className="error">{err}</p>;
  if (!media) return <p className="error">Медиа не найдено</p>;

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

          {/* ❤️ Избранное */}
          <FavoriteButton isFavorite={fav} onToggle={handleToggleFavorite} />
        </div>
      </div>

      {/* 🗣️ Диалог */}
      {dialogue && <DialogueCompare dialogue={dialogue} />}

      {/* 💬 Комментарии и ⭐ Рейтинг */}
      <div className="feedback-section">
        <h2 className="feedback-title">Обратная связь</h2>

        {/* ⭐ Рейтинг */}
        <div className="rating-block">
          <h3>Оцените материал</h3>
          <div className="rating-wrapper">
            <StarRating
              targetType="media"
              targetId={media.id}
              average={media.averageRating ?? null}
              userRating={media.userRating ?? null}
              onRated={(val) =>
                setMedia((prev) => (prev ? { ...prev, userRating: val } : prev))
              }
            />
          </div>
        </div>

        {/* 💬 Комментарии */}
        <div className="comments-block">
          <CommentsSection targetType="media" targetId={media.id} />
        </div>
      </div>
    </div>
  );
}
