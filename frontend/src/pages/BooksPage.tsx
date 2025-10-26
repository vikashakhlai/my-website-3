import { useState, useEffect } from "react";
import styles from "./BooksPage.module.css";
import BookList from "../components/BookList";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import { Book } from "./types/Book";

const BooksPage = () => {
  const [filters, setFilters] = useState({ tag: "", author: "", title: "" });
  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: number; full_name: string }[]>(
    []
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 20;

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

  // === Загрузка книг ===
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        if (filters.tag) params.append("tag", filters.tag);
        if (filters.author) params.append("author", filters.author);
        if (filters.title) params.append("title", filters.title);

        const res = await fetch(`/api-nest/books/search?${params}`);
        const data = await res.json();

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
  }, [filters, currentPage]);

  // === Сброс фильтров ===
  const handleReset = () => {
    setFilters({ tag: "", author: "", title: "" });
    setCurrentPage(1);
  };

  return (
    <div className={styles.page}>
      <Filters
        fields={[
          {
            type: "select",
            key: "tag",
            label: "Теги",
            options: tags.map((t) => ({ label: t.name, value: t.name })),
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
          setCurrentPage(1);
        }}
        onReset={handleReset}
        totalCount={totalCount}
      />

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <>
          <div className={(books?.length ?? 0) === 1 ? styles.leftAlign : ""}>
            <BookList books={books ?? []} />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default BooksPage;
