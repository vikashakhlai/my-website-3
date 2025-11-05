// FillInTheBlanksExercise.tsx
import React, { useState, useRef, useEffect } from "react";
import styles from "./FillInTheBlanksExercise.module.css";
import {
  FillInTheBlanksExercise as FillInTheBlanksExerciseType,
  FillInTheBlanksItem,
} from "../../types/article";

interface WordOptionProps {
  word: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const WordOption: React.FC<WordOptionProps> = ({
  word,
  isSelected,
  isDisabled,
  onClick,
}) => {
  return (
    <button
      className={`${styles.wordOption} ${isSelected ? styles.selected : ""} ${
        isDisabled ? styles.disabled : ""
      }`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {word}
    </button>
  );
};

interface BlankSlotProps {
  value: string | null;
  onClick: () => void;
  isCorrect: boolean | null;
  isWrong: boolean | null;
}

const BlankSlot: React.FC<BlankSlotProps> = ({
  value,
  onClick,
  isCorrect,
  isWrong,
}) => {
  const slotClass = `${styles.blankSlot} ${
    isCorrect ? styles.correct : isWrong ? styles.wrong : ""
  }`;

  return (
    <span className={slotClass} onClick={onClick}>
      {value || "\u00A0"}
    </span>
  );
};

interface FillInTheBlanksExerciseProps {
  exercise: FillInTheBlanksExerciseType;
}

const FillInTheBlanksExercise: React.FC<FillInTheBlanksExerciseProps> = ({
  exercise,
}) => {
  const { instructionRu, items } = exercise;

  // ✅ Все хуки — строго в начале, безусловно
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>(
    {}
  );
  const [feedback, setFeedback] = useState<
    Record<number, "correct" | "wrong" | null>
  >({});

  const audioCorrectRef = useRef<HTMLAudioElement | null>(null);
  const audioIncorrectRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioCorrectRef.current = new Audio("/sounds/correct.mp3");
    audioIncorrectRef.current = new Audio("/sounds/incorrect.mp3");

    return () => {
      audioCorrectRef.current?.pause();
      audioIncorrectRef.current?.pause();
    };
  }, []);

  // ✅ Проверка данных — ДО любых операций с items
  if (!Array.isArray(items)) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{instructionRu || "Упражнение"}</h2>
        <p className={styles.error}>Некорректные данные упражнения</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{instructionRu || "Упражнение"}</h2>
        <p className={styles.error}>Нет заданий для отображения.</p>
      </div>
    );
  }

  // === Логика компонента ===

  const playSound = (type: "correct" | "wrong") => {
    const audio =
      type === "correct" ? audioCorrectRef.current : audioIncorrectRef.current;
    if (audio) {
      audio.play().catch((err) => {
        console.warn("Не удалось воспроизвести звук:", err);
      });
    }
  };

  const handleWordClick = (word: string) => {
    if (usedWords.has(word)) return;
    setSelectedWord(word);
  };

  const handleBlankClick = (itemIndex: number) => {
    if (!selectedWord || itemIndex < 0 || itemIndex >= items.length) return;

    const correctAnswer = items[itemIndex].correctAnswer;

    if (selectedWord === correctAnswer) {
      setUsedWords((prev) => new Set([...prev, selectedWord]));
      setCurrentAnswers((prev) => ({ ...prev, [itemIndex]: selectedWord }));
      setFeedback((prev) => ({ ...prev, [itemIndex]: "correct" }));
      playSound("correct");

      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [itemIndex]: null }));
      }, 1500);
    } else {
      setFeedback((prev) => ({ ...prev, [itemIndex]: "wrong" }));
      playSound("wrong");

      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [itemIndex]: null }));
      }, 1500);
    }

    setSelectedWord(null);
  };

  const renderSentence = (item: FillInTheBlanksItem, index: number) => {
    const answer = currentAnswers[index];
    const feedbackStatus = feedback[index];

    return (
      <div className={styles.sentence} key={item.id}>
        <span className={styles.number}>{index + 1}.</span>
        <span className={styles.textPart}>{item.partBefore}</span>
        <BlankSlot
          value={answer}
          onClick={() => handleBlankClick(index)}
          isCorrect={feedbackStatus === "correct"}
          isWrong={feedbackStatus === "wrong"}
        />
        <span className={styles.textPart}>{item.partAfter}</span>
      </div>
    );
  };

  // ✅ Безопасное извлечение опций — только после проверки items
  const allOptions = items.flatMap((item) => item.options || []);
  const uniqueOptions = Array.from(new Set(allOptions));

  const VocabularyTable: React.FC<{ items: FillInTheBlanksItem[] }> = ({
    items,
  }) => {
    // Убираем дубликаты по арабскому термину (или по паре)
    const uniqueTerms = Array.from(
      new Map(items.map((item) => [item.wordAr, item])).values()
    );

    if (uniqueTerms.length === 0) return null;

    return (
      <div className={styles.vocabularyTable}>
        <h3 className={styles.tableTitle}>Словарь терминов</h3>
        <table>
          <thead>
            <tr>
              <th>Русский</th>
              <th>Арабский</th>
            </tr>
          </thead>
          <tbody>
            {uniqueTerms.map((item, i) => (
              <tr key={i}>
                <td>{item.wordRu}</td>
                <td dir="rtl" lang="ar">
                  {item.wordAr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <VocabularyTable items={items} />
      <h2 className={styles.title}>{instructionRu}</h2>

      <div className={styles.optionsContainer}>
        {uniqueOptions.map((word) => (
          <WordOption
            key={word}
            word={word}
            isSelected={selectedWord === word}
            isDisabled={usedWords.has(word)}
            onClick={() => handleWordClick(word)}
          />
        ))}
      </div>

      <div className={styles.sentencesContainer}>
        {items.map((item, index) => renderSentence(item, index))}
      </div>
    </div>
  );
};

export default FillInTheBlanksExercise;
