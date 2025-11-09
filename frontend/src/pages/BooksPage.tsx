import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./BooksPage.module.css";
import BookList from "../components/BookList";
import Pagination from "../components/Pagination";
import { Book } from "../types/Book";
import { api } from "../api/auth";
import BookFilters from "../components/BookFilters";
import Loader from "../components/Loader";
import SkeletonCard from "../components/SkeletonCard";

type TagDto = { id: number; name: string };
type AuthorDto = { id: number; full_name: string };

const BooksPage = () => {
  const [filters, setFilters] = useState({ tag: "", author: "", title: "" });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const limit = 20;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ✅ debounce (400ms) synced with BookFilters
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(t);
  }, [filters]);

  // === Загружаем теги и авторов ===
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [tagsRes, authorsRes] = await Promise.all([
          api.get<TagDto[]>("/tags"),
          api.get<AuthorDto[]>("/authors"),
        ]);

        if (!mountedRef.current) return;
        setTags(tagsRes.data ?? []);
        setAuthors(authorsRes.data ?? []);
      } catch (err) {
        console.error("Ошибка загрузки фильтров:", err);
      }
    };

    fetchFilters();
  }, []);

  // === Запрос книг ===
  const fetchBooks = useCallback(
    async (page = 1, fullLoad = false) => {
      try {
        if (fullLoad) {
          setLoading(true);
          setBooks([]);
        } else {
          setIsFetching(true);
        }

        const params: Record<string, string | number> = { page, limit };
        const f = debouncedFilters;

        if (f.title.trim()) params.title = f.title.trim();
        if (f.tag) params.tag = f.tag;
        if (f.author.trim()) params.author = f.author.trim();

        const { data } = await api.get("/books", { params });

        if (!mountedRef.current) return;

        setBooks(data.items ?? []);
        setPagination({
          currentPage: data.page ?? 1,
          totalPages: data.pages ?? 1,
          totalCount: data.total ?? 0,
        });
        setError(null);
      } catch (err) {
        console.error("Ошибка загрузки книг:", err);
        if (!mountedRef.current) return;
        setError("Не удалось загрузить книги.");
        setBooks([]);
      } finally {
        if (!mountedRef.current) return;
        setLoading(false);
        setIsFetching(false);
      }
    },
    [debouncedFilters]
  );

  // === первый запуск ===
  useEffect(() => {
    fetchBooks(1, true);
  }, []);

  // === перезагрузка при изменении debouncedFilters ===
  useEffect(() => {
    fetchBooks(1);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [debouncedFilters, fetchBooks]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchBooks(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setFilters({ tag: "", author: "", title: "" });
    setDebouncedFilters({ tag: "", author: "", title: "" });
    fetchBooks(1, true);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Библиотека</h1>

      <BookFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        totalCount={pagination.totalCount}
        tags={tags}
        authors={authors.map((a) => a.full_name)}
      />

      <div className={styles.booksWrapper}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : loading ? (
          <SkeletonCard variant="book" count={12} layout="grid" />
        ) : (
          <div className={styles.fadeIn}>
            <BookList books={books} />
          </div>
        )}

        {isFetching && !loading && <Loader className="overlay" size="md" />}
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
