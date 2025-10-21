import { useEffect, useState } from "react";
import CenteredBlock from "../components/CenteredBlock";
import BookList from "../components/BookList";
import QuoteSlider from "../components/QuoteSlider";
import dataQuotes from "../components/dataQuotes";
import { Book } from "../types/Book";
import ArticleCard from "../components/ArticleCard";
import { Article } from "../types/article";
import StudentBookCardBigSlider from "../components/StudentBookCardBigSlider";
import { PersonalityPreview } from "../types/Personality";
import PersonCard from "../components/PersonCard";
import { TextBookProps } from "../types/TextBook";
import "./HomePage.css";
import { api } from "../api/auth";

const HomePage = () => {
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [personalities, setPersonalities] = useState<PersonalityPreview[]>([]);
  const [textbooks, setTextbooks] = useState<TextBookProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 🔹 Используем axios и правильные эндпоинты
        const [booksRes, articlesRes, personalitiesRes, textbooksRes] =
          await Promise.all([
            api.get("/books/latest?limit=10"),
            api.get("/articles/latest"),
            api.get("/personalities/random?limit=3"),
            api.get("/textbooks"),
          ]);

        setLatestBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
        setArticles(Array.isArray(articlesRes.data) ? articlesRes.data : []);
        setPersonalities(
          Array.isArray(personalitiesRes.data) ? personalitiesRes.data : []
        );
        setTextbooks(Array.isArray(textbooksRes.data) ? textbooksRes.data : []);
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-text">{error}</div>;
  }

  return (
    <div className="homepage-container">
      <section className="section center-block">
        <CenteredBlock />
      </section>

      <section className="section">
        <BookList books={latestBooks} />
      </section>

      <section className="section">
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <p className="empty-text">Нет статей</p>
        )}
      </section>

      <section className="section">
        <QuoteSlider quotes={dataQuotes} />
      </section>

      <section className="section">
        {textbooks.length > 0 ? (
          <StudentBookCardBigSlider books={textbooks} />
        ) : (
          <p className="empty-text">Учебники не найдены</p>
        )}
      </section>

      <section className="section grid-section">
        {personalities.length > 0 ? (
          personalities.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))
        ) : (
          <p className="empty-text">Нет личностей</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
