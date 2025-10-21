// src/pages/ArticlesPage.tsx
import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { Article } from "../types/article";
import { Box, Container, Heading } from "@chakra-ui/react";

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // Загружаем ВСЕ статьи (без лимита)
    fetch("/api-nest/articles")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки статей");
        return res.json();
      })
      .then((data) => {
        // Фильтруем статьи без id (защита от undefined)
        setArticles(data.filter((article: Article) => article.id));
      })
      .catch((err) => {
        console.error("Ошибка в ArticlesPage:", err);
      });
  }, []);

  return (
    <Container maxW="container.lg" py="8">
      <Heading mb="6">Все статьи</Heading>
      <Box display="flex" flexDirection="column" gap="6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </Box>
    </Container>
  );
};

export default ArticlesPage;
