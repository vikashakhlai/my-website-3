import { useEffect, useState, useCallback } from "react";
import { api } from "../api/auth";
import { Personality } from "../types/Personality";
import styles from "./AllPersonalitiesPage.module.css";
import PersonalityGrid from "../components/PersonalityGrid";
import Pagination from "../components/Pagination";
import useScrollToTop from "../hooks/useScrollToTop";
import { Era } from "../types/era";
import PersonalityFilters from "../components/PersonalityFilters";
import Loader from "../components/Loader";
import SkeletonCard from "../components/SkeletonCard";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  total: number;
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

const AllPersonalitiesPage = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [filters, setFilters] = useState({ search: "", era: "" });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 12;

  useScrollToTop();

  const loadPersonalities = useCallback(
    async (page = 1, showFullLoader = false) => {
      try {
        if (showFullLoader) {
          setLoading(true);
          setPersonalities([]); // избегаем "мигания"
        } else {
          setIsFetching(true);
        }

        const params: Record<string, string | number> = { page, limit };
        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.era) params.era = filters.era;

        const response = await api.get("/personalities", { params });
        const { items, total, pages } = response.data;

        setPersonalities(items);
        setPagination({ currentPage: page, totalPages: pages, total });
        setError(null);
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

  useEffect(() => {
    loadPersonalities(1, true);
  }, []);

  useEffect(() => {
    loadPersonalities(1);
  }, [filters, loadPersonalities]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadPersonalities(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setFilters({ search: "", era: "" });
    loadPersonalities(1, true);
  };

  const eraOptions = [
    { value: "", label: "Все эпохи" },
    ...Object.entries(ERA_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Все личности</h1>

      <PersonalityFilters
        filters={filters}
        eras={eraOptions}
        totalCount={pagination.total}
        onChange={(values) => {
          setFilters(values);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
        onReset={handleReset}
      />

      <div className={styles.gridWrapper}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : loading || (!personalities.length && !error) ? (
          <SkeletonCard variant="personality" count={12} layout="grid" />
        ) : (
          <div className={styles.fadeIn}>
            <PersonalityGrid
              personalities={personalities}
              isFetching={isFetching}
            />
          </div>
        )}

        {isFetching && !loading && <Loader className="overlay" size="md" />}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllPersonalitiesPage;
