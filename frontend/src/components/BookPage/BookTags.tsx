import styles from "./BookTags.module.css";

const BookTags = ({ tags }) => {
  return (
    <div className={styles.tagsSection}>
      <strong>Теги:</strong>
      <div className={styles.tags}>
        {tags && tags.length > 0 ? (
          tags.map((t) => (
            <span key={t.id} className={styles.tag}>
              {t.name}
            </span>
          ))
        ) : (
          <span className={styles.noTags}>Без тегов</span>
        )}
      </div>
    </div>
  );
};

export default BookTags;
