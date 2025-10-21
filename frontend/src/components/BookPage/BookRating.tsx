import { useEffect, useState } from "react";
import styles from "./BookRating.module.css";

const BookRating = ({ book, isAuthenticated, setBook }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(
    book.userRating ?? null
  );

  useEffect(() => {
    setUserRating(book.userRating ?? null);
  }, [book.userRating]);

  const handleRate = async (rating: number) => {
    if (!isAuthenticated) {
      alert("Необходимо войти, чтобы оценить книгу");
      return;
    }

    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api-nest/books/${book.id}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      if (!res.ok) throw new Error("Не удалось сохранить оценку");

      setUserRating(rating);

      // подгружаем обновлённую среднюю оценку
      const updated = await fetch(`/api-nest/books/${book.id}/ratings`);
      if (updated.ok) {
        const ratingData = await updated.json();
        setBook((prev) => ({ ...prev, ...ratingData }));
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении оценки");
    }
  };

  return (
    <div className={styles.ratingSection}>
      <strong>Оцените книгу:</strong>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= (hover ?? userRating ?? 0) ? styles.filled : ""
            }`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => handleRate(star)}
          >
            ★
          </span>
        ))}
      </div>
      {typeof book.averageRating === "number" && (
        <div className={styles.average}>
          Средняя оценка: {book.averageRating.toFixed(1)} ⭐ (
          {book.ratingCount ?? 0} оценок)
        </div>
      )}
    </div>
  );
};

export default BookRating;
