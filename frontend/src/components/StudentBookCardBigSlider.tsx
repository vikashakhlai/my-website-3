import React, { useState, useEffect } from "react";
import styles from "./StudentBookCardBigSlider.module.css";
import { TextBookProps } from "../pages/types/TextBook";

interface Props {
  books: TextBookProps[];
}

const StudentBookCardBigSlider: React.FC<Props> = ({ books }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [books]);

  const nextBook = () => {
    setCurrentIndex((prev) => (prev + 1) % books.length);
  };

  const prevBook = () => {
    setCurrentIndex((prev) => (prev - 1 + books.length) % books.length);
  };

  const currentBook = books[currentIndex];
  if (!currentBook) return null;

  return (
    <div className={styles.wrapper}>
      {/* Стрелки теперь находятся в wrapper, а не внутри card */}
      {books.length > 1 && (
        <>
          {currentIndex !== 0 && (
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

      {/* Основной карточный блок без стрелок внутри */}
      <div className={styles.card}>
        {/* Левая часть с изображением */}
        <div className={styles.imageContainer}>
          <img
            src={currentBook.cover_image_url}
            alt={currentBook.title}
            className={styles.image}
            onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/300x400?text=No+Cover")
            }
          />
        </div>

        {/* Правая часть с контентом */}
        <div className={styles.content}>
          <h2 className={styles.title}>{currentBook.title}</h2>
          <p>
            <strong>Авторы:</strong> {currentBook.authors}
          </p>
          <p>
            <strong>Год издания:</strong> {currentBook.publication_year}
          </p>
          <p>
            <strong>Уровень:</strong> {currentBook.level}
          </p>
          <p>
            <strong>Описание:</strong>{" "}
            <span className={styles.description}>
              {currentBook.description}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentBookCardBigSlider;
