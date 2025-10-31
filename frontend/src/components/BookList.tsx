import styles from "./BookList.module.css";
import BookCard from "./BookCard";
import { Book } from "../types/Book";

interface BookListProps {
  books?: Book[];
}

const BookList = ({ books = [] }: BookListProps) => {
  return (
    <div className={styles.grid}>
      {books.map((book) => (
        <div key={book.id} className={styles.item}>
          <BookCard {...book} />
        </div>
      ))}
    </div>
  );
};

export default BookList;
