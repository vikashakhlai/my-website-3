import { useEffect, useState } from "react";
import axios from "axios";
import DialectCard from "../components/DialectCard";
import Filters from "../components/Filters";
import styles from "./DialectPage.module.css";
import { Media } from "../types/media";

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

  // === Загрузка тем и регионов ===
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [topicsRes, mediaRes] = await Promise.all([
          axios.get("/api-nest/dialect-topics"),
          axios.get("/api-nest/media"),
        ]);

        setTopics((topicsRes.data || []) as Topic[]);

        // Уникальные регионы. Жёстко приводим к string[].
        const allRegions = [
          ...new Set<string>(
            ((mediaRes.data || []) as Media[])
              .map((m) => m.dialect?.region)
              .filter((r): r is string => Boolean(r))
          ),
        ];
        setRegions(allRegions);
      } catch (e) {
        console.error("Ошибка при загрузке тем/регионов", e);
      }
    };
    fetchMeta();
  }, []);

  // === Загрузка упражнений ===
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (filters.name) params.name = filters.name;
        if (filters.region) params.region = filters.region;
        if (filters.topics.length > 0) params.topics = filters.topics.join(",");

        const response = await axios.get("/api-nest/media", { params });
        setMediaList((response.data || []) as Media[]);
      } catch (error) {
        console.error("Ошибка при загрузке медиа:", error);
        setMediaList([]);
      } finally {
        setLoading(false);
        setLoadedOnce(true);
      }
    };

    fetchMedia();
  }, [filters]);

  // === Управление фильтрами ===
  const toggleTopic = (id: number) => {
    setFilters((prev) => {
      const topics = prev.topics.includes(id)
        ? prev.topics.filter((t) => t !== id)
        : [...prev.topics, id];
      return { ...prev, topics };
    });
  };

  const handleReset = () => setFilters({ name: "", region: "", topics: [] });

  const isSingle = mediaList.length === 1;

  // Адаптер для Filters.onChange (поддерживает только строковые поля)
  const handleBaseFiltersChange = (vals: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      name: vals.name ?? "",
      region: vals.region ?? "",
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Все упражнения по диалектам</h1>

      {/* === Базовые фильтры (имя + регион как select) === */}
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
        onChange={handleBaseFiltersChange} // ✅ адаптер
        onReset={handleReset}
        totalCount={mediaList.length}
      />

      {/* === Фильтр по темам === */}
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

        {/* Выбранные темы */}
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
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}></div>
          ))}
        </div>
      )}

      {!loading && loadedOnce && mediaList.length === 0 && (
        <p className={styles.empty}>Нет упражнений, удовлетворяющих фильтру.</p>
      )}

      {!loading && mediaList.length > 0 && (
        <div className={isSingle ? styles.gridSingle : styles.grid}>
          {mediaList.map((m) => (
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DialectPage;
