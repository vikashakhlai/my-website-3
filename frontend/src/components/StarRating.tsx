import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { api } from "../api/auth";
import styles from "./StarRating.module.css";
import { useRequireAuth } from "../hooks/useRequireAuth";

interface StarRatingProps {
  targetType: "book" | "article" | "media" | "personality" | "textbook";
  targetId: number;
  average?: number | null;
  userRating?: number | null;
  onRated?: (value: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  targetType,
  targetId,
  average: initialAverage,
  userRating: initialUserRating,
  onRated,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [rating, setRating] = useState(initialUserRating ?? 0);
  const [average, setAverage] = useState(initialAverage ?? 0);
  const [votes, setVotes] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const requireAuth = useRequireAuth();

  // 🧩 Обновление состояния при изменении targetId или props
  useEffect(() => {
    setHovered(null);
    
    // Обновляем рейтинг пользователя
    // Если передан null, значит пользователь не оценил (rating = 0)
    // Если передан number, используем его
    // Если undefined, оставляем текущее значение (не перезаписываем)
    if (initialUserRating !== undefined) {
      setRating(initialUserRating ?? 0);
    }
    
    // Обновляем средний рейтинг
    if (initialAverage !== undefined && initialAverage !== null) {
      setAverage(initialAverage);
    } else if (initialAverage === null) {
      setAverage(0);
    }
  }, [targetId, initialAverage, initialUserRating]);

  // 🧩 Функция для обновления средней оценки
  const refreshAverage = async () => {
    try {
      const res = await api.get(`/ratings/${targetType}/${targetId}/average`);
      if (res.data?.average) setAverage(res.data.average);
      if (res.data?.votes) setVotes(res.data.votes);
    } catch (err) {
      console.warn("⚠️ Не удалось обновить средний рейтинг:", err);
    }
  };

  // 🧩 Отправка оценки
  const handleClick = async (value: number) => {
    if (loading) return;
    if (!requireAuth()) return;

    setLoading(true);

    try {
      setRating(value);
      await api.post(`/ratings`, {
        target_type: targetType,
        target_id: targetId,
        value,
      });

      onRated?.(value); // ✅ уведомляем родителя

      // ⏳ Обновим средний рейтинг
      setTimeout(refreshAverage, 300);
    } catch (err) {
      console.error("❌ Ошибка при отправке рейтинга:", err);
      alert("Чтобы поставить оценку, нужно войти в систему.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Live-обновление через SSE
  useEffect(() => {
    let isUnmounted = false;
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectSSE = () => {
      const apiBase =
        import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "/api-nest";

      const url = `${apiBase}/ratings/stream/${targetType}/${targetId}`;
      eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onopen = () => {
        console.info(`✅ Подключено к SSE для ${targetType} #${targetId}`);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!isUnmounted && data) {
            if (data.average !== undefined) setAverage(data.average);
            if (data.votes !== undefined) setVotes(data.votes);
          }
        } catch (e) {
          console.warn("⚠️ Ошибка при разборе SSE:", e);
        }
      };

      eventSource.onerror = () => {
        if (!isUnmounted) {
          console.warn(
            "⚠️ SSE-соединение потеряно, пробуем переподключиться..."
          );
          eventSource?.close();
          reconnectTimeout = setTimeout(connectSSE, 3000);
        }
      };
    };

    connectSSE();

    return () => {
      isUnmounted = true;
      eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      console.info(`🛑 SSE отключено для ${targetType} #${targetId}`);
    };
  }, [targetType, targetId]);

  return (
    <div className={styles.ratingContainer}>
      <div className={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.div
            key={value}
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(null)}
            className={`${styles.starWrapper} ${
              loading ? styles.disabled : ""
            }`}
          >
            <Star
              size={34}
              fill={
                value <= (hovered ?? rating)
                  ? "#FFD66B"
                  : "rgba(91, 103, 241, 0.1)"
              }
              stroke="#FFD66B"
              className={styles.starIcon}
            />
          </motion.div>
        ))}
      </div>

      <div className={styles.averageText}>
        Средний рейтинг:{" "}
        <span className={styles.averageValue}>
          {average ? average.toFixed(1) : "—"}
        </span>
        {votes > 0 && <span className={styles.votes}> ({votes} оценок)</span>}
      </div>
    </div>
  );
};
