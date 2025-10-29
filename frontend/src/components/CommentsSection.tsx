import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Trash2, MessageSquare } from "lucide-react";
import { api } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./CommentsSection.module.css";

interface Comment {
  id: number;
  user: { id: string; email: string };
  content: string;
  created_at: string;
  parent_id?: number | null;
  replies: Comment[];
  likes_count: number;
  dislikes_count: number;
  my_reaction?: 1 | -1 | 0;
}

interface CommentsSectionProps {
  targetType: "book" | "article" | "media" | "personality" | "textbook";
  targetId: number;
}

// 🧩 Хелпер: строим дерево из плоского списка
const buildTree = (flat: Comment[]): Comment[] => {
  const map = new Map<number, Comment & { replies: Comment[] }>();
  const roots: Comment[] = [];

  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }));

  flat.forEach((c) => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(map.get(c.id)!);
    } else {
      roots.push(map.get(c.id)!);
    }
  });

  return roots;
};

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  targetType,
  targetId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [visibleReplies, setVisibleReplies] = useState<Record<number, number>>(
    {}
  );

  const { user } = useAuth();

  // === Загрузка комментариев ===
  const loadComments = useCallback(async () => {
    try {
      const res = await api.get(`/comments/${targetType}/${targetId}`);
      setComments(buildTree(res.data));
    } catch (err) {
      console.error("❌ Ошибка загрузки комментариев:", err);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // === Отправка комментария ===
  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await api.post("/comments", {
        target_type: targetType,
        target_id: targetId,
        content,
        parent_id: replyTo?.id ?? null,
      });
      setContent("");
      setReplyTo(null);
      await loadComments();
    } catch (err) {
      console.error("❌ Ошибка при отправке комментария:", err);
      alert("Необходимо войти, чтобы оставить комментарий.");
    } finally {
      setLoading(false);
    }
  };

  // === Рекурсивное обновление реакции ===
  const updateReaction = (
    list: Comment[],
    id: number,
    updater: (c: Comment) => Comment
  ): Comment[] =>
    list.map((c) =>
      c.id === id
        ? updater(c)
        : { ...c, replies: updateReaction(c.replies || [], id, updater) }
    );

  // === Реакции ===
  const handleReact = async (id: number, value: 1 | -1) => {
    try {
      setComments((prev) =>
        updateReaction(prev, id, (c) => {
          const newReaction = c.my_reaction === value ? 0 : value;
          const deltaLike =
            value === 1
              ? c.my_reaction === 1
                ? -1
                : c.my_reaction === -1
                ? 1
                : 1
              : c.my_reaction === 1
              ? -1
              : 0;
          const deltaDislike =
            value === -1
              ? c.my_reaction === -1
                ? -1
                : c.my_reaction === 1
                ? 1
                : 1
              : c.my_reaction === -1
              ? -1
              : 0;
          return {
            ...c,
            my_reaction: newReaction,
            likes_count: c.likes_count + deltaLike,
            dislikes_count: c.dislikes_count + deltaDislike,
          };
        })
      );

      await api.post(`/comments/${id}/react`, { value });
    } catch (err) {
      console.error("Ошибка при реакции:", err);
      await loadComments();
    }
  };

  // === Удаление ===
  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить комментарий?")) return;
    try {
      await api.delete(`/comments/${id}`);
      await loadComments();
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  // === Формат даты и времени ===
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // === Управление количеством ответов ===
  const toggleReplies = (id: number, totalReplies: number) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [id]: prev[id] === totalReplies ? 2 : totalReplies,
    }));
  };

  // === Рендер комментария ===
  const renderComment = (c: Comment, level = 0): JSX.Element => {
    const replies = c.replies || [];
    const visible = visibleReplies[c.id] || 1;
    const hasHiddenReplies = replies.length > visible;

    return (
      <motion.div
        key={`comment-${c.id}-${level}`}
        className={`${styles.commentCard} ${
          replyTo?.id === c.id ? styles.activeReply : ""
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className={styles.commentHeader}>
          <span className={styles.date}>{formatDateTime(c.created_at)}</span>
          <span className={styles.userBadge}>{c.user.email}</span>
        </div>

        <p className={styles.commentText}>{c.content}</p>

        <div className={styles.actions}>
          <button
            className={styles.replyButton}
            onClick={() => setReplyTo({ id: c.id, email: c.user.email })}
          >
            <MessageSquare size={16} />
            Ответить
          </button>

          <button
            className={`${styles.likeButton} ${
              c.my_reaction === 1 ? styles.activeLike : ""
            }`}
            onClick={() => handleReact(c.id, 1)}
            title="Нравится"
          >
            <ThumbsUp size={16} />
            <span>{c.likes_count}</span>
          </button>

          <button
            className={`${styles.dislikeButton} ${
              c.my_reaction === -1 ? styles.activeDislike : ""
            }`}
            onClick={() => handleReact(c.id, -1)}
            title="Не нравится"
          >
            <ThumbsDown size={16} />
            <span>{c.dislikes_count}</span>
          </button>

          {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(c.id)}
              title="Удалить"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {replies.length > 0 && (
          <div className={styles.repliesBlock}>
            <AnimatePresence>
              {replies.slice(0, visible).map((r) => (
                <motion.div
                  key={`comment-${r.id}-${level + 1}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderComment(r, level + 1)}
                </motion.div>
              ))}
            </AnimatePresence>

            {hasHiddenReplies && (
              <button
                className={styles.showMoreReplies}
                onClick={() => toggleReplies(c.id, replies.length)}
              >
                Показать ещё {replies.length - visible} ответов
              </button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Комментарии</h3>

      <div className={styles.commentList}>
        {comments.length > 0 ? (
          <>
            {comments.slice(0, visibleCount).map((c) => renderComment(c))}
            {comments.length > visibleCount && (
              <button
                className={styles.showMore}
                onClick={() => setVisibleCount(comments.length)}
              >
                Показать ещё {comments.length - visibleCount} комментариев
              </button>
            )}
          </>
        ) : (
          <p className={styles.noComments}>Пока нет комментариев</p>
        )}
      </div>

      <div className={styles.editor}>
        {replyTo && (
          <div className={styles.replyTo}>
            Ответ пользователю{" "}
            <span className={styles.replyUser}>{replyTo.email}</span>{" "}
            <button
              className={styles.cancelReply}
              onClick={() => setReplyTo(null)}
            >
              отменить
            </button>
          </div>
        )}

        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="Оставьте комментарий..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Отправка..." : "Отправить"}
        </button>
      </div>
    </div>
  );
};
