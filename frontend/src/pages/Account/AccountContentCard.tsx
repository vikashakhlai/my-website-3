import BookCard from "../../components/BookCard";
import ArticleCard from "../../components/ArticleCard";
import DialectCard from "../../components/DialectCard";
import PersonCard from "../../components/PersonCard";
import StudentBookCard from "../StudentBookPage/StudentBookCard";
import styles from "./AccountHome.module.css";
import { AccountFavoriteItem, RecommendationItem } from "../../api/account";
import { Book } from "../../types/Book";
import { Article } from "../../types/article";
import { Media } from "../../types/media";
import { PersonalityPreview } from "../../types/Personality";
import { TextBookProps } from "../../types/TextBook";

type ContentItem = AccountFavoriteItem | RecommendationItem;

interface AccountContentCardProps {
  item: ContentItem;
}

const renderContent = (item: ContentItem) => {
  switch (item.type) {
    case "book":
      return <BookCard {...(item.data as Book)} />;
    case "textbook":
      return <StudentBookCard book={item.data as TextBookProps} type="middle" />;
    case "article":
      return <ArticleCard article={item.data as Article} />;
    case "media":
      return <DialectCard media={item.data as Media} />;
    case "personality":
      return <PersonCard person={item.data as PersonalityPreview} />;
    default:
      return (
        <div className={styles.emptyState}>
          <p>Контент временно недоступен</p>
        </div>
      );
  }
};

export const AccountContentCard = ({ item }: AccountContentCardProps) => {
  const content = renderContent(item);
  const typeClass = styles[`contentCard-${item.type}`] || "";

  return <div className={`${styles.contentCard} ${typeClass}`.trim()}>{content}</div>;
};

