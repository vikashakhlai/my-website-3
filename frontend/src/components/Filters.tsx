import { useState, useEffect, useRef } from "react";
import styles from "./Filters.module.css";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterField =
  | {
      type: "select";
      key: string;
      label: string;
      options: FilterOption[];
    }
  | {
      type: "autocomplete";
      key: string;
      label: string;
      options: string[];
      placeholder?: string;
    }
  | {
      type: "text";
      key: string;
      label: string;
      placeholder?: string;
    };

interface FiltersProps {
  fields: FilterField[];
  onChange: (values: Record<string, string>) => void;
  onReset?: () => void;
  totalCount?: number;
  debounce?: number;
}

const Filters = ({
  fields,
  onChange,
  onReset,
  totalCount,
  debounce = 300,
}: FiltersProps) => {
  // ✅ создаём объект { name: "", region: "", topics: "" } и т.п.
  const initialValues = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [showSuggestions, setShowSuggestions] = useState<
    Record<string, boolean>
  >({});
  const inputRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // === debounce вызов onChange ===
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(values);
    }, debounce);
    return () => clearTimeout(timeout);
  }, [values]);

  // === закрытие списков подсказок при клике вне ===
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      Object.entries(inputRefs.current).forEach(([key, ref]) => {
        if (ref && !ref.contains(e.target as Node)) {
          setShowSuggestions((prev) => ({ ...prev, [key]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === обработка изменений ===
  const handleChange = (key: string, value: string, field: FilterField) => {
    setValues((prev) => ({ ...prev, [key]: value }));

    if (field.type === "autocomplete") {
      if (!value) {
        setSuggestions((prev) => ({ ...prev, [key]: [] }));
        setShowSuggestions((prev) => ({ ...prev, [key]: false }));
        return;
      }

      const filtered = field.options
        .filter((o) => o.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);

      setSuggestions((prev) => ({ ...prev, [key]: filtered }));
      setShowSuggestions((prev) => ({ ...prev, [key]: filtered.length > 0 }));
    }
  };

  const handleSuggestionClick = (key: string, suggestion: string) => {
    setValues((prev) => ({ ...prev, [key]: suggestion }));
    setShowSuggestions((prev) => ({ ...prev, [key]: false }));
  };

  const resetFilters = () => {
    setValues({});
    onReset?.();
  };

  return (
    <div className={styles.filters}>
      {fields.map((field) => {
        if (field.type === "select") {
          return (
            <div key={field.key} className={styles.filterItem}>
              <label>{field.label}</label>
              <select
                className={styles.select}
                value={values[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value, field)}
              >
                <option value="">Все</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (field.type === "autocomplete") {
          return (
            <div
              key={field.key}
              className={`${styles.filterItem} ${styles.autocompleteField}`}
              ref={(el) => (inputRefs.current[field.key] = el)}
            >
              <label>{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder || ""}
                value={values[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value, field)}
                onFocus={() =>
                  setShowSuggestions((prev) => ({
                    ...prev,
                    [field.key]: !!suggestions[field.key]?.length,
                  }))
                }
              />
              {showSuggestions[field.key] &&
                suggestions[field.key]?.length > 0 && (
                  <ul className={styles.suggestions}>
                    {suggestions[field.key].map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSuggestionClick(field.key, s)}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          );
        }

        if (field.type === "text") {
          return (
            <div key={field.key} className={styles.filterItem}>
              <label>{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder || ""}
                value={values[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value, field)}
              />
            </div>
          );
        }

        return null;
      })}

      <div className={styles.actions}>
        <button className={styles.resetButton} onClick={resetFilters}>
          Сбросить
        </button>
        {typeof totalCount === "number" && (
          <div className={styles.count}>Найдено: {totalCount}</div>
        )}
      </div>
    </div>
  );
};

export default Filters;
