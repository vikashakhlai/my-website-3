import { useEffect, useMemo, useState } from "react";
import DialectCard from "../components/DialectCard";
import DialectFilters from "../components/DialectFilters";
import styles from "./DialectPage.module.css";
import { Media } from "../types/media";
import useScrollToTop from "../hooks/useScrollToTop";
import { api } from "../api/auth";

interface Topic {
  id: number;
  name: string;
}

interface RegionOption {
  region: string;
}

type FiltersState = {
  name: string;
  region: string;
  topics: number[];
};

const DialectPage = () => {
  useScrollToTop();

  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [filters, setFilters] = useState<FiltersState>({
    name: "",
    region: "",
    topics: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  // 1) Темы
  useEffect(() => {
    api
      .get("/dialect-topics")
      .then((res) => setTopics(res.data || []))
      .catch((e) => console.error("Ошибка при загрузке тем:", e));
  }, []);

  // 2) Регионы (с backend'а уже с count)
  useEffect(() => {
    let cancelled = false;

    const loadRegions = async () => {
      try {
        const res = await api.get<RegionOption[]>("/media/regions");
        if (!cancelled) {
          setRegions(
            Array.isArray(res.data)
              ? res.data.sort((a, b) => a.region.localeCompare(b.region, "ru"))
              : []
          );
        }
      } catch (err) {
        console.error("⚠️ Ошибка загрузки регионов:", err);
      }
    };

    loadRegions();
    return () => {
      cancelled = true;
    };
  }, []);

  // 3) Медиа с учётом фильтров
  useEffect(() => {
    let cancelled = false;

    const fetchMedia = async () => {
      setLoading(true);

      const params: Record<string, string> = {};
      if (filters.name) params.name = filters.name;
      if (filters.region) params.region = filters.region;
      if (filters.topics.length > 0) params.topics = filters.topics.join(",");

      try {
        const res = await api.get<Media[]>("/media", { params });
        if (cancelled) return;

        const items = Array.isArray(res.data) ? res.data : [];
        setMediaList(items);

        // fallback: если API регионов не вернуло, собираем вручную
        if (regions.length === 0) {
          const uniq = Array.from(
            new Set(
              items
                .map((m) => m.dialect?.region)
                .filter((v): v is string => Boolean(v))
            )
          )
            .sort((a, b) => a.localeCompare(b, "ru"))
            .map((r) => ({ region: r, count: 0 }));

          setRegions(uniq);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("❌ Ошибка при загрузке медиа:", err);
          setMediaList([]);
        }
      } finally {
        if (!cancelled) {
          setLoadedOnce(true);
          setLoading(false);
        }
      }
    };

    fetchMedia();
    return () => {
      cancelled = true;
    };
  }, [filters, regions.length]);

  // Управление темами
  const toggleTopic = (id: number) => {
    setFilters((prev) => {
      const exists = prev.topics.includes(id);
      return {
        ...prev,
        topics: exists
          ? prev.topics.filter((t) => t !== id)
          : [...prev.topics, id],
      };
    });
  };

  const filteredMedia = useMemo(
    () => mediaList.filter((m) => !!m.dialect),
    [mediaList]
  );
  const visibleCount = filteredMedia.length;
  const isSingleFiltered = visibleCount === 1;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Все упражнения по диалектам</h1>

      <DialectFilters
        filters={filters}
        regions={regions}
        totalCount={visibleCount}
        onChange={(vals) => setFilters((p) => ({ ...p, ...vals }))}
        onReset={() => setFilters({ name: "", region: "", topics: [] })}
      />

      {/* Темы */}
      <div className={styles.topicsFilter}>
        <div className={styles.topicsHeaderRow}>
          <p className={styles.filterLabel}>Темы:</p>

          <div className={styles.topicsRow}>
            {topics.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                className={`${styles.topicBtn} ${
                  filters.topics.includes(t.id) ? styles.topicActive : ""
                }`}
              >
                {t.name}
              </button>
            ))}

            {topics.length > 5 && (
              <button
                className={styles.toggleTopicsBtnInline}
                onClick={() => setShowAllTopics((prev) => !prev)}
              >
                {showAllTopics ? "Скрыть ▲" : "Все темы ▼"}
              </button>
            )}
          </div>
        </div>

        {showAllTopics && (
          <div className={styles.allTopicsExpanded}>
            {topics.slice(5).map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                className={`${styles.topicBtn} ${
                  filters.topics.includes(t.id) ? styles.topicActive : ""
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {filters.topics.length > 0 && (
          <div className={styles.activeFilters}>
            {filters.topics.map((id) => {
              const topic = topics.find((t) => t.id === id);
              if (!topic) return null;
              return (
                <span
                  key={id}
                  className={styles.activeFilter}
                  onClick={() => toggleTopic(id)}
                >
                  {topic.name} ✕
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Контент */}
      {loading && !loadedOnce && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}></div>
          ))}
        </div>
      )}

      {!loading && loadedOnce && visibleCount === 0 && (
        <p className={styles.empty}>Нет упражнений, удовлетворяющих фильтру.</p>
      )}

      {!loading && visibleCount > 0 && (
        <div className={isSingleFiltered ? styles.gridSingle : styles.grid}>
          {filteredMedia.map((m) => (
            <DialectCard key={m.id} media={m} activeTopics={filters.topics} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DialectPage;
