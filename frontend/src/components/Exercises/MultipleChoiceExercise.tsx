import React, { useState, useMemo } from "react";
import type {
  MultipleChoiceExercise,
  MultipleChoiceItem,
} from "../../types/article";
import { shuffleArray } from "../../utils/shuffleArray";
import styles from "./MultipleChoiceExercise.module.css";

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExercise;
  onAnswerSubmit?: (itemId: number, selectedOption: string) => void;
  showFeedback?: boolean;
}

const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  exercise,
  onAnswerSubmit,
  showFeedback = false,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});

  // ✅ Безопасная генерация вариантов
  const itemsWithLimitedOptions = useMemo(() => {
    return exercise.items.map((item) => {
      const { correctAnswer } = item;
      const options = Array.isArray(item.options) ? item.options : [];

      // Убираем правильный ответ из пула отвлекающих
      const distractors = options.filter((opt) => opt !== correctAnswer);

      // Берём 3 случайных отвлекающих
      const shuffledDistractors = shuffleArray([...distractors]);
      const selectedDistractors = shuffledDistractors.slice(0, 3);

      // ✅ Добавляем правильный ответ, даже если options пустой
      const finalOptions = shuffleArray([
        ...selectedDistractors,
        ...(correctAnswer ? [correctAnswer] : []),
      ]);

      return {
        ...item,
        options: finalOptions.length > 0 ? finalOptions : [correctAnswer ?? ""],
      };
    });
  }, [exercise.items]);

  const handleOptionClick = (item: MultipleChoiceItem, option: string) => {
    const newSelection = { ...selectedAnswers, [item.id]: option };
    setSelectedAnswers(newSelection);

    if (onAnswerSubmit) {
      onAnswerSubmit(item.id, option);
    }
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
        {itemsWithLimitedOptions.map((item) => {
          const isSelected = selectedAnswers[item.id] !== undefined;
          const isCorrect =
            isSelected && selectedAnswers[item.id] === item.correctAnswer;

          return (
            <div key={item.id} className={styles.questionCard}>
              {item.questionAr && (
                <h3 dir="rtl" className={styles.questionAr}>
                  {item.questionAr}
                </h3>
              )}
              {item.questionRu && (
                <h3 className={styles.questionRu}>{item.questionRu}</h3>
              )}

              <div className={styles.optionsGrid}>
                {(item.options ?? []).map((option, idx) => {
                  const isSelectedOption = selectedAnswers[item.id] === option;
                  let optionClass = styles.option;

                  if (isSelected) {
                    if (option === item.correctAnswer) {
                      optionClass += ` ${styles.correct}`;
                    } else if (isSelectedOption && !isCorrect) {
                      optionClass += ` ${styles.incorrect}`;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={optionClass}
                      onClick={() => handleOptionClick(item, option)}
                      disabled={isSelected && !showFeedback}
                      dir="rtl"
                    >
                      {option || "—"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceExercise;
