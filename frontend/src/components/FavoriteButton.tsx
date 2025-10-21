import { Sun } from "lucide-react";
import React from "react";
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
      className={`button ${isFavorite ? "active" : ""}`}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Sun className="icon" />
    </button>
  );
};

export default FavoriteButton;
