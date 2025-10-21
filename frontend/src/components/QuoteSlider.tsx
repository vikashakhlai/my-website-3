import { useState } from "react";
import QuoteCard, { Quote } from "./QuoteCard";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import QuoteBckg from "../assets/QouteBckg.jpg";

interface QouteProps {
  quotes: Quote[];
}

const QuoteSlider = ({ quotes }: QouteProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextQuote = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 2) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 2 + quotes.length) % quotes.length
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      height="100%"
      padding="10px"
      position="relative"
      backgroundImage={QuoteBckg}
    >
      <Flex justifyContent="space-around" width="100%" marginTop="20px">
        <IconButton onClick={prevQuote} _hover={{ color: "blue.500" }}>
          <FaArrowLeft />
        </IconButton>
        <QuoteCard quote={quotes[currentIndex]} />
      </Flex>
      <Flex justifyContent="space-around" width="100%" marginTop="20px">
        <QuoteCard quote={quotes[(currentIndex + 1) % quotes.length]} />
        <IconButton onClick={nextQuote} _hover={{ color: "blue.500" }}>
          <FaArrowRight />
        </IconButton>
      </Flex>
    </Box>
  );
};

export default QuoteSlider;
