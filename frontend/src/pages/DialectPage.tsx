import { useEffect, useState } from "react";
import DialectCard from "../components/DialectCard";
import Filters from "../components/Filters";
import styles from "./DialectPage.module.css";
import { Media } from "../types/media";
import useScrollToTop from "../hooks/useScrollToTop";
import { api } from "../api/auth";

interface Topic {
  id: number;
  name: string;
}

interface FiltersState {
  name: string;
  region: string;
  topics: number[];
}

const DialectPage = () => {
  useScrollToTop();

  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [filters, setFilters] = useState<FiltersState>({
    name: "",
    region: "",
    topics: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  /** === 1. Загрузка тем === */
  useEffect(() => {
    api
      .get("/dialect-topics")
      .then((res) => setTopics(res.data || []))
      .catch((e) => console.error("Ошибка при загрузке тем", e));
  }, []);

  /** === 2. Загрузка медиа === */
  useEffect(() => {
    let isMounted = true;

    const fetchMedia = async () => {
      setLoading(true);
      const start = Date.now();
      console.log("▶️ fetchMedia start, filters =", filters);

      try {
        const params: Record<string, string> = {};
        if (filters.name) params.name = filters.name;
        if (filters.region) params.region = filters.region;
        if (filters.topics.length > 0) params.topics = filters.topics.join(",");

        console.log("📡 sending request with params:", params);

        const res = await api.get<Media[]>("/media", { params });

        console.log("✅ response received:", res.data);

        const elapsed = Date.now() - start;
        const delay = Math.max(0, 400 - elapsed);

        setTimeout(() => {
          console.log("⏳ delayed processing");

          const data = res.data;
          console.log("📌 data parsed:", data);

          setMediaList(Array.isArray(data) ? data : []);

          setLoading(false);
          setLoadedOnce(true);

          const uniqueRegions = Array.from(
            new Set(
              data
                .map((m) => m.dialect?.region)
                .filter((r): r is string => Boolean(r))
            )
          );

          console.log("🌍 regions extracted:", uniqueRegions);

          setRegions(uniqueRegions);
        }, delay);
      } catch (err) {
        console.error("❌ Ошибка при загрузке медиа:", err);
        setMediaList([]);
        setLoading(false);
        setLoadedOnce(true);
      }
    };

    fetchMedia();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  /** === Управление фильтрами === */
  const toggleTopic = (id: number) => {
    setFilters((prev) => {
      const topics = prev.topics.includes(id)
        ? prev.topics.filter((t) => t !== id)
        : [...prev.topics, id];
      return { ...prev, topics };
    });
  };

  const handleReset = () => setFilters({ name: "", region: "", topics: [] });

  const handleBaseFiltersChange = (vals: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      name: vals.name ?? "",
      region: vals.region ?? "",
    }));
  };

  const filteredMedia = mediaList.filter((m) => m.dialect && m.dialect.id);
  const visibleCount = filteredMedia.length;
  const isSingleFiltered = visibleCount === 1;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Все упражнения по диалектам</h1>

      <Filters
        fields={[
          {
            type: "text",
            key: "name",
            label: "Название",
            placeholder: "Поиск по имени...",
          },
          {
            type: "select",
            key: "region",
            label: "Регион",
            options: regions.map((r) => ({ label: r, value: r })),
          },
        ]}
        onChange={handleBaseFiltersChange}
        onReset={handleReset}
        totalCount={visibleCount}
      />

      {/* === Темы === */}
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

        {/* Активные темы */}
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

      {/* === Контент === */}
      {loading && !loadedOnce && (
        <div
          className={`${styles.skeletonGrid} ${!loading ? styles.hidden : ""}`}
        >
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
            <DialectCard
              key={m.id}
              id={m.id}
              slug={m.dialect?.slug || ""}
              title={m.title}
              previewUrl={m.previewUrl}
              mediaType={m.type}
              dialectName={m.dialect?.name || "Неизвестный диалект"}
              licenseType={m.licenseType}
              licenseAuthor={m.licenseAuthor}
              hasSubtitles={!!m.subtitlesLink}
              level={m.level}
              topics={m.topics}
              activeTopics={filters.topics}
              duration={m.duration}
              speaker={m.speaker}
              sourceRole={m.sourceRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DialectPage;
