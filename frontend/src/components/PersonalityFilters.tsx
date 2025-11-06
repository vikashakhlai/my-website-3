import styles from "./PersonalityFilters.module.css";

interface EraOption {
  value: string;
  label: string;
}

interface Props {
  filters: { search: string; era: string };
  eras: EraOption[];
  totalCount: number;
  onChange: (values: { search: string; era: string }) => void;
  onReset: () => void;
}

export default function PersonalityFilters({
  filters,
  eras,
  totalCount,
  onChange,
  onReset,
}: Props) {
  return (
    <div className={styles.filters}>
      {/* Era */}
      <div className={styles.filterItem}>
        <label>Эпоха</label>
        <select
          value={filters.era}
          onChange={(e) => onChange({ ...filters, era: e.target.value })}
        >
          {eras.map((era) => (
            <option key={era.value} value={era.value}>
              {era.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className={styles.filterItem}>
        <label>Поиск</label>
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Reset + Count */}
      <div className={styles.actions}>
        <button className={styles.resetButton} onClick={onReset}>
          Сбросить
        </button>
        <div className={styles.count}>Найдено: {totalCount}</div>
      </div>
    </div>
  );
}
