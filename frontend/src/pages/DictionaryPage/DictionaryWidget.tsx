import React, { useState, useEffect, useRef } from "react";
import styles from "./DictionaryWidget.module.css";
import ArabicKeyboard from "./ArabicKeyboard";
import {
  SearchResult,
  RootGroupedResult,
  Suggestion,
  RootGroupedResultWithSearchedForm,
  SearchedForm,
} from "./types";
import { normalizeArabic, enrichVerbForms } from "./utils/dictionaryUtils";

interface DictionaryWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const DictionaryWidget: React.FC<DictionaryWidgetProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rootResults, setRootResults] =
    useState<RootGroupedResultWithSearchedForm | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔍 Поиск слова → находим корень → загружаем все слова с этим корнем
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setRootResults(null);
      return;
    }

    setLoading(true);
    setSuggestions([]);
    setShowKeyboard(false);

    try {
      // 1️⃣ Поиск по слову или форме
      const res = await fetch(
        `/api-nest/dictionary/search?query=${encodeURIComponent(searchTerm)}`
      );
      const data: SearchResult = await res.json();

      if (!data.results || data.results.length === 0) {
        setRootResults({ root: null, grouped: {} });
        return;
      }

      // 2️⃣ Собираем все уникальные корни
      const uniqueRoots = Array.from(
        new Set(data.results.map((w) => w.root_ar).filter(Boolean))
      );

      // 3️⃣ Загружаем все слова по каждому корню
      const allRootData: RootGroupedResult[] = await Promise.all(
        uniqueRoots.map(async (root) => {
          const r = await fetch(
            `/api-nest/dictionary/by-root?root=${encodeURIComponent(root!)}`
          );
          return await r.json();
        })
      );

      // 4️⃣ Объединяем все grouped
      const mergedGrouped: RootGroupedResult["grouped"] = {};
      for (const rd of allRootData) {
        for (const [pos, words] of Object.entries(rd.grouped)) {
          if (!mergedGrouped[pos]) mergedGrouped[pos] = [];
          mergedGrouped[pos].push(...words);
        }
      }

      // 5️⃣ Находим форму, если искали глагол в форме
      let foundForm: SearchedForm | undefined;
      for (const pos of Object.values(mergedGrouped)) {
        for (const word of pos) {
          const forms = enrichVerbForms(word.verb_forms || []);
          for (const form of forms) {
            if (normalizeArabic(form.form_ar) === normalizeArabic(searchTerm)) {
              foundForm = {
                form_ar: form.form_ar,
                form_number: form.form_number,
                meaning_ru: form.meaning_ru,
                form_roman: form.form_roman,
              };
              break;
            }
          }
          if (foundForm) break;
        }
        if (foundForm) break;
      }

      // 6️⃣ Сохраняем в состояние
      setRootResults({
        root: uniqueRoots.join(", "),
        grouped: mergedGrouped,
        searched_form: foundForm,
      });
    } catch (err) {
      console.error("Ошибка поиска:", err);
      setRootResults({ root: null, grouped: {} });
    } finally {
      setLoading(false);
    }
  };

  // Клик по подсказке
  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSearch(suggestion.word_ar);
    setSuggestions([]);
    setShowKeyboard(false);
    inputRef.current?.focus();
  };

  // 🔠 Автодополнение
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api-nest/dictionary/autocomplete?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Ошибка автодополнения:", err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Клавиатура
  const handleKeyPress = (char: string) => {
    if (char === "Bksp") {
      setQuery((prev) => prev.slice(0, -1));
    } else {
      setQuery((prev) => prev + char);
    }
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const toggleKeyboard = () => {
    setShowKeyboard(!showKeyboard);
    if (showKeyboard) setSuggestions([]);
  };

  const handleTranslate = () => {
    if (query.trim()) {
      handleSearch(query);
      setShowKeyboard(false);
    } else {
      inputRef.current?.focus();
    }
  };

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isOpen &&
        !target.closest(`.${styles.widget}`) &&
        !target.closest(`.${styles.widgetTrigger}`)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3>Арабско-русский словарь</h3>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Закрыть"
        >
          &times;
        </button>
      </div>

      {/* 🔍 Поисковая строка */}
      <form onSubmit={handleSubmit} className={styles.searchSection}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Слово на русском или арабском..."
          className={styles.searchInput}
          autoFocus
        />
        <button
          type="button"
          className={styles.keyboardToggle}
          onClick={toggleKeyboard}
          aria-label="Арабская клавиатура"
        >
          ﻉ
        </button>
        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((sug) => (
              <div
                key={`${sug.word_ar}-${sug.word_ru}`}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(sug)}
                dangerouslySetInnerHTML={{
                  __html: sug.label.replace(
                    new RegExp(
                      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                      "gi"
                    ),
                    "<mark>$1</mark>"
                  ),
                }}
              />
            ))}
          </div>
        )}
      </form>

      {/* Клавиатура */}
      {showKeyboard && (
        <div className={styles.keyboardContainer}>
          <ArabicKeyboard
            variant="widget"
            onKeyPress={handleKeyPress}
            onClose={() => setShowKeyboard(false)}
            onClear={() => setQuery("")}
            onToggleLang={() => setSuggestions([])}
            onTranslate={handleTranslate}
          />
        </div>
      )}

      {/* Загрузка */}
      {loading && <p className={styles.loading}>Загрузка...</p>}

      {/* Результаты */}
      {rootResults && (
        <div className={styles.results}>
          {/* 🔹 Вы искали */}
          {rootResults.searched_form && (
            <div className={styles.searchedForm}>
              <h4>Вы искали:</h4>
              <div className={styles.formItem}>
                <div className={styles.formRoman}>
                  {rootResults.searched_form.form_roman}
                </div>
                <div className={styles.formArabic}>
                  {rootResults.searched_form.form_ar}
                </div>
                <div className={styles.formMeaning}>
                  {rootResults.searched_form.meaning_ru}
                </div>
              </div>
            </div>
          )}

          {/* 🔹 Основные результаты */}
          {Object.entries(rootResults.grouped).map(([pos, words]) => (
            <div key={pos} className={styles.posGroup}>
              <h4 className={styles.posTitle}>
                {pos === "глагол"
                  ? "Глаголы"
                  : pos === "существительное"
                  ? "Существительные"
                  : pos}
              </h4>
              {words.length > 0 ? (
                words.map((word) => (
                  <div key={word.id} className={styles.wordCard}>
                    <div className={styles.arabicWord}>
                      {word.word_ar || "—"}
                    </div>
                    <div className={styles.russianWord}>{word.word_ru}</div>
                  </div>
                ))
              ) : (
                <p className={styles.noResults}>Ничего не найдено.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !rootResults && query && (
        <p className={styles.noResults}>Ничего не найдено.</p>
      )}
    </div>
  );
};

export default DictionaryWidget;
