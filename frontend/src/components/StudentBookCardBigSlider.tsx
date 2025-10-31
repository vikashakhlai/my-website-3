import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./StudentBookCardBigSlider.module.css";
import { TextBookProps } from "../types/TextBook";

interface Props {
  books: TextBookProps[];
}

const StudentBookCardBigSlider: React.FC<Props> = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => setCurrentIndex(0), [books]);

  if (!books || books.length === 0) return null;

  const nextBook = () => setCurrentIndex((prev) => (prev + 1) % books.length);
  const prevBook = () =>
    setCurrentIndex((prev) => (prev - 1 + books.length) % books.length);

  const currentBook = books[currentIndex];

  return (
    <div className={styles.sliderContainer}>
      {/* 🔹 Навигация */}
      {books.length > 1 && (
        <>
          <button
            className={`${styles.nav} ${styles.prev}`}
            onClick={prevBook}
            aria-label="Предыдущая книга"
          >
            ‹
          </button>
          <button
            className={`${styles.nav} ${styles.next}`}
            onClick={nextBook}
            aria-label="Следующая книга"
          >
            ›
          </button>
        </>
      )}

      {/* 🔹 Карточка книги (обернута в ссылку) */}
      <Link to={`/textbooks/${currentBook.id}`} className={styles.cardLink}>
        <div className={styles.card}>
          <div className={styles.bookShadow}>
            <img
              src={
                currentBook.cover_image_url ||
                "https://via.placeholder.com/300x400?text=No+Cover"
              }
              alt={currentBook.title}
              className={styles.cover}
            />
          </div>

          <div className={styles.info}>
            <h3 className={styles.title}>{currentBook.title}</h3>

            {currentBook.authors && (
              <p className={styles.author}>{currentBook.authors}</p>
            )}

            <div className={styles.meta}>
              {currentBook.publication_year && (
                <span className={styles.year}>
                  📘 {currentBook.publication_year}
                </span>
              )}
              {currentBook.level && (
                <span className={styles.level}>{currentBook.level}</span>
              )}
            </div>

            {currentBook.description && (
              <p className={styles.description}>
                {currentBook.description.length > 220
                  ? currentBook.description.slice(0, 220) + "..."
                  : currentBook.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default StudentBookCardBigSlider;
