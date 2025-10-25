import { useEffect, useState } from "react";
import axios from "axios";
import DialectCard from "../components/DialectCard";

interface Media {
  id: number;
  title: string;
  mediaUrl: string;
  type: string;
  licenseType?: string;
  licenseAuthor?: string;
}

interface Dialect {
  id: number;
  name: string;
  slug: string;
  description?: string;
  region?: string;
  medias?: Media[];
}

const DialectPage = () => {
  const [dialects, setDialects] = useState<Dialect[]>([]);
  const [filters, setFilters] = useState({ name: "", region: "" });
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);

  useEffect(() => {
    const fetchDialects = async () => {
      try {
        const params: Record<string, string> = {};
        if (filters.name.trim()) params.name = filters.name.trim();
        if (filters.region.trim()) params.region = filters.region.trim();

        const response = await axios.get("/api-nest/dialects", { params });
        setDialects(response.data.data);
      } catch (error) {
        console.error("Ошибка при загрузке диалектов:", error);
      } finally {
        setLoading(false);
        setLoadedOnce(true);
      }
    };

    fetchDialects();
  }, [filters]);

  if (loading && !loadedOnce) return <p>Загрузка...</p>;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1rem" }}>
      <h1 className="text-2xl font-semibold mb-6">Все диалекты</h1>

      {/* 🔍 Фильтры */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Фильтр по региону..."
          value={filters.region}
          onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          className="border border-gray-300 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* 🪄 Если ничего не найдено */}
      {!loading && loadedOnce && dialects.length === 0 && (
        <p className="text-gray-500">Нет диалектов, удовлетворяющих фильтру.</p>
      )}

      {/* 🎨 Список диалектов */}
      {dialects.map((dialect) => (
        <div key={dialect.id} className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{dialect.name}</h2>
            {dialect.region && (
              <p className="text-gray-500 text-sm mb-1">
                🌍 Регион: {dialect.region}
              </p>
            )}
            {dialect.description && (
              <p className="text-gray-600 mb-3">{dialect.description}</p>
            )}
          </div>

          <h3 className="font-medium mb-3">🎧 Последние упражнения:</h3>

          {dialect.medias && dialect.medias.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {dialect.medias.slice(0, 3).map((media) => (
                <DialectCard
                  key={media.id}
                  id={media.id}
                  slug={dialect.slug}
                  title={media.title}
                  mediaUrl={media.mediaUrl}
                  mediaType={media.type === "audio" ? "audio" : "video"}
                  dialectName={dialect.name}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Нет материалов для этого диалекта.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default DialectPage;
