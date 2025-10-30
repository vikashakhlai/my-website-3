import React, { useState, useEffect } from "react";
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
    <div className={styles.wrapper}>
      {/* Навигация */}
      {books.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              className={`${styles.navBtn} ${styles.prev}`}
              onClick={prevBook}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <button
            className={`${styles.navBtn} ${styles.next}`}
            onClick={nextBook}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {/* Карточка */}
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img
            src={
              currentBook.cover_image_url ||
              "https://via.placeholder.com/300x400?text=No+Cover"
            }
            alt={currentBook.title}
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{currentBook.title}</h2>

          <div className={styles.metaBlock}>
            {currentBook.authors && (
              <p>
                <strong>Авторы:</strong> {currentBook.authors}
              </p>
            )}
            {currentBook.publication_year && (
              <p>
                <strong>Год издания:</strong> {currentBook.publication_year}
              </p>
            )}
            {currentBook.level && (
              <span className={styles.levelTag}>{currentBook.level}</span>
            )}
          </div>

          {currentBook.description && (
            <p className={styles.description}>
              {currentBook.description.length > 300
                ? currentBook.description.slice(0, 300) + "..."
                : currentBook.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentBookCardBigSlider;
