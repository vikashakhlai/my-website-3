import "./BookCard.css";
import { Link } from "react-router-dom";
import { Book } from "../types/Book";
import { getMediaUrl } from "../utils/media";
import defaultCover from "../assets/default-book.png";
import { useRef } from "react";

const BookCard = ({ id, title, cover_url }: Book) => {
  const displayImage = cover_url ? getMediaUrl(cover_url) : defaultCover;
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = defaultCover;
  };

  // 🔹 Перелив света при движении мыши
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--x", `${x}%`);
    card.style.setProperty("--y", `${y}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) {
      card.style.setProperty("--x", "50%");
      card.style.setProperty("--y", "50%");
    }
  };

  return (
    <Link to={`/books/${id}`} className="bookLink">
      <div
        ref={cardRef}
        className="bookCard"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="bookImage">
          <img src={displayImage} alt={title} onError={handleImgError} />
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
