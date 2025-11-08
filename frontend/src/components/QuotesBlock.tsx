import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./QuotesBlock.css";
import { api } from "../api/auth";

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
        const { data } = await api.get("/quotes/random?count=2");
        setQuotes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <section className="quotes-section">
      <div className="quotes-grid">
        {quotes.map((quote) => (
          <div key={quote.id} className="quote-card">
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
              <span className="quote-author">Арабская мудрость</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuotesBlock;
