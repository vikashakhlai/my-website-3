// src/pages/AuthorPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "./AuthorPage.module.css";

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
        const response = await fetch(`/api/authors/${id}`);
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }
        const data: Author = await response.json();
        setAuthor(data);
      } catch (err) {
        console.error("Ошибка загрузки автора:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [id]);

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}><p className={styles.error}>Ошибка: {error}</p></div>;
  if (!author) return <div className={styles.container}>Автор не найден</div>;

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <h1 className={styles.title}>{author.full_name}</h1>

      {/* Блок фото + биография */}
      <div className={styles.authorInfo}>
        {/* Фото */}
        <div className={styles.photoWrapper}>
          {author.photo_url ? (
            <img
              src={author.photo_url}
              alt={author.full_name}
              className={styles.photo}
            />
          ) : (
            <div className={styles.placeholder}>🖼️</div>
          )}
        </div>

        {/* Биография */}
        <div className={styles.bio}>
          {author.bio ? (
            <p>{author.bio}</p>
          ) : (
            <p>Биография отсутствует.</p>
          )}
        </div>
      </div>

      {/* Книги автора */}
      {author.books && author.books.length > 0 ? (
        <div className={styles.booksSection}>
          <h2 className={styles.sectionTitle}>Книги автора</h2>
          <div className={styles.booksGrid}>
            {author.books.map((book) => (
              <Link to={`/books/${book.id}`} key={book.id} className={styles.bookCard}>
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className={styles.bookCover}
                />
                {/* <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookYear}>{book.publication_year}</p>
                </div> */}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.noBooks}>
          Пока нет книг этого автора.
        </div>
      )}
    </div>
  );
};

export default AuthorPage;