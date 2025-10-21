import { Era } from "../types/era";
import styles from "./PersonalityFilters.module.css";

export interface Filters {
  search: string;
  era: Era | "";
}

interface PersonalityFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const ERA_LABELS: Record<Era, string> = {
  pre_islamic: "Доисламский период",
  rashidun: "Праведные халифы",
  umayyad: "Омейяды",
  abbasid: "Аббасиды",
  al_andalus: "Аль-Андалус",
  ottoman: "Османы",
  modern: "Современность",
};

const PersonalityFilters = ({
  filters,
  onFilterChange,
}: PersonalityFiltersProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, era: e.target.value as Era | "" });
  };

  return (
    <div className={styles.filtersContainer}>
      <input
        type="text"
        placeholder="Поиск по имени..."
        value={filters.search}
        onChange={handleInputChange}
        className={styles.searchInput}
      />
      <select
        value={filters.era}
        onChange={handleSelectChange}
        className={styles.eraSelect}
      >
        <option value="">Все эпохи</option>
        {Object.entries(ERA_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PersonalityFilters;
