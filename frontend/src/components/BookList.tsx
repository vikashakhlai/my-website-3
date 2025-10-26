import { Grid, GridItem } from "@chakra-ui/react";
import BookCard from "./BookCard";
import { Book } from "../types/Book";

interface BookListProps {
  books?: Book[];
}

const BookList = ({ books = [] }: BookListProps) => {
  return (
    <Grid
      templateColumns={{
        base: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
        lg: "repeat(5, 1fr)",
      }}
      gap={6}
      justifyContent="center"
    >
      {books.map((book) => (
        <GridItem key={book.id} display="flex" justifyContent="center">
          <BookCard {...book} />
        </GridItem>
      ))}
    </Grid>
  );
};

export default BookList;
