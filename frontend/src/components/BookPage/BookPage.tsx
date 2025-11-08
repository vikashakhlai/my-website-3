import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BackZone from "../BackZone";
import useScrollToTop from "../../hooks/useScrollToTop";
import styles from "./BookPage.module.css";
import BookInfo from "./BookInfo";
import BookTags from "./BookTags";
import BookGallery from "./BookGallery";
import FavoriteButton from "../../components/FavoriteButton";
import { useFavorites } from "../../hooks/useFavorites";
import { StarRating } from "../../components/StarRating";
import { CommentsSection } from "../../components/CommentsSection";
import { api } from "../../api/auth";

export interface Author {
  id: number;
  fullName: string;
  bio?: string | null;
  photo_url?: string | null;
}

export interface Tag {
  id: number;
  name: string;
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
  averageRating?: number | null;
  ratingCount?: number;
  userRating?: number | null;
  similarBooks?: RelatedBook[];
  otherBooksByAuthor?: RelatedBook[];
  isFavorite?: boolean;
}

const BookPage = () => {
  const { id } = useParams<{ id: string }>();
  // const { isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites("book");
  const [localFavorite, setLocalFavorite] = useState(false);

  useScrollToTop();

  const fetchBook = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/books/${id}?t=${Date.now()}`);
      const rootBook = data.book ?? data;

      const safeBook: Book = {
        ...rootBook,
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
        similarBooks: Array.isArray(data.similarBooks)
          ? data.similarBooks
          : rootBook.similarBooks ?? [],
        otherBooksByAuthor: Array.isArray(data.otherBooksByAuthor)
          ? data.otherBooksByAuthor
          : rootBook.otherBooksByAuthor ?? [],
        isFavorite: Boolean(rootBook.isFavorite),
        // Сохраняем рейтинги из API
        averageRating: rootBook.averageRating ? Number(rootBook.averageRating) : null,
        ratingCount: rootBook.ratingCount ? Number(rootBook.ratingCount) : 0,
        userRating: rootBook.userRating ? Number(rootBook.userRating) : null,
      };

      setBook(safeBook);
    } catch (err) {
      console.error("Ошибка загрузки книги:", err);
      setError("Не удалось загрузить данные книги");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  useEffect(() => {
    if (book?.id) {
      setLocalFavorite(favorites.some((f) => f.id === book.id));
    }
  }, [favorites, book?.id]);

  const handleToggleFavorite = async () => {
    if (!book) return;
    const wasFavorite = favorites.some((f) => f.id === book.id);
    await toggleFavorite(book);
    setLocalFavorite(!wasFavorite);
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}>Ошибка: {error}</div>;
  if (!book) return <div className={styles.container}>Книга не найдена</div>;

  return (
    <div className={styles.pageWrapper}>
      <BackZone to="/BooksPage" label="Вернуться к списку книг" />
      
      <div className={styles.container}>
        <div className={styles.bookSection}>
          {/* Основной контент книги */}
          <div className={styles.bookContent}>
            <div className={styles.header}>
              <div className={styles.titleBlock}>
                <BookInfo book={book} />
              </div>

              <div className={styles.favoriteButtonWrapper}>
                <FavoriteButton
                  isFavorite={localFavorite}
                  onToggle={handleToggleFavorite}
                />
              </div>
            </div>

            <div className={styles.metaBlock}>
              <BookTags tags={book.tags} />
              <div className={styles.ratingWrapper}>
                <StarRating
                  targetType="book"
                  targetId={book.id}
                  average={book.averageRating ?? null}
                  userRating={book.userRating ?? null}
                  onRated={(val) =>
                    setBook((prev) =>
                      prev ? { ...prev, userRating: val } : prev
                    )
                  }
                />
              </div>
            </div>

            <BookGallery book={book} />
            <CommentsSection
              targetType="book"
              targetId={book.id}
              apiBase="/api-nest"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
