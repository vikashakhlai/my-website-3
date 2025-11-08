import { Link } from "react-router-dom";
import styles from "./BookGallery.module.css";

export interface BookItem {
  id: number;
  title: string;
  cover_url?: string | null;
}

interface BookGalleryProps {
  books: BookItem[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

const BookGallery = ({
  books,
  title,
  emptyMessage = "Пока нет книг.",
  className,
}: BookGalleryProps) => {
  if (!books || books.length === 0) {
    return (
      <div className={`${styles.section} ${className || ""}`}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.section} ${className || ""}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.list}>
        {books.map((book) => (
          <Link to={`/books/${book.id}`} key={book.id} className={styles.item}>
            <img
              src={book.cover_url || "/no-cover.png"}
              alt={book.title}
              className={styles.cover}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BookGallery;

