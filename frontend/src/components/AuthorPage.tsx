import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "./AuthorPage.module.css";
import { api } from "../api/auth";
import BackZone from "../components/BackZone";

interface Author {
  id: number;
  full_name: string;
  bio?: string;
  photo_url?: string;
  books: {
    id: number;
    title: string;
    cover_url: string;
    publication_year: number;
  }[];
}

const AuthorPage = () => {
  useScrollToTop();
  // const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID автора не указан");
      setLoading(false);
      return;
    }

    const fetchAuthor = async () => {
      try {
        const { data } = await api.get(`/authors/${id}`);
        setAuthor(data);
      } catch (err) {
        console.error("Ошибка загрузки автора:", err);
        setError("Не удалось загрузить данные об авторе.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonWrapper}>
          <div className={styles.skeletonPhoto}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLineShort}></div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
      </div>
    );

  if (!author) return <div className={styles.container}>Автор не найден</div>;

  return (
    <div className={styles.container}>
      <BackZone to="../" />

      <div className={styles.headerRow}>
        <div className={styles.photoWrapper}>
          {author.photo_url ? (
            <img
              src={author.photo_url}
              alt={author.full_name}
              className={styles.photo}
            />
          ) : (
            <div className={styles.photoPlaceholder}>🖼️</div>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>{author.full_name}</h1>
          <p className={styles.bioText}>
            {author.bio ? author.bio : "Биография отсутствует."}
          </p>
        </div>
      </div>

      {/* Книги автора */}
      {author.books?.length > 0 ? (
        <div className={styles.booksSection}>
          <h2 className={styles.sectionTitle}>Книги автора</h2>
          <div className={styles.booksGrid}>
            {author.books.map((book) => (
              <Link
                to={`/books/${book.id}`}
                key={book.id}
                className={styles.bookCard}
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className={styles.bookCover}
                />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.noBooks}>Пока нет книг этого автора.</div>
      )}
    </div>
  );
};

export default AuthorPage;
