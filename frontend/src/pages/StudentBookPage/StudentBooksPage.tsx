import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentBookCard from "./StudentBookCard";
import Pagination from "../../components/Pagination";
import { TextBookProps } from "../../types/TextBook";
import styles from "./StudentBooksPage.module.css";
import useScrollToTop from "../../hooks/useScrollToTop";
import TextbookFilters from "../../components/TextbookFilters";

const StudentBooksPage: React.FC = () => {
  useScrollToTop();

  const [books, setBooks] = useState<TextBookProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({ search: "", level: "" });
  const limit = 7;

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetchBooks = async () => {
      try {
        const { data } = await axios.get("/api-nest/textbooks", {
          params: {
            page,
            limit,
            level: filters.level || undefined,
            search: filters.search || undefined,
          },
        });

        if (!active) return;

        setBooks(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      } catch (err) {
        console.error("Ошибка загрузки учебников:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBooks();
    return () => {
      active = false;
    };
  }, [page, filters]);

  const handleReset = () => {
    setFilters({ search: "", level: "" });
    setPage(1);
  };

  const [bigBook, smallBook, ...middleBooks] = books;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Учебники</h1>

      <TextbookFilters
        filters={filters}
        totalCount={totalCount}
        onChange={(vals) => {
          setFilters(vals);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {loading ? (
        <div className={styles.loader}>Загрузка учебников...</div>
      ) : books.length === 0 ? (
        <div className={styles.noResults}>Учебники не найдены</div>
      ) : (
        <>
          <div className={styles.topSection}>
            {bigBook && <StudentBookCard type="big" book={bigBook} />}
            {smallBook && <StudentBookCard type="small" book={smallBook} />}
          </div>

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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default StudentBooksPage;
