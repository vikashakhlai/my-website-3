// src/components/exercises/FlashcardsExercise/FlashcardsExercise.tsx
import React, { useState } from "react";
import type { FlashcardsExercise } from "../../types/article";
import styles from "./FlashcardsExercise.module.css";

interface FlashcardsExerciseProps {
  exercise: FlashcardsExercise;
}

const FlashcardsExercise: React.FC<FlashcardsExerciseProps> = ({
  exercise,
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleCard = (itemId: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className={styles.exerciseContainer}>
      <div className={styles.instructions}>
        {exercise.instructionAr && (
          <p dir="rtl" className={styles.instructionAr}>
            {exercise.instructionAr}
          </p>
        )}
        {exercise.instructionRu && (
          <p className={styles.instructionRu}>{exercise.instructionRu}</p>
        )}
      </div>

      <div className={styles.cardsGrid}>
        {exercise.items.map((item) => (
          <div
            key={item.id}
            className={`${styles.card} ${
              flippedCards[item.id] ? styles.flipped : ""
            }`}
            onClick={() => toggleCard(item.id)}
            role="button"
            tabIndex={0}
            aria-label={`Карточка: ${item.wordAr}. Нажмите для перевода.`}
          >
            <div className={styles.cardFront}>
              <p dir="rtl" className={styles.wordAr}>
                {item.wordAr}
              </p>
            </div>
            <div className={styles.cardBack}>
              <p className={styles.wordRu}>{item.wordRu}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardsExercise;
