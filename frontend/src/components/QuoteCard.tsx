import { Box, Text } from "@chakra-ui/react";
import "./QuoteCard.css";

export interface Quote {
  id: number;
  textAr: string;
  textRu: string;
  author: string;
  authorPosition: string;
}

const QuoteCard = ({ quote }: { quote: Quote }) => {
  return (
    <Box
      className="quote-card"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      height="100%"
      padding="20px"
    >
      <Text fontSize="xl" fontWeight="bold" direction="rtl" textAlign="right">
        {quote.textAr}
      </Text>
      <Text fontSize="lg" fontWeight="bold" marginTop="10px">
        {quote.author}, {quote.authorPosition}
      </Text>
      <Text fontSize="md" marginTop="10px">
        {quote.textRu}
      </Text>
    </Box>
  );
};

export default QuoteCard;
