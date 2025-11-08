import { Link } from "react-router-dom";
import styles from "./BookInfo.module.css";
import { Book } from "./BookPage";
import FavoriteButton from "../../components/FavoriteButton";

interface BookInfoProps {
  book: Book;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const BookInfo = ({ book, isFavorite, onToggleFavorite }: BookInfoProps) => {
  const cover =
    book.cover_url && book.cover_url.startsWith("http")
      ? book.cover_url
      : book.cover_url;

  return (
    <div className={styles.mainContent}>
      <div className={styles.coverWrapper}>
        {cover && <img src={cover} alt={book.title} className={styles.cover} />}
        <div className={styles.favoriteButtonWrapper}>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
            variant="corner"
          />
        </div>
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
                    {a.fullName}{" "}
                  </Link>
                </span>
              ))
            : "Не указаны"}
        </div>

        {book.description && (
          <div className={styles.description}>{book.description}</div>
        )}
      </div>
    </div>
  );
};

export default BookInfo;
