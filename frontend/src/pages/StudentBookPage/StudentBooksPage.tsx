// pages/StudentBookPage/StudentBooksPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentBookCard from "./StudentBookCard";
// import { layoutConfig } from "./layoutConfig";
import { TextBookProps } from "../../types/TextBook";
import styles from "./StudentBooksPage.module.css"; // ← меняем на import styles

const shuffleArray = <T,>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);

const StudentBooksPage: React.FC = () => {
  const [books, setBooks] = useState<TextBookProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await axios.get("/api-nest/textbooks");
        if (Array.isArray(data)) {
          setBooks(shuffleArray(data));
        }
      } catch (err) {
        console.error("Ошибка загрузки учебников:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) return <div className={styles.pageContainer}>Загрузка...</div>;

  if (books.length === 0)
    return <div className={styles.pageContainer}>Учебники не найдены</div>;

  const [bigBook, smallBook, ...middleBooks] = books;

  return (
    <div className={styles.pageContainer}>
      {/* Верхняя секция */}
      <div className={styles.topSection}>
        <StudentBookCard type="big" book={bigBook} />
        <StudentBookCard type="small" book={smallBook} />
      </div>

      {/* Остальные книги */}
      {middleBooks.length > 0 && (
        <div className={styles.remainingSection}>
          <h2 className={styles.sectionTitle}>Остальные учебники</h2>
          <div className={styles.booksGrid}>
            {middleBooks.map((book) => (
              <StudentBookCard key={book.id} type="middle" book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBooksPage;
