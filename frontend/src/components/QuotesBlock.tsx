import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./QuotesBlock.css";
import quotesbg from "../assets/quotes-bg.png"

export interface Quote {
  id: number;
  text_ar: string;
  text_ru: string;
  personality?: {
    id: number;
    full_name: string;
    position?: string;
  } | null;
}

const QuotesBlock = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch("/api-nest/quotes/random?count=2");
        if (!res.ok) throw new Error("Ошибка загрузки цитат");
        const data = await res.json();
        setQuotes(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuotes();
  }, []);

  return (
    <div className="quotes-container">
      {/* Фоновое изображение в разметке */}
      <img
        src={quotesbg}
        alt=""
        aria-hidden="true"
        className="quotes-background"
      />

      {quotes.map((quote, index) => (
        <div key={quote.id} className={`quote-item quote-item-${index + 1}`}>
          <p className="quote-ar">{quote.text_ar}</p>
          <p className="quote-ru">{quote.text_ru}</p>
          {quote.personality ? (
            <Link
              to={`/personalities/${quote.personality.id}`}
              className="quote-author"
            >
              {quote.personality.full_name}
              {quote.personality.position
                ? ` — ${quote.personality.position}`
                : ""}
            </Link>
          ) : (
            <Link to="/personalities" className="quote-author">
              Арабская мудрость
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuotesBlock;
