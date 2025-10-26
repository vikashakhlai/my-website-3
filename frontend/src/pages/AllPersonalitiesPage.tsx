import { useEffect, useState, useCallback } from "react";
import { api } from "../api/auth";
import { Personality } from "./types/Personality";
import styles from "./AllPersonalitiesPage.module.css";
import PersonalityGrid from "../components/PersonalityGrid";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import useScrollToTop from "../hooks/useScrollToTop";
import { Era } from "./types/era";

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

  // === Загрузка личностей ===
  const loadPersonalities = useCallback(
    async (page = 1, showFullLoader = false) => {
      try {
        if (showFullLoader) setLoading(true);
        else setIsFetching(true);

        const params: Record<string, string | number> = { page, limit };

        const searchTerm = filters.search?.trim() || "";
        if (searchTerm) params.search = searchTerm;
        if (filters.era) params.era = filters.era;

        const response = await api.get("/personalities", { params });
        const { data, total, totalPages } = response.data;

        setPersonalities(data);
        setPagination({ currentPage: page, totalPages, total });
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

  // === Первичная загрузка ===
  useEffect(() => {
    loadPersonalities(1, true);
  }, []);

  // === Перезагрузка при изменении фильтров ===
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

      <Filters
        fields={[
          {
            type: "select",
            key: "era",
            label: "",
            options: [
              { label: "Все эпохи", value: "" },
              ...Object.entries(ERA_LABELS).map(([key, label]) => ({
                label,
                value: key,
              })),
            ],
          },
          {
            type: "text",
            key: "search",
            label: "",
            placeholder: "Поиск по имени...",
          },
        ]}
        onChange={(values) => {
          setFilters(values);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
        onReset={handleReset}
        totalCount={pagination.total}
      />

      <div className={styles.gridWrapper}>
        {/* 💀 Скелетоны вместо "Загрузка..." */}
        {loading ? (
          <div className={styles.gridPlaceholder}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}></div>
            ))}
          </div>
        ) : (
          <PersonalityGrid
            personalities={personalities}
            isFetching={isFetching}
          />
        )}

        {/* 🌀 Оверлей при фильтрации или пагинации */}
        {isFetching && (
          <div className={styles.overlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>

      {!loading && (
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
