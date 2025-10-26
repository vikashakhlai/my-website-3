import { useState, useEffect, useCallback } from "react";
import styles from "./BooksPage.module.css";
import BookList from "../components/BookList";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import { Book } from "../types/Book";

const BooksPage = () => {
  const [filters, setFilters] = useState({ tag: "", author: "", title: "" });
  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: number; full_name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const limit = 20;

  // === Загрузка фильтров (теги, авторы) ===
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [tagsRes, authorsRes] = await Promise.all([
          fetch("/api-nest/tags"),
          fetch("/api-nest/authors"),
        ]);

        const tagsData = await tagsRes.json();
        const authorsData = await authorsRes.json();

        setTags(Array.isArray(tagsData) ? tagsData : []);
        setAuthors(Array.isArray(authorsData) ? authorsData : []);
      } catch (err) {
        console.error("Ошибка загрузки фильтров:", err);
      }
    };
    fetchFilters();
  }, []);

  // === Загрузка книг ===
  const loadBooks = useCallback(
    async (page = 1, fullLoad = false) => {
      try {
        if (fullLoad) {
          setLoading(true);
          setBooks([]);
        } else {
          setIsFetching(true);
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (filters.tag) params.append("tag", filters.tag);
        if (filters.author) params.append("author", filters.author);
        if (filters.title) params.append("title", filters.title);

        const res = await fetch(`/api-nest/books/search?${params}`);
        const data = await res.json();

        if (Array.isArray(data.books)) {
          setBooks(data.books);
          setPagination({
            currentPage: page,
            totalPages: data.totalPages || 1,
            totalCount: data.totalCount || 0,
          });
        } else {
          setBooks([]);
          setPagination({ currentPage: 1, totalPages: 1, totalCount: 0 });
        }

        setError(null);
      } catch (err) {
        console.error("Ошибка загрузки книг:", err);
        setError("Не удалось загрузить книги.");
        setBooks([]);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadBooks(1, true);
  }, []);

  useEffect(() => {
    loadBooks(1);
  }, [filters, loadBooks]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadBooks(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setFilters({ tag: "", author: "", title: "" });
    loadBooks(1, true);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Библиотека</h1>

      <Filters
        fields={[
          {
            type: "select",
            key: "tag",
            label: "Теги",
            options: [
              { label: "Все теги", value: "" },
              ...tags.map((t) => ({ label: t.name, value: t.name })),
            ],
          },
          {
            type: "autocomplete",
            key: "author",
            label: "Автор",
            options: authors.map((a) => a.full_name),
            placeholder: "Введите фамилию...",
          },
          {
            type: "text",
            key: "title",
            label: "Название",
            placeholder: "Поиск по названию...",
          },
        ]}
        onChange={(values) => {
          setFilters(values);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
        onReset={handleReset}
        totalCount={pagination.totalCount}
      />

      <div className={styles.booksWrapper}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : loading || (!books.length && !error) ? (
          <div className={styles.gridPlaceholder}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeletonCard">
                <div className="skeletonCover">
                  <div className="skeletonTheme"></div>
                </div>
                <div className="skeletonTitle"></div>
                <div className="skeletonTitleShort"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.fadeIn}>
            <BookList books={books} />
          </div>
        )}
        {isFetching && !loading && (
          <div className={styles.overlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BooksPage;
