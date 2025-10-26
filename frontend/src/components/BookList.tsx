import { Grid, GridItem } from "@chakra-ui/react";
import BookCard from "./BookCard";
import { Book } from "../pages/types/Book";

interface BookListProps {
  books?: Book[];
}

const BookList = ({ books = [] }: BookListProps) => {
  console.log("📚 Books data:", books);
  return (
    <Grid
      templateColumns={{
        base: "1fr",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
        lg: "repeat(5, 1fr)",
        xl: "repeat(auto-fit, minmax(230px, 1fr))",
      }}
      gap="6"
    >
      {books.map((book) => (
        <GridItem key={book.id}>
          <BookCard {...book} />
        </GridItem>
      ))}
    </Grid>
  );
};

export default BookList;
