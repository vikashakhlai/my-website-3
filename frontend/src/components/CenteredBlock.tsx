import { Box, Button, Image, Text, VStack } from "@chakra-ui/react";
import CenteredBlockImg from "../assets/Horse.jpg";

const CenteredBlock = () => {

  return (
    <Box pos="relative" overflow="hidden">
      <Image
        src={CenteredBlockImg}
        width="full"
        height="full"
        objectFit="contain"
        borderRadius="20px"
        overflow="hidden"
      />

      <VStack
        pos="absolute"
        left="0"
        right="0"
        top="0"
        bottom="0"
        justify="center"
        align="center"
        // textAlign="center"
        color="white"
      >
        <Text fontSize="3xl" fontWeight="bold">
          Раскрой всю красоту арабского языка
        </Text>
        <Text fontSize="lg" maxW="md" mt={4}>
          Арабский язык — ключ к пониманию богатого культурного наследия
          Востока. Откройте для себя мир изящных букв, мелодичных звуков и
          глубоких смыслов. Путешествуйте по страницам истории, изучайте
          искусство письма и погружайтесь в магию одного из древнейших языков
          мира.
        </Text>
        <Button size="lg" mt={8} bgColor="white" color="black">
          Начнём!
        </Button>
      </VStack>
    </Box>
  );
};

export default CenteredBlock;
