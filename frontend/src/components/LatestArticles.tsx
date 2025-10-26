import { Box } from "@chakra-ui/react";
import ArticleCard from "./ArticleCard";
import { Article } from "../pages/types/article";

export interface Articles {
  articles: Article[];
}

const LatestArticles = ({ articles }: Articles) => {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      {articles
        .filter((article) => article.id)
        .map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
    </Box>
  );
};

export default LatestArticles;
