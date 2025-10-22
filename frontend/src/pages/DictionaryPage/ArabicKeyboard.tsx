import React, { useState, useEffect } from "react";
import styles from "./ArabicKeyboard.module.css";

interface ArabicKeyboardProps {
  onKeyPress: (char: string) => void;
  onClose: () => void;
  onClear: () => void;
  onToggleLang: () => void;
  onTranslate: () => void;
  variant?: "default" | "widget";
}

const ArabicKeyboard: React.FC<ArabicKeyboardProps> = ({
  onKeyPress,
  onClose,
  onClear,
  onToggleLang,
  onTranslate,
  variant = "default",
}) => {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [currentLang, setCurrentLang] = useState<"arabic" | "russian">(
    "arabic"
  );

  // ====== Добавляем глобальный обработчик клавиши Shift (toggle) ======
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        e.preventDefault();
        setIsShiftActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  // =====================================================================

  // Основная арабская раскладка
  const arabicLetters = [
    ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
    ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
    ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ", "ذ"], // добавили ذ
  ];

  // Диакритические и спец. символы (Shift режим)
  const diacriticsAndSpecial = [
    ["أ", "إ", "آ", "ؤ", "ئ", "ة", "ى", "لا", "ء", "و", "ي", "ا"],
    ["َ", "ُ", "ِ", "ً", "ٌ", "ٍ", "ّ", "ْ", "ٓ", "ٔ", "ٕ", "ـ"],
  ];

  // Русская раскладка
  const russianLetters = [
    ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
    ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
    ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
  ];

  const currentLayout =
    currentLang === "russian"
      ? russianLetters
      : isShiftActive
      ? diacriticsAndSpecial
      : arabicLetters;

  const handleShiftToggle = () => setIsShiftActive((prev) => !prev);

  const handleToggleLang = () => {
    const newLang = currentLang === "arabic" ? "russian" : "arabic";
    setCurrentLang(newLang);
    onToggleLang();
  };

  const handleSpace = () => onKeyPress(" ");
  const handleBackspace = () => onKeyPress("Bksp");

  return (
    <div
      className={`${styles.virtualKeyboard} ${
        variant === "widget" ? styles.widgetKeyboard : ""
      }`}
    >
      {/* Верхняя панель */}
      <div className={styles.keyboardRow}>
        <button
          className={`${styles.keyButton} ${styles.serviceKey}`}
          onClick={onClose}
        >
          Закрыть
        </button>
        <div style={{ flex: 1 }} />
        <button
          className={`${styles.keyButton} ${styles.serviceKey}`}
          onClick={onClear}
        >
          Очистить
        </button>
        <button
          className={`${styles.keyButton} ${styles.serviceKey} ${styles.actionKey}`}
          onClick={handleBackspace}
        >
          Bksp
        </button>
      </div>

      {/* Основные клавиши */}
      {currentLayout.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.keyboardRow}>
          {row.map((char, idx) => (
            <button
              key={`${rowIndex}-${idx}`}
              className={styles.keyButton}
              onClick={() => onKeyPress(char)}
            >
              {char}
            </button>
          ))}
        </div>
      ))}

      {/* Нижний блок управления */}
      <div className={`${styles.keyboardRow} ${styles.bottomControls}`}>
        <div className={styles.bottomLeft}>
          <button
            className={`${styles.keyButton} ${styles.serviceKey} ${
              styles.actionKey
            } ${isShiftActive ? styles.shiftActive : ""}`}
            onClick={handleShiftToggle}
          >
            {isShiftActive ? "↑" : "Shift"}
          </button>
          <button
            className={`${styles.keyButton} ${styles.serviceKey} ${styles.space}`}
            onClick={handleSpace}
          >
            Пробел
          </button>
        </div>

        <div className={styles.bottomRight}>
          <button
            className={`${styles.keyButton} ${styles.serviceKey} ${styles.langToggle}`}
            onClick={handleToggleLang}
          >
            {currentLang === "arabic"
              ? "Арабский → Русский"
              : "Русский → Арабский"}
          </button>
          <button
            className={`${styles.keyButton} ${styles.serviceKey} ${styles.actionKey}`}
            onClick={onTranslate}
          >
            Перевод
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArabicKeyboard;
