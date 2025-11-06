import { useEffect, useState } from "react";
import styles from "./BookFilters.module.css";

interface TagDto {
  id: number;
  name: string;
}

interface Props {
  filters: { title: string; author: string; tag: string };
  onChange: (values: { title: string; author: string; tag: string }) => void;
  onReset: () => void;
  totalCount: number;
  tags: TagDto[];
  authors: string[];
}

export default function BookFilters({
  filters,
  onChange,
  onReset,
  totalCount,
  tags,
  authors,
}: Props) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);

  // ✅ debounce (400ms)
  useEffect(() => {
    const t = setTimeout(() => onChange(localFilters), 400);
    return () => clearTimeout(t);
  }, [localFilters, onChange]);

  // ✅ обновление локального состояния при внешнем сбросе
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // ✅ закрытие подсказок при клике вне
  useEffect(() => {
    const handler = () => setShowSuggestions(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // ✅ авторы: автоподсказка
  useEffect(() => {
    const query = localFilters.author.trim().toLowerCase();
    if (query.length >= 2) {
      setFilteredAuthors(
        authors.filter((a) => a.toLowerCase().includes(query)).slice(0, 8)
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [localFilters.author, authors]);

  const handleAuthorSelect = (name: string) => {
    setLocalFilters((f) => ({ ...f, author: name }));
    setShowSuggestions(false);
    setFilteredAuthors([]);
  };

  return (
    <div className={styles.filters}>
      {/* 🔍 Название */}
      <div className={styles.filterItem}>
        <label>Название</label>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={localFilters.title}
          onChange={(e) =>
            setLocalFilters((f) => ({ ...f, title: e.target.value }))
          }
        />
      </div>

      {/* 👤 Автор */}
      <div
        className={`${styles.filterItem} ${styles.autocompleteField}`}
        onClick={(e) => e.stopPropagation()}
      >
        <label>Автор</label>
        <input
          type="text"
          placeholder="Введите фамилию..."
          value={localFilters.author}
          onChange={(e) =>
            setLocalFilters((f) => ({ ...f, author: e.target.value }))
          }
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => {
            if (localFilters.author.length >= 2) setShowSuggestions(true);
          }}
        />

        {showSuggestions && filteredAuthors.length > 0 && (
          <ul className={styles.suggestions}>
            {filteredAuthors.map((name) => (
              <li key={name} onMouseDown={() => handleAuthorSelect(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🏷️ Тег */}
      <div className={styles.filterItem}>
        <label>Тег</label>
        <select
          value={localFilters.tag}
          onChange={(e) =>
            setLocalFilters((f) => ({ ...f, tag: e.target.value }))
          }
        >
          <option value="">Все теги</option>
          {tags.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🎛 Кнопки / Счётчик */}
      <div className={styles.actions}>
        <button
          className={styles.resetButton}
          onClick={() => {
            onReset();
            setLocalFilters({ title: "", author: "", tag: "" });
            setShowSuggestions(false);
            setFilteredAuthors([]);
          }}
        >
          Сбросить
        </button>

        <span className={styles.count}>Найдено: {totalCount}</span>
      </div>
    </div>
  );
}
