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

import type { MediaWithRating } from "../../types/media";
import OtherDialectVersions from "../../components/OtherDialectVersions";
import useScrollToTop from "../../hooks/useScrollToTop";

interface Dialogue {
  id: number;
  title: string;
  description?: string;
  medias: MediaWithRating[];
}

const DIALECT_COLORS: Record<string, string> = {
  "Египетский арабский": "#6366F1",
  "Палестинский арабский": "#10B981",
  "Марокканский арабский": "#F59E0B",
  "Саудовский арабский": "#3B82F6",
  "Суданский арабский": "#8B5CF6",
  "Алжирский арабский": "#339438",
  "Ливанский арабский": "#ffa704",
  "Сирийский арабский": "#00d9ff",
};

export default function DialectExercisePage() {
  useScrollToTop();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [media, setMedia] = useState<MediaWithRating | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [fav, setFav] = useState(false);

  // SSE refs
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔒 redirect guests
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

  const dialectName = media?.dialect?.name || "Арабский";
  const dialectColor = DIALECT_COLORS[dialectName] || "#6366F1";

  const apiBase = useMemo(
    () =>
      (api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, "") : "") ||
      "/api/v1",
    []
  );

  // ===== 1) Load media + dialogue + favorites =====
  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const { data: mediaData } = await api.get<MediaWithRating>(
          `/media/${id}`,
          { signal }
        );
        setMedia(mediaData);

        if (mediaData.dialogueGroupId) {
          try {
            const { data: dialogueData } = await api.get<Dialogue>(
              `/dialogues/${mediaData.dialogueGroupId}`,
              { signal }
            );
            console.log('✅ Dialogue loaded:', dialogueData);
            setDialogue(dialogueData);
          } catch (dialogueError: any) {
            console.error('⚠️ Ошибка загрузки диалога:', dialogueError);
            // Не блокируем загрузку страницы, если диалог не загрузился
            setDialogue(null);
          }
        }

        // ✅ lowercase "media"
        const { data: favList } = await api.get(`/favorites/by-type/media`, {
          signal,
        });
        setFav(favList.some((f: any) => f.targetId === Number(id)));
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

  // ===== 2) SSE rating updates =====
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    if (esRef.current) esRef.current.close();
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let stopped = false;

    const connect = () => {
      if (stopped) return;

      const url = `${apiBase}/media/stream/${id}/rating?token=${token}`;
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
                  votes: payload.votes,
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

  // ===== 3) Favorite toggle =====
  const handleToggleFavorite = async () => {
    if (!media) return;
    try {
      if (fav) {
        await api.delete("/favorites", {
          data: { targetType: "media", targetId: media.id },
        });
        setFav(false);
      } else {
        await api.post("/favorites", {
          targetType: "media",
          targetId: media.id,
        });
        setFav(true);
      }
    } catch (e) {
      console.error("Ошибка избранного:", e);
    }
  };

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
      <BackZone to="/dialects" label="Вернуться к диалектам" />
      
      {mediaPlayer}

      {/* 🧾 Meta */}
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

          {media.speaker && (
            <span className="meta-item">
              🎙 <strong>{media.speaker}</strong>
            </span>
          )}

          {levelLabel && (
            <span className={`meta-item level ${media.level}`}>
              {levelLabel}
            </span>
          )}

          <FavoriteButton 
            isFavorite={fav} 
            onToggle={handleToggleFavorite}
            variant="elegant"
          />
        </div>
      </div>

      {dialogue && (
        <DialogueCompare dialogue={dialogue} selectedMediaId={media.id} />
      )}

      {dialogue?.medias?.length > 1 && (
        <OtherDialectVersions medias={dialogue.medias} currentId={media.id} />
      )}

      <div className="feedback-section">
        <h2 className="feedback-title">Обратная связь</h2>

        <div className="rating-block">
          <h3>Оцените материал</h3>
          <div className="rating-wrapper">
            {media?.id && (
              <StarRating
                targetType="media"
                targetId={media.id}
                average={media.averageRating ?? null}
                userRating={media.userRating ?? null}
                onRated={(val) =>
                  setMedia((prev) =>
                    prev ? { ...prev, userRating: val } : prev
                  )
                }
              />
            )}
          </div>
        </div>

        <div className="comments-block">
          {media?.id && (
            <CommentsSection targetType="media" targetId={media.id} />
          )}
        </div>
      </div>
    </div>
  );
}
