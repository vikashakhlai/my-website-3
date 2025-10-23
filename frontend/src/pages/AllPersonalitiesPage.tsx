import { useEffect, useState, useCallback } from "react";
import { api } from "../api/auth";
import PersonalityFilters from "./PersonalityFilters";
import { Personality } from "../types/Personality";
import { Era } from "../types/era";
import styles from "./AllPersonalitiesPage.module.css";
import PersonalityGrid from "./PersonalityGrid";
import useScrollToTop from "../hooks/useScrollToTop";

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
}

interface Filters {
  search: string;
  era: Era | "";
}

const AllPersonalitiesPage = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState<Filters>({ search: "", era: "" });
  useScrollToTop();

  const loadPersonalities = useCallback(
    async (page = 1, showFullLoader = false) => {
      try {
        if (showFullLoader) setLoading(true);
        else setIsFetching(true);

        const params: Record<string, string | number> = { page, limit: 12 };
        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.era) params.era = filters.era;

        const response = await api.get("/personalities", { params });
        const { data, total, totalPages } = response.data;

        setPersonalities(data);
        setPagination({ currentPage: page, totalPages, total });
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        setError("Не удалось загрузить личностей.");
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    },
    [filters]
  );

  // ✅ Первичная загрузка (показывает весь loader)
  useEffect(() => {
    loadPersonalities(1, true);
  }, []);

  // ✅ Debounce загрузки при изменении фильтров
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPersonalities(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters, loadPersonalities]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadPersonalities(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters((prev) =>
      prev.search === newFilters.search && prev.era === newFilters.era
        ? prev
        : newFilters
    );
  };

  if (loading)
    return (
      <div className={styles.container}>
        <div className={styles.fullLoader}>Загрузка...</div>
      </div>
    );

  if (error)
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Все личности</h1>

      <PersonalityFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <p className={styles.subtitle}>Найдено: {pagination.total} личностей</p>

      <PersonalityGrid personalities={personalities} isFetching={isFetching} />

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={styles.pageBtn}
          >
            ← Назад
          </button>
          <span className={styles.pageInfo}>
            Страница {pagination.currentPage} из {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={styles.pageBtn}
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
};

export default AllPersonalitiesPage;
