import { Link } from "react-router-dom";
import styles from "./BookInfo.module.css";
import { Book } from "./BookPage";
import FavoriteButton from "../FavoriteButton";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

interface BookInfoProps {
  book: Book;
}

interface JWTPayload {
  sub: string;
  role: string;
}

const BookInfo = ({ book }: BookInfoProps) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    book.isFavorite ?? false
  );

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Для добавления в избранное нужно войти в аккаунт.");
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      console.log("👤 userId (из токена):", decoded.sub);

      const res = await fetch(`/api-nest/books/${book.id}/favorite`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при изменении избранного");

      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("❌ Ошибка избранного:", err);
    }
  };

  const cover =
    book.cover_url && book.cover_url.startsWith("http")
      ? book.cover_url
      : book.cover_url;

  return (
    <div className={styles.mainContent}>
      <div className={styles.coverWrapper}>
        {cover && <img src={cover} alt={book.title} className={styles.cover} />}
      </div>

      <div className={styles.info}>
        <h1 className={styles.title}>{book.title}</h1>

        {book.publisher && (
          <div className={styles.property}>
            <strong>Издательство:</strong> <span>{book.publisher.name}</span>
          </div>
        )}

        <div className={styles.property}>
          <strong>Год издания:</strong> {book.publication_year ?? "—"}
        </div>

        <div className={styles.property}>
          <strong>Страниц:</strong> {book.pages ?? "—"}
        </div>

        <div className={styles.property}>
          <strong>Авторы:</strong>{" "}
          {book.authors && book.authors.length > 0
            ? book.authors.map((a, i) => (
                <span key={a.id}>
                  {i > 0 && ", "}
                  <Link to={`/authors/${a.id}`} className={styles.authorLink}>
                    {a.full_name}
                  </Link>
                </span>
              ))
            : "Не указаны"}
        </div>

        <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />

        {book.description && (
          <div className={styles.description}>{book.description}</div>
        )}
      </div>
    </div>
  );
};

export default BookInfo;
