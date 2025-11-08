import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Trash2, MessageSquare } from "lucide-react";
import { api } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./CommentsSection.module.css";

type TargetType = "book" | "article" | "media" | "personality" | "textbook";

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
  targetType: TargetType;
  targetId: number;
  apiBase?: string; // опционально, иначе возьмётся из axios instance
}

/** =========================
 *  Tree utils
 *  ========================= */
const buildTree = (flat: Comment[]): Comment[] => {
  const map = new Map<number, Comment & { replies: Comment[] }>();
  const roots: Comment[] = [];

  // First pass: create map of all comments with empty replies array
  flat.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });

  // Second pass: build tree structure
  flat.forEach((c) => {
    const comment = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      // This is a reply, add it to parent's replies
      map.get(c.parent_id)!.replies.push(comment);
    } else {
      // This is a root comment
      roots.push(comment);
    }
  });

  // Sort replies by creation date (oldest first)
  const sortReplies = (comments: Comment[]): void => {
    comments.forEach((c) => {
      if (c.replies && c.replies.length > 0) {
        c.replies.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        sortReplies(c.replies);
      }
    });
  };

  sortReplies(roots);
  return roots;
};

const insertIntoTree = (tree: Comment[], node: Comment): Comment[] => {
  // Check if comment already exists
  const exists = (list: Comment[]): boolean =>
    list.some((c) => c.id === node.id || exists(c.replies || []));
  if (exists(tree)) return tree;

  const newNode = { ...node, replies: node.replies ?? [] };

  if (!node.parent_id) {
    // Insert root comment at the beginning (newest first for root comments)
    return [newNode, ...tree];
  }

  // Insert reply into parent's replies, maintaining chronological order
  const rec = (list: Comment[]): Comment[] =>
    list.map((c) => {
      if (c.id === node.parent_id) {
        const updatedReplies = [...(c.replies || []), newNode].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return {
          ...c,
          replies: updatedReplies,
        };
      }
      return { ...c, replies: rec(c.replies || []) };
    });
  return rec(tree);
};

const updateInTree = (
  list: Comment[],
  id: number,
  updater: (c: Comment) => Comment
): Comment[] =>
  list.map((c) =>
    c.id === id
      ? updater(c)
      : { ...c, replies: updateInTree(c.replies || [], id, updater) }
  );

const removeFromTree = (list: Comment[], id: number): Comment[] =>
  list
    .map((c) => ({ ...c, replies: removeFromTree(c.replies || [], id) }))
    .filter((c) => c.id !== id);

/** =========================
 *  Component
 *  ========================= */
