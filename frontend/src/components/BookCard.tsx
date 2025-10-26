import "./BookCard.css";
import { Link } from "react-router-dom";
import { Book } from "../pages/types/Book";
import { getMediaUrl } from "../utils/media";

const BookCard = ({ id, title, cover_url, tags }: Book) => {
  const displayImage = getMediaUrl(cover_url);
  const displayTheme =
    tags && tags.length > 0
      ? tags.map((tag) => tag.name).join(", ")
      : "Без темы";

  return (
    <Link to={`/books/${id}`}>
      <div className="container">
        <div className="profileCard">
          <div className="profileImage">
            <img src={displayImage} alt={title} />
            {displayTheme && <div className="theme">{displayTheme}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
