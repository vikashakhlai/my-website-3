import styles from "./TextbookFilters.module.css";

interface Props {
  filters: { search: string; level: string };
  totalCount: number;
  onChange: (values: { search: string; level: string }) => void;
  onReset: () => void;
}

const levelOptions = [
  { label: "Все уровни", value: "" },
  { label: "Начинающий", value: "beginner" },
  { label: "Средний", value: "intermediate" },
  { label: "Продвинутый", value: "advanced" },
];

export default function TextbookFilters({
  filters,
  totalCount,
  onChange,
  onReset,
}: Props) {
  return (
    <div className={styles.filters}>
      {/* LEVEL SELECT */}
      <div className={styles.filterItem}>
        <label>Уровень</label>
        <select
          value={filters.level}
          onChange={(e) => onChange({ ...filters, level: e.target.value })}
        >
          {levelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* SEARCH INPUT */}
      <div className={styles.filterItem}>
        <label>Поиск</label>
        <input
          type="text"
          placeholder="Поиск по названию или автору..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button className={styles.resetButton} onClick={onReset}>
          Сбросить
        </button>
        <div className={styles.count}>Найдено: {totalCount}</div>
      </div>
    </div>
  );
}
