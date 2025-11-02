import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentBookCard from "./StudentBookCard";
import Pagination from "../../components/Pagination";
import Filters from "../../components/Filters";
import { TextBookProps } from "../../types/TextBook";
import styles from "./StudentBooksPage.module.css";

const StudentBooksPage: React.FC = () => {
  const [books, setBooks] = useState<TextBookProps[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Пагинация
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // 🔹 Фильтры
  const [filters, setFilters] = useState<Record<string, string>>({});
  const limit = 7;

  // ✅ Маппинг фильтров (чтобы совпадали с базой)
  const LEVEL_MAP: Record<string, string> = {
    начинающий: "beginner",
    средний: "intermediate",
    продвинутый: "advanced",
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchBooks = async () => {
      try {
        const { data } = await axios.get("/api-nest/textbooks", {
          params: {
            page,
            limit,
            level: filters.level ? LEVEL_MAP[filters.level] : undefined,
          },
        });

        if (!isMounted) return;

        setBooks(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      } catch (err) {
        console.error("Ошибка загрузки учебников:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBooks();
    return () => {
      isMounted = false;
    };
  }, [page, JSON.stringify(filters)]);

  // === Конфигурация фильтров ===
  const filterFields = [
    {
      type: "select" as const,
      key: "level",
      label: "Уровень",
      options: [
        { label: "Начинающий", value: "начинающий" },
        { label: "Средний", value: "средний" },
        { label: "Продвинутый", value: "продвинутый" },
      ],
    },
  ];

  // === Отображение ===
  const [bigBook, smallBook, ...middleBooks] = books;

  return (
    <div className={styles.pageContainer}>
      {/* ✅ Фильтры всегда видны */}
      <Filters
        fields={filterFields}
        initialValues={filters}
        suppressInitialOnChange
        onChange={(vals) => {
          setFilters(vals);
          setPage(1);
        }}
        onReset={() => {
          setFilters({});
          setPage(1);
        }}
        totalCount={totalCount}
      />

      {loading ? (
        <div className={styles.loader}>Загрузка учебников...</div>
      ) : books.length === 0 ? (
        <div className={styles.noResults}>
          Учебники не найдены{" "}
          {filters.level ? `для уровня "${LEVEL_MAP[filters.level]}"` : ""}
        </div>
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
