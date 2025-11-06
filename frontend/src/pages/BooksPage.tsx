import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./BooksPage.module.css";
import BookList from "../components/BookList";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import { Book } from "../types/Book";
import { api } from "../api/auth";

type TagDto = { id: number; name: string };
type AuthorDto = { id: number; full_name: string };

const BooksPage = () => {
  const [filters, setFilters] = useState({ tag: "", author: "", title: "" });
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

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
  const isFirstLoad = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // === фильтры (tags + authors) ===
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

  // === Стабильная функция загрузки книг ===
  const fetchBooks = useCallback(async (page = 1, fullLoad = false) => {
    try {
      if (fullLoad) {
        setLoading(true);
        setBooks([]);
      } else {
        setIsFetching(true);
      }

      const params: Record<string, string | number> = { page, limit };
      const f = filtersRef.current;

      if (f.title.trim()) params.title = f.title.trim();
      if (f.tag.trim()) params.tag = f.tag.trim();
      if (f.author.trim()) params.author = f.author.trim();

      const { data } = await api.get("/books", { params });
      console.log(
        "📌 REQUEST PARAMS:",
        params,
        "FILTERS REF:",
        filtersRef.current
      );

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
  }, []);

  // === первый запрос ===
  useEffect(() => {
    fetchBooks(1, true);
  }, []);

  // === повторная загрузка при изменении фильтров ===
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchBooks(1);
    setPagination((p) => ({ ...p, currentPage: 1 }));
  }, [filters, fetchBooks]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchBooks(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setFilters({ tag: "", author: "", title: "" });
    fetchBooks(1, true);
  };

  const handleFiltersChange = useCallback(
    (values: Record<string, string>) => setFilters(values as any),
    []
  );

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
        onChange={handleFiltersChange}
        onReset={handleReset}
        totalCount={pagination.totalCount}
      />

      <div className={styles.booksWrapper}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : loading ? (
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
