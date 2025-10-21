import styles from "./CommentItem.module.css";

const CommentItem = ({ comment }) => {
  return (
    <div className={styles.comment}>
      <div className={styles.commentMeta}>
        <span className={styles.commentUser}>{comment.user_id}</span>
        <span className={styles.commentDate}>
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </div>
      <p>{comment.content}</p>
    </div>
  );
};

export default CommentItem;
