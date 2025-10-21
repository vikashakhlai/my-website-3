import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackZone from "../BackZone";
import useScrollToTop from "../../hooks/useScrollToTop";
import { useAuth } from "../../context/AuthContext";
import styles from "./BookPage.module.css";
import BookInfo from "./BookInfo";
import BookTags from "./BookTags";
import BookRating from "./BookRating";
import BookGallery from "./BookGallery";
import BookComments from "./BookComments";

// === Типы ===
export interface Author {
  id: number;
  full_name: string;
  bio?: string | null;
  photo_url?: string | null;
}

export interface Tag {
  id: number;
  name: string;
}

export interface BookComment {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
}

export interface RelatedBook {
  id: number;
  title: string;
  cover_url?: string | null;
}

export interface Book {
  id: number;
  title: string;
  description?: string | null;
  pages?: number;
  publication_year?: number;
  cover_url?: string | null;
  publisher?: { id: number; name: string };
  authors?: Author[];
  tags?: Tag[];
  comments?: BookComment[];
  ratings?: number[];
  averageRating?: number;
  ratingCount?: number;
  userRating?: number;
  similarBooks?: RelatedBook[];
  otherBooksByAuthor?: RelatedBook[];
  isFavorite?: boolean;
}

const BookPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useScrollToTop();

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem("token"); // <-- достаём токен

      const res = await fetch(`/api-nest/books/${id}?t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}, // <-- добавляем в headers
      });

      if (!res.ok) throw new Error(`Ошибка ${res.status}`);

      const data = await res.json();
      console.log("📚 BOOK DATA:", data);

      // Обрабатываем API, независимо от структуры
      const rootBook = data.book ?? data;

      const safeBook: Book = {
        ...rootBook,

        // ✅ нормализуем издателя
        publisher: rootBook.publisher
          ? rootBook.publisher
          : rootBook.publisher_id
          ? {
              id: rootBook.publisher_id,
              name:
                rootBook.publisher_name ??
                `Издательство #${rootBook.publisher_id}`,
            }
          : undefined,

        authors: Array.isArray(rootBook.authors) ? rootBook.authors : [],
        tags: Array.isArray(rootBook.tags) ? rootBook.tags : [],
        comments: Array.isArray(rootBook.comments) ? rootBook.comments : [],
        similarBooks: Array.isArray(data.similarBooks)
          ? data.similarBooks
          : rootBook.similarBooks ?? [],
        otherBooksByAuthor: Array.isArray(data.otherBooksByAuthor)
          ? data.otherBooksByAuthor
          : rootBook.otherBooksByAuthor ?? [],
        isFavorite: Boolean(rootBook.isFavorite),
      };

      setBook(safeBook);
    } catch (err) {
      console.error("Ошибка загрузки книги:", err);
      setError("Не удалось загрузить данные книги");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}>Ошибка: {error}</div>;
  if (!book) return <div className={styles.container}>Книга не найдена</div>;

  return (
    <div className={styles.pageWrapper}>
      <BackZone to="/BooksPage" />
      <div className={styles.container}>
        <BookInfo book={book} />
        <BookTags tags={book.tags} />
        <BookRating
          book={book}
          isAuthenticated={isAuthenticated}
          setBook={setBook}
        />
        <BookGallery book={book} />
        <BookComments
          book={book}
          isAuthenticated={isAuthenticated}
          onCommentAdded={(comment) =>
            setBook((prev) =>
              prev
                ? { ...prev, comments: [...(prev.comments || []), comment] }
                : prev
            )
          }
        />
      </div>
    </div>
  );
};

export default BookPage;
