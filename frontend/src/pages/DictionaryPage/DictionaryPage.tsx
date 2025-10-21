import React, { useState, useEffect, useRef } from "react";
import styles from "./DictionaryPage.module.css";
import ArabicKeyboard from "./ArabicKeyboard";
import {
  SearchResult,
  RootGroupedResult,
  Suggestion,
  DictionaryWord,
} from "./types";
import {
  hasArabicChars,
  normalizeArabic,
  enrichVerbForms,
} from "./utils/dictionaryUtils";

const DictionaryPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rootResults, setRootResults] = useState<RootGroupedResult | null>(
    null
  );
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // защита от дублей
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const [directResults, setDirectResults] = useState<DictionaryWord[]>([]);

  // 🔹 Загрузка результатов по корню
  const loadRootResults = async (root: string) => {
    setLoading(true);
    setRootResults(null);
    try {
      const res = await fetch(
        `/api-nest/dictionary/by-root?root=${encodeURIComponent(root)}`
      );
      const rootData: RootGroupedResult = await res.json();
      setRootResults(rootData);
    } catch (err) {
      console.error("Ошибка загрузки корня:", err);
      setRootResults(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Основной поиск
  const handleSearch = async (searchTerm: string) => {
    const normalizedTerm = searchTerm.trim();
    if (!normalizedTerm || isSearching) return;

    setIsSearching(true);
    setSuggestions([]);
    setShowKeyboard(false);
    setDirectResults([]);
    setRootResults(null);
    setSearchedQuery(normalizedTerm);
    setLoading(true);

    try {
      const res = await fetch(
        `/api-nest/dictionary/search?query=${encodeURIComponent(
          normalizedTerm
        )}`
      );

      if (!res.ok) throw new Error("Ошибка сети");

      const data: SearchResult = await res.json();

      if (data.results?.length) {
        setDirectResults(data.results);
        const firstWord = data.results[0];
        if (firstWord.root_ar) {
          await loadRootResults(firstWord.root_ar);
        }
      } else {
        setDirectResults([]);
      }
    } catch (err) {
      console.error("Ошибка поиска:", err);
      setDirectResults([]);
      setRootResults(null);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // 🔹 Обработка клика по подсказке
  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.root_ar) {
      loadRootResults(suggestion.root_ar);
    } else {
      handleSearch(suggestion.word_ar);
    }

    if (hasArabicChars(query)) {
      setQuery(normalizeArabic(query));
    }

    setSuggestions([]);
    setShowKeyboard(false);
    inputRef.current?.focus();
  };

  // 🔹 Автодополнение
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

  // 🔹 Работа с экранной клавиатурой
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
    if (showKeyboard) {
      setSuggestions([]);
    }
  };

  const handleTranslate = () => {
    if (query.trim()) {
      handleSearch(query);
      setShowKeyboard(false);
    } else {
      inputRef.current?.focus();
    }
  };

  // 🔹 Скрываем автодополнение при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(`.${styles.searchSection}`) &&
        !target.closest(`.${styles.suggestions}`)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasNoResults =
    !loading &&
    query.trim() !== "" &&
    directResults.length === 0 &&
    !rootResults;

  return (
    <div className={styles.container}>
      <h1>Арабско-русский словарь</h1>

      <form onSubmit={handleSubmit} className={styles.searchSection}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите слово на русском или арабском..."
          className={styles.searchInput}
        />
        <button
          type="button"
          className={styles.keyboardToggle}
          onClick={toggleKeyboard}
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

      {showKeyboard && (
        <div className={styles.keyboardContainer}>
          <ArabicKeyboard
            onKeyPress={handleKeyPress}
            onClose={() => setShowKeyboard(false)}
            onClear={() => setQuery("")}
            onToggleLang={() => setSuggestions([])}
            onTranslate={handleTranslate}
          />
        </div>
      )}

      {loading && <p className={styles.loading}>Загрузка...</p>}

      {/* 🔹 Прямые результаты поиска */}
      {directResults.length > 0 && (
        <div className={styles.results}>
          <h2 className={styles.rootHeader}>Результаты поиска</h2>
          {directResults.map((word) => (
            <div key={word.id} className={styles.wordCard}>
              <div className={styles.wordHeader}>
                <div>
                  <div className={styles.arabicWord}>{word.word_ar}</div>
                  <div className={styles.russianWord}>{word.word_ru}</div>
                </div>
                {word.root_ar && (
                  <div className={styles.rootTag}>
                    <span>Корень:</span>
                    <span>{word.root_ar}</span>
                  </div>
                )}
              </div>

              {word.verb_forms.length > 0 && (
                <div className={styles.verbForms}>
                  <h4>Формы глагола</h4>
                  {Array.from(
                    new Map(
                      enrichVerbForms(word.verb_forms).map((form) => [
                        `${form.form_number}-${form.form_ar}-${form.meaning_ru}`,
                        form,
                      ])
                    ).values()
                  ).map((form, idx) => {
                    const isSearchedForm =
                      searchedQuery &&
                      hasArabicChars(searchedQuery) &&
                      normalizeArabic(form.form_ar) ===
                        normalizeArabic(searchedQuery);

                    return (
                      <div
                        key={`vf-${word.id}-${idx}`}
                        className={`${styles.formItem} ${
                          isSearchedForm ? styles.formItemHighlighted : ""
                        }`}
                      >
                        <div className={styles.formRoman}>
                          {form.form_roman}
                        </div>
                        <div className={styles.formArabic}>{form.form_ar}</div>
                        <div className={styles.formMeaning}>
                          {form.meaning_ru}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {word.examples.length > 0 && (
                <div className={styles.examples}>
                  <h4>Примеры</h4>
                  {Array.from(
                    new Set(word.examples.map((ex) => JSON.stringify(ex)))
                  ).map((exStr, idx) => {
                    const ex = JSON.parse(exStr);
                    return (
                      <div
                        key={`ex-${word.id}-${idx}`}
                        className={styles.exampleItem}
                      >
                        <div className={styles.exampleAr}>{ex.text_ar}</div>
                        <div className={styles.exampleRu}>{ex.text_ru}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Результаты по корню */}
      {rootResults && (
        <div className={styles.results}>
          {rootResults.root && (
            <h2 className={styles.rootHeader}>
              Корень:{" "}
              <span dir="rtl" className={styles.rootText}>
                {rootResults.root}
              </span>
            </h2>
          )}

          {Object.entries(rootResults.grouped).map(([pos, words]) => {
            const filteredWords = words.filter(
              (w) =>
                !directResults.some(
                  (dw) =>
                    normalizeArabic(dw.word_ar) === normalizeArabic(w.word_ar)
                )
            );

            if (filteredWords.length === 0) return null;

            return (
              <div key={pos} className={styles.posGroup}>
                {pos !== "Результаты поиска" && (
                  <h3 className={styles.posTitle}>
                    {pos === "глагол"
                      ? "Глаголы"
                      : pos === "существительное"
                      ? "Существительные"
                      : pos}
                  </h3>
                )}
                {filteredWords.map((word) => (
                  <div key={word.id} className={styles.wordCard}>
                    <div className={styles.wordHeader}>
                      <div>
                        <div className={styles.arabicWord}>{word.word_ar}</div>
                        <div className={styles.russianWord}>{word.word_ru}</div>
                      </div>
                      {word.root_ar && pos !== "Результаты поиска" && (
                        <div className={styles.rootTag}>
                          <span>Корень:</span>
                          <span>{word.root_ar}</span>
                        </div>
                      )}
                    </div>

                    {word.verb_forms.length > 0 && (
                      <div className={styles.verbForms}>
                        <h4>Формы глагола</h4>
                        {enrichVerbForms(word.verb_forms).map((form, idx) => (
                          <div
                            key={`vf-${word.id}-${idx}`}
                            className={styles.formItem}
                          >
                            <div className={styles.formRoman}>
                              {form.form_roman}
                            </div>
                            <div className={styles.formArabic}>
                              {form.form_ar}
                            </div>
                            <div className={styles.formMeaning}>
                              {form.meaning_ru}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {word.examples.length > 0 && (
                      <div className={styles.examples}>
                        <h4>Примеры</h4>
                        {Array.from(
                          new Map(
                            word.examples.map((ex) => [
                              `${ex.text_ar}|||${ex.text_ru}`,
                              ex,
                            ])
                          ).values()
                        ).map((ex, idx) => (
                          <div
                            key={`ex-${word.id}-${idx}`}
                            className={styles.exampleItem}
                          >
                            <div className={styles.exampleAr}>{ex.text_ar}</div>
                            <div className={styles.exampleRu}>{ex.text_ru}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {hasNoResults && <p className={styles.noResults}>Ничего не найдено.</p>}
    </div>
  );
};

export default DictionaryPage;
