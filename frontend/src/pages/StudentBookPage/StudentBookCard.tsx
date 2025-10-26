import React from "react";
import { Link } from "react-router-dom";
import styles from "./StudentBookCard.module.css";
import { TextBookProps } from "../types/TextBook";

interface StudentBookCardProps {
  book: TextBookProps;
  type: "big" | "small" | "middle";
}

const StudentBookCard: React.FC<StudentBookCardProps> = ({ book, type }) => {
  if (!book) return null;

  return (
    <Link to={`/textbooks/${book.id}`} className={styles.linkWrapper}>
      <div className={`${styles.card} ${styles[type]}`}>
        <img
          src={book.cover_image_url || "/default-cover.jpg"}
          alt={book.title}
          className={styles.cover}
        />
        <div className={styles.content}>
          <h3 className={styles.title}>{book.title}</h3>

          {type !== "small" && (
            <>
              <p className={styles.meta}>
                <strong>Авторы:</strong> {book.authors || "Неизвестно"}
              </p>
              <p className={styles.meta}>
                <strong>Год:</strong> {book.publication_year || "—"}
              </p>
              <p className={styles.meta}>
                <strong>Уровень:</strong> {book.level || "—"}
              </p>
            </>
          )}

          {type === "big" && book.description && (
            <p className={styles.description}>
              {book.description.slice(0, 180)}...
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default StudentBookCard;
