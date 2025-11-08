import React from "react";
import { Heart } from "lucide-react";
import "./FavoriteButton.css";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  disabled?: boolean;
  variant?: "corner" | "elegant" | "default";
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  disabled = false,
  variant = "default",
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`favorite-btn ${isFavorite ? "active" : ""} ${variant}`}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart className="icon" />
    </button>
  );
};

export default FavoriteButton;
