import { Link } from "react-router-dom";
import styles from "./BookGallery.module.css";
import type { Book, RelatedBook } from "./BookPage";

interface BookGalleryProps {
  book: Book;
}

const BookGallery = ({ book }: BookGalleryProps) => {
  const { similarBooks = [], otherBooksByAuthor = [], authors = [] } = book;

  // ✅ Исключаем текущую книгу
  const filteredSimilar = similarBooks.filter((b) => b.id !== book.id);
  const filteredByAuthor = otherBooksByAuthor.filter((b) => b.id !== book.id);

  return (
    <>
      {filteredSimilar.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.title}>Похожие книги</h2>
          <div className={styles.list}>
            {filteredSimilar.map((b: RelatedBook) => (
              <Link to={`/books/${b.id}`} key={b.id} className={styles.item}>
                <img
                  src={b.cover_url || "/no-cover.png"}
                  alt={b.title}
                  className={styles.cover}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {filteredByAuthor.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.title}>
            {authors.length === 1
              ? `Другие книги автора: ${authors[0].fullName}`
              : "Другие книги авторов"}
          </h2>
          <div className={styles.list}>
            {filteredByAuthor.map((b: RelatedBook) => (
              <Link to={`/books/${b.id}`} key={b.id} className={styles.item}>
                <img
                  src={b.cover_url || "/no-cover.png"}
                  alt={b.title}
                  className={styles.cover}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default BookGallery;
