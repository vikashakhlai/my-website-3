import { useState } from "react";
import CommentItem from "./CommentItem";
import styles from "./BookComments.module.css";

const BookComments = ({ book, isAuthenticated, onCommentAdded }) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Необходимо войти, чтобы оставить комментарий");
      return;
    }

    const res = await fetch(`/api-nest/books/${book.id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      const created = await res.json();
      onCommentAdded(created);
      setNewComment("");
    } else {
      alert("Ошибка при добавлении комментария");
    }
  };

  return (
    <div className={styles.commentsSection}>
      <h2>Комментарии</h2>

      {isAuthenticated ? (
        <div className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
          />
          <button onClick={handleAddComment}>Отправить</button>
        </div>
      ) : (
        <p>Авторизуйтесь, чтобы оставить комментарий</p>
      )}

      <div className={styles.commentsList}>
        {book.comments?.length ? (
          book.comments.map((c) => <CommentItem key={c.id} comment={c} />)
        ) : (
          <p className={styles.noComments}>Пока нет комментариев</p>
        )}
      </div>
    </div>
  );
};

export default BookComments;
