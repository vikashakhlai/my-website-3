// src/components/exercises/OpenQuestionExercise/OpenQuestionExercise.tsx
import React, { useState } from "react";
import type { OpenQuestionExercise } from "../../pages/types/article";
import styles from "./OpenQuestionExercise.module.css";

interface OpenQuestionExerciseProps {
  exercise: OpenQuestionExercise;
}

const OpenQuestionExercise: React.FC<OpenQuestionExerciseProps> = ({
  exercise,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );

  const toggleAnswer = (itemId: number) => {
    setExpandedItems((prev) => ({
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

      <div className={styles.questions}>
        {exercise.items.map((item) => (
          <div key={item.id} className={styles.questionCard}>
            {item.questionAr && (
              <h3 dir="rtl" className={styles.questionAr}>
                {item.questionAr}
              </h3>
            )}
            {item.questionRu && (
              <h3 className={styles.questionRu}>{item.questionRu}</h3>
            )}

            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => toggleAnswer(item.id)}
              aria-expanded={expandedItems[item.id]}
              dir="ltr"
            >
              {expandedItems[item.id] ? "▲ Скрыть ответ" : "▼ Показать ответ"}
            </button>

            {expandedItems[item.id] && (
              <div className={styles.answerContainer}>
                <p dir="rtl" className={styles.answerAr}>
                  {item.correctAnswer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenQuestionExercise;
