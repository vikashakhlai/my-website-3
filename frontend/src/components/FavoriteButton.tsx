import React from "react";
import { Heart } from "lucide-react";
import "./FavoriteButton.css";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`favorite-btn ${isFavorite ? "active" : ""}`}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart className="icon" />
    </button>
  );
};

export default FavoriteButton;
