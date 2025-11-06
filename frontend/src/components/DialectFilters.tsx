import styles from "./DialectFilters.module.css";

interface Props {
  filters: { name: string; region: string };
  onChange: (f: { name: string; region: string }) => void;
  onReset: () => void;
  totalCount: number;
  regions: { region: string }[];
}

export default function DialectFilters({
  filters,
  regions,
  onChange,
  onReset,
  totalCount,
}: Props) {
  return (
    <div className={styles.filters}>
      {/* 🔍 Поиск */}
      <div className={styles.filterItem}>
        <label>Поиск</label>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={filters.name}
          onChange={(e) => onChange({ ...filters, name: e.target.value })}
        />
      </div>

      {/* 🌍 Регионы */}
      <div className={styles.filterItem}>
        <label>Регион</label>
        <select
          value={filters.region}
          onChange={(e) => onChange({ ...filters, region: e.target.value })}
        >
          <option value="">Все регионы</option>
          {regions.map((r) => (
            <option key={r.region} value={r.region}>
              {r.region}
            </option>
          ))}
        </select>
      </div>

      {/* 🎛 Кнопки и счётчик */}
      <div className={styles.actions}>
        <button className={styles.resetButton} onClick={onReset}>
          Сбросить
        </button>
        <span className={styles.count}>Найдено: {totalCount}</span>
      </div>
    </div>
  );
}
