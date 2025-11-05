import React, { useState, useMemo, useRef, useEffect } from "react";
import type {
  MultipleChoiceExercise,
  MultipleChoiceItem,
} from "../../types/article";
import { shuffleArray } from "../../utils/shuffleArray";
import styles from "./MultipleChoiceExercise.module.css";

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExercise;
  onAnswerSubmit?: (itemId: number, selectedOption: string) => void;
  showFeedback?: boolean; // если true — можно переотвечать (режим тренировки)
}

const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  exercise,
  onAnswerSubmit,
  showFeedback = false,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});

  const audioCorrectRef = useRef<HTMLAudioElement | null>(null);
  const audioWrongRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioCorrectRef.current = new Audio("/sounds/correct.mp3");
    audioWrongRef.current = new Audio("/sounds/incorrect.mp3");
  }, []);

  const playSound = (correct: boolean) => {
    const audio = correct ? audioCorrectRef.current : audioWrongRef.current;
    audio?.play().catch(() => null);
  };

  const itemsWithOptions = useMemo(() => {
    return exercise.items.map((item) => {
      const { correctAnswer } = item;
      const options = Array.isArray(item.options) ? item.options : [];
      const distractors = shuffleArray(
        options.filter((x) => x !== correctAnswer)
      ).slice(0, 3);
      const finalOptions = shuffleArray(
        [correctAnswer, ...distractors].filter(Boolean)
      );
      return { ...item, options: finalOptions };
    });
  }, [exercise.items]);

  const handleOptionClick = (item: MultipleChoiceItem, option: string) => {
    if (!showFeedback && selectedAnswers[item.id]) return;

    const updated = { ...selectedAnswers, [item.id]: option };
    setSelectedAnswers(updated);

    const isCorrect = option === item.correctAnswer;
    playSound(isCorrect);

    onAnswerSubmit?.(item.id, option);
  };

  return (
    <div className={styles.exerciseContainer}>
      {/* === Instructions === */}
      <div className={styles.instructions}>
        {exercise.instructionAr && (
          <p className={styles.instructionAr}>{exercise.instructionAr}</p>
        )}
        {exercise.instructionRu && (
          <p className={styles.instructionRu}>{exercise.instructionRu}</p>
        )}
      </div>

      <div className={styles.questions}>
        {itemsWithOptions.map((item) => {
          const userAnswer = selectedAnswers[item.id];
          return (
            <div key={item.id} className={styles.questionCard}>
              {item.questionAr && (
                <h3 className={styles.questionAr}>{item.questionAr}</h3>
              )}
              {item.questionRu && (
                <h3 className={styles.questionRu}>{item.questionRu}</h3>
              )}

              <div className={styles.optionsGrid}>
                {item.options.map((option, index) => {
                  const isSelected = userAnswer === option;
                  const isCorrect = option === item.correctAnswer;

                  let optionClass = styles.option;
                  if (userAnswer) {
                    if (isCorrect) optionClass += ` ${styles.correct}`;
                    else if (isSelected) optionClass += ` ${styles.incorrect}`;
                  }

                  return (
                    <button
                      key={index}
                      className={optionClass}
                      onClick={() => handleOptionClick(item, option)}
                      disabled={!showFeedback && Boolean(userAnswer)}
                      dir="rtl"
                    >
                      {option}
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
