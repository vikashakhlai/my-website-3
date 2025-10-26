// src/components/exercises/MatchingPairsExercise/MatchingPairsExercise.tsx
import React, { useState, useEffect, useMemo } from "react";
import type { MatchingPairsExercise } from "../../pages/types/article";
import { shuffleArray } from "../../utils/shuffleArray";
import styles from "./MatchingPairsExercise.module.css";

interface MatchingPairsExerciseProps {
  exercise: MatchingPairsExercise;
}

const MatchingPairsExercise: React.FC<MatchingPairsExerciseProps> = ({
  exercise,
}) => {
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [selectedDefId, setSelectedDefId] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<{
    termId: number;
    defId: number;
    isCorrect: boolean;
  } | null>(null);

  // 🔑 Перемешиваем определения ОДИН РАЗ при монтировании
  const [shuffledDefinitions, setShuffledDefinitions] = useState<
    MatchingPairsExercise["items"]
  >([]);

  // Запускаем один раз
  useEffect(() => {
    setShuffledDefinitions(shuffleArray([...exercise.items]));
  }, [exercise.items]);

  const unmatchedItems = useMemo(() => {
    return exercise.items.filter((item) => !matchedPairs[item.id]);
  }, [exercise.items, matchedPairs]);

  // Фильтруем перемешанный массив, оставляя только несопоставленные
  const visibleDefinitions = useMemo(() => {
    return shuffledDefinitions.filter((item) => !matchedPairs[item.id]);
  }, [shuffledDefinitions, matchedPairs]);

  const handleTermClick = (termId: number) => {
    if (matchedPairs[termId]) return;
    setSelectedTermId(termId);
    setSelectedDefId(null);
    setFeedback(null);
  };

  const handleDefinitionClick = (defId: number) => {
    if (matchedPairs[defId]) return;
    if (selectedTermId === null) return;

    const termItem = exercise.items.find((i) => i.id === selectedTermId);
    const defItem = exercise.items.find((i) => i.id === defId);

    const isCorrect = termItem?.correctAnswer === defItem?.correctAnswer;

    setFeedback({ termId: selectedTermId, defId, isCorrect });

    if (isCorrect) {
      setMatchedPairs((prev) => ({ ...prev, [selectedTermId]: defId }));
      const audio = new Audio("/sounds/correct.mp3");
      audio.play().catch((e) => console.log("Audio play failed:", e));
    } else {
      const audio = new Audio("/sounds/incorrect.mp3");
      audio.play().catch((e) => console.log("Audio play failed:", e));
    }

    setSelectedTermId(null);
    setSelectedDefId(null);
  };

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

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

      <div className={styles.matchingArea}>
        {/* Левая колонка: термины (в исходном порядке) */}
        <div className={styles.termsColumn}>
          <h3 dir="rtl" className={styles.columnTitle}>
            المصطلحات
          </h3>
          {unmatchedItems.map((item) => {
            const isSelected = selectedTermId === item.id;
            const isFeedback = feedback && feedback.termId === item.id;
            let termClass = styles.termItem;

            if (isFeedback) {
              termClass += feedback.isCorrect
                ? ` ${styles.correct}`
                : ` ${styles.incorrect}`;
            } else if (isSelected) {
              termClass += ` ${styles.selected}`;
            }

            return (
              <div
                key={`term-${item.id}`}
                className={termClass}
                onClick={() => handleTermClick(item.id)}
                dir="rtl"
              >
                {item.wordAr}
              </div>
            );
          })}
        </div>

        {/* Правая колонка: определения (перемешаны ОДИН РАЗ) */}
        <div className={styles.definitionsColumn}>
          <h3 dir="rtl" className={styles.columnTitle}>
            التعريفات
          </h3>
          {visibleDefinitions.map((item) => {
            const isSelected = selectedDefId === item.id;
            const isFeedback = feedback && feedback.defId === item.id;
            let defClass = styles.definitionItem;

            if (isFeedback) {
              defClass += feedback.isCorrect
                ? ` ${styles.correct}`
                : ` ${styles.incorrect}`;
            } else if (isSelected) {
              defClass += ` ${styles.selected}`;
            }

            return (
              <div
                key={`def-${item.id}`}
                className={defClass}
                onClick={() => handleDefinitionClick(item.id)}
                dir="rtl"
              >
                {item.correctAnswer}
              </div>
            );
          })}
        </div>
      </div>

      {/* Сопоставленные пары */}
      {Object.keys(matchedPairs).length > 0 && (
        <div className={styles.matchedPairs}>
          <h4 dir="rtl" className={styles.matchedTitle}>
            الأزواج المطابقة:
          </h4>
          {Object.entries(matchedPairs).map(([termIdStr, defIdStr]) => {
            const termId = Number(termIdStr);
            const defId = Number(defIdStr);
            const termItem = exercise.items.find((i) => i.id === termId);
            const defItem = exercise.items.find((i) => i.id === defId);
            return termItem && defItem ? (
              <div key={termId} className={styles.matchedPair}>
                <span dir="rtl" className={styles.matchedTerm}>
                  {termItem.wordAr}
                </span>
                <span>=</span>
                <span dir="rtl" className={styles.matchedDef}>
                  {defItem.correctAnswer}
                </span>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default MatchingPairsExercise;
