import { useEffect, useState } from "react";
import axios from "axios";
import DialectCard from "../components/DialectCard";
import Filters from "../components/Filters";
import styles from "./DialectPage.module.css";
import { Media } from "../types/media";

const DialectPage = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filters, setFilters] = useState({ name: "", region: "" });
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        const name = filters.name?.trim() || "";
        const region = filters.region?.trim() || "";
        if (name) params.name = name;
        if (region) params.region = region;

        const response = await axios.get("/api-nest/media", { params });
        const payload = response?.data ?? [];
        const data: Media[] = Array.isArray(payload)
          ? payload
          : payload.data ?? [];
        const total = !Array.isArray(payload)
          ? payload.total ?? data.length
          : data.length;

        setMediaList(data);
        setTotalCount(total);
      } catch (error) {
        console.error("Ошибка при загрузке медиа:", error);
        setMediaList([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
        setLoadedOnce(true);
      }
    };

    fetchMedia();
  }, [filters]);

  const handleReset = () => setFilters({ name: "", region: "" });
  const isSingle = mediaList.length === 1;

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
            type: "text",
            key: "region",
            label: "Регион",
            placeholder: "Фильтр по региону...",
          },
        ]}
        onChange={setFilters}
        onReset={handleReset}
        totalCount={totalCount}
      />

      {/* === 🌀 Скелетоны === */}
      {loading && !loadedOnce && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}></div>
          ))}
        </div>
      )}

      {/* === 🧩 Пусто === */}
      {!loading && loadedOnce && mediaList.length === 0 && (
        <p className={styles.empty}>Нет упражнений, удовлетворяющих фильтру.</p>
      )}

      {/* === 🪄 Сетка карточек === */}
      {!loading && mediaList.length > 0 && (
        <>
          {isSingle ? (
            <div className={`${styles.gridSingle} ${styles.fadeIn}`}>
              <DialectCard
                id={mediaList[0].id}
                slug={mediaList[0].dialect?.slug || ""}
                title={mediaList[0].title}
                previewUrl={mediaList[0].previewUrl}
                mediaType={mediaList[0].type}
                dialectName={
                  mediaList[0].dialect?.name || "Неизвестный диалект"
                }
                licenseType={mediaList[0].licenseType}
                licenseAuthor={mediaList[0].licenseAuthor}
                hasSubtitles={!!mediaList[0].subtitlesLink}
                level={mediaList[0].level}
                topics={mediaList[0].topics}
                isSingle
              />
            </div>
          ) : (
            <div className={`${styles.grid} ${styles.fadeIn}`}>
              {mediaList.map((m, index) => (
                <div
                  key={m.id}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: "forwards",
                  }}
                  className={styles.fadeItem}
                >
                  <DialectCard
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
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DialectPage;