export const CommentsSection: React.FC<CommentsSectionProps> = ({
  targetType,
  targetId,
  apiBase,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [visibleReplies, setVisibleReplies] = useState<Record<number, number>>(
    {}
  );
  const INITIAL_REPLIES_VISIBLE = 3;
  const REPLIES_INCREMENT = 5;
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { user } = useAuth();

  const baseUrl = useMemo(() => {
    // берем base от axios инстанса, но если нужно — можно передать вручную
    const fromEnv =
      (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
      (api.defaults.baseURL
        ? api.defaults.baseURL.replace(/\/$/, "")
        : "/api-nest");
    return apiBase?.replace(/\/$/, "") || fromEnv;
  }, [apiBase]);

  /** === Load comments === */
  const loadComments = useCallback(async () => {
    try {
      const res = await api.get(`/comments/${targetType}/${targetId}`);
      setComments(buildTree(res.data));
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Ошибка загрузки комментариев:", err);
      }
      // In production, silently handle errors or show user-friendly message
    }
  }, [targetId, targetType]);

  useEffect(() => {
    setVisibleCount(5);
    setVisibleReplies({});
    setReplyTo(null);
    setContent("");
    loadComments();
  }, [loadComments, targetId, targetType]);

  // Auto-focus textarea when replyTo changes
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [replyTo]);

  /** === Send comment (instant insert, без полного refetch) === */
  const handleSend = async () => {
    const text = content.trim();
    if (!text) return;
    setLoading(true);

    try {
      const body = {
        target_type: targetType,
        target_id: targetId,
        content: text,
        parent_id: replyTo?.id ?? null,
      };
      const res = await api.post("/comments", body);

      // МГНОВЕННО вставляем полученный от сервера комментарий (без полного перезапроса)
      const newComment: Comment = {
        ...res.data,
        replies: res.data.replies ?? [],
      };
      setComments((prev) => insertIntoTree(prev, newComment));

      setContent("");
      setReplyTo(null);
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Ошибка при отправке комментария:", err);
      }
      const errorMessage =
        err?.response?.status === 401
          ? "Чтобы оставить комментарий, нужно войти в систему."
          : err?.response?.data?.message || "Не удалось отправить комментарий. Попробуйте позже.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /** === React like/dislike === */
  const handleReact = async (id: number, value: 1 | -1) => {
    const prevReaction = comments.find((c) => c.id === id)?.my_reaction ?? 0;
    const newReaction = prevReaction === value ? 0 : value;

    // локально обновляем UI
    setComments((prev) =>
      updateInTree(prev, id, (c) => ({
        ...c,
        my_reaction: newReaction,
        likes_count:
          c.likes_count + (newReaction === 1 ? 1 : prevReaction === 1 ? -1 : 0),
        dislikes_count:
          c.dislikes_count +
          (newReaction === -1 ? 1 : prevReaction === -1 ? -1 : 0),
      }))
    );

    try {
      await api.post(`/comments/${id}/react`, { value: newReaction });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Ошибка при реакции:", err);
      }
      // Revert optimistic update on error
      await loadComments();
    }
  };

  /** === Delete === */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить комментарий?")) return;
    try {
      await api.delete(`/comments/${id}`);
      // удалить локально (SSE удаление тоже придёт, но тут можно убрать сразу)
      setComments((prev) => removeFromTree(prev, id));
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Ошибка удаления:", err);
      }
      alert("Не удалось удалить комментарий. Попробуйте позже.");
    }
  };

  /** === SSE subscribe === */
  useEffect(() => {
    // чистим предыдущую подписку
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    let stopped = false;

    const connect = () => {
      if (stopped) return;

      const url = `${baseUrl}/comments/stream/${targetType}/${targetId}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        // SSE connection established
      };

      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data) as
            | { type: "created"; comment: Comment }
            | { type: "react"; comment: Comment }
            | { type: "deleted"; id: number };

          if (payload.type === "created") {
            setComments((prev) =>
              insertIntoTree(prev, {
                ...payload.comment,
                replies: payload.comment.replies ?? [],
              })
            );
          } else if (payload.type === "react") {
            const { comment } = payload;
            setComments((prev) =>
              updateInTree(prev, comment.id, (c) => ({
                ...c,
                likes_count: comment.likes_count,
                dislikes_count: comment.dislikes_count,
                // my_reaction может быть не прислан — не трогаем, оставляем как есть
              }))
            );
          } else if (payload.type === "deleted") {
            setComments((prev) => removeFromTree(prev, payload.id));
          }
        } catch (e) {
          // Silently handle SSE parsing errors in production
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ Ошибка парсинга SSE:", e);
          }
        }
      };

      es.onerror = () => {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ SSE разорвано, переподключение через 2s ...");
        }
        es.close();
        reconnectTimerRef.current = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [baseUrl, targetId, targetType]);

  /** === helpers === */
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

  const toggleReplies = (id: number, totalReplies: number) => {
    setVisibleReplies((prev) => {
      const current = prev[id] || INITIAL_REPLIES_VISIBLE;
      // If showing all, collapse to initial
      if (current >= totalReplies) {
        return { ...prev, [id]: INITIAL_REPLIES_VISIBLE };
      }
      // Otherwise, show more (increment by REPLIES_INCREMENT, but not more than total)
      const next = Math.min(current + REPLIES_INCREMENT, totalReplies);
      return { ...prev, [id]: next };
    });
  };

  /** === Render === */
  const renderComment = (c: Comment, level = 0): JSX.Element => {
    const replies = c.replies || [];
    const visible = visibleReplies[c.id] || INITIAL_REPLIES_VISIBLE;
    const hasHiddenReplies = replies.length > visible;

    return (
      <motion.div
        key={`comment-${c.id}-${level}`}
        className={`${styles.commentCard} ${
          replyTo?.id === c.id ? styles.activeReply : ""
        } ${level > 0 ? styles.nestedComment : ""}`}
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
            onClick={() => {
              setReplyTo({ id: c.id, email: c.user.email });
            }}
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
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
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
                {replies.length - visible === 1
                  ? "Показать ещё 1 ответ"
                  : `Показать ещё ${replies.length - visible} ответов`}
              </button>
            )}
            {!hasHiddenReplies && visible > INITIAL_REPLIES_VISIBLE && (
              <button
                className={styles.showMoreReplies}
                onClick={() => toggleReplies(c.id, replies.length)}
              >
                Скрыть ответы
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
                {comments.length - visibleCount === 1
                  ? "Показать ещё 1 комментарий"
                  : `Показать ещё ${comments.length - visibleCount} комментариев`}
              </button>
            )}
            {visibleCount >= comments.length && comments.length > 5 && (
              <button
                className={styles.showMore}
                onClick={() => setVisibleCount(5)}
              >
                Скрыть комментарии
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
              onClick={() => {
                setReplyTo(null);
                setContent("");
                textareaRef.current?.focus();
              }}
            >
              отменить
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          rows={3}
          placeholder={
            replyTo
              ? `Ответить пользователю ${replyTo.email}...`
              : "Оставьте комментарий..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            // Allow submitting with Ctrl+Enter or Cmd+Enter
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              if (!loading && content.trim()) {
                handleSend();
              }
            }
            // Cancel reply with Escape
            if (e.key === "Escape" && replyTo) {
              setReplyTo(null);
              setContent("");
            }
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading || !content.trim()}
          className={styles.submitButton}
        >
          {loading ? "Отправка..." : "Отправить"}
        </button>
      </div>
    </div>
  );
};
