import { useState, useEffect, useRef } from "react";
import styles from "./BooksPage.module.css";
import BookList from "../components/BookList";
import { Book } from "../types/Book";

const BooksPage = () => {
  const [tagFilter, setTagFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState(titleFilter);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: number; full_name: string }[]>(
    []
  );

  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const authorInputRef = useRef<HTMLInputElement | null>(null);

  // === Загрузка тегов и авторов ===
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

  // === ДЕБАУНС для поля автора ===
  useEffect(() => {
    if (!authorFilter) {
      setAuthorSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const filtered = authors
        .map((a) => a.full_name)
        .filter((name) =>
          name.toLowerCase().includes(authorFilter.toLowerCase())
        )
        .slice(0, 5);

      setAuthorSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [authorFilter, authors]);

  // === ДЕБАУНС для поля "Название" ===
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedTitle(titleFilter);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [titleFilter]);

  // === Загрузка книг ===
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });
        if (tagFilter) params.append("tag", tagFilter);
        if (authorFilter) params.append("author", authorFilter);
        if (debouncedTitle) params.append("title", debouncedTitle);

        const res = await fetch(`/api-nest/books/search?${params}`);
        const data = await res.json();

        // ✅ Безопасная проверка данных
        setBooks(Array.isArray(data.books) ? data.books : []);
        setTotalCount(Number(data.totalCount) || 0);
        setTotalPages(Number(data.totalPages) || 1);
      } catch (err) {
        console.error("Ошибка загрузки книг:", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, tagFilter, authorFilter, debouncedTitle]);

  const handleSuggestionClick = (name: string) => {
    setAuthorFilter(name);
    setShowSuggestions(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      authorInputRef.current &&
      !authorInputRef.current.contains(e.target as Node)
    ) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetFilters = () => {
    setTagFilter("");
    setAuthorFilter("");
    setTitleFilter("");
    setCurrentPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label>Теги</label>
          <select
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Все теги</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`${styles.filterItem} ${styles.authorField}`}
          ref={authorInputRef}
        >
          <label>Автор</label>
          <input
            type="text"
            placeholder="Введите фамилию..."
            value={authorFilter}
            onChange={(e) => {
              setAuthorFilter(e.target.value);
              setCurrentPage(1);
            }}
            onFocus={() => authorFilter && setShowSuggestions(true)}
          />
          {showSuggestions && (
            <ul
              className={`${styles.suggestions} ${
                showSuggestions ? styles.suggestionsVisible : ""
              }`}
            >
              {authorSuggestions.map((s, i) => (
                <li key={i} onClick={() => handleSuggestionClick(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.filterItem}>
          <label>Название</label>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
          />
        </div>

        <button className={styles.resetButton} onClick={resetFilters}>
          Сбросить
        </button>

        <div className={styles.count}>Найдено: {totalCount} книг</div>
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <>
          <div className={(books?.length ?? 0) === 1 ? styles.leftAlign : ""}>
            <BookList books={books ?? []} />
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Назад
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={page === currentPage ? styles.activePage : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === 2 && currentPage > 3)
                  return <span key="start-ellipsis">...</span>;
                if (page === totalPages - 1 && currentPage < totalPages - 2)
                  return <span key="end-ellipsis">...</span>;
                return null;
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BooksPage;
