import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Media {
  id: number;
  title: string;
  mediaUrl: string;
  subtitlesLink?: string | null;
  dialectId: number;
  licenseType?: string;
  licenseAuthor?: string;
}

const DialectExercisePage = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log("🔍 GET /api-nest/media/", id);

        // ⚡ тот же стиль запроса, что в DialectPage
        const response = await axios.get(`/api-nest/media/${id}`);
        console.log("✅ Ответ:", response.data);
        setMedia(response.data);
      } catch (err) {
        console.error("❌ Ошибка загрузки:", err);
        setError("Не удалось загрузить медиа");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!media) return <p className="text-center mt-10">Медиа не найдено</p>;

  const videoUrl = media.mediaUrl?.trim();
  const subtitlesUrl = media.subtitlesLink?.trim();

  console.log("🎬 videoUrl:", videoUrl);
  console.log("💬 subtitlesUrl:", subtitlesUrl);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">{media.title}</h2>

      {/* 🎥 Видео */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden">
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            preload="auto"
            crossOrigin="anonymous"
            style={{ width: "100%", borderRadius: "12px" }}
          >
            {subtitlesUrl && (
              <track
                src={subtitlesUrl}
                kind="subtitles"
                srcLang="ar"
                label="Арабский (египетский)"
                default
              />
            )}
            Ваш браузер не поддерживает тег <code>video</code>.
          </video>
        ) : (
          <p className="text-white text-center p-6">Видео не найдено</p>
        )}
      </div>

      {/* ℹ️ Информация */}
      <div className="mt-4 text-gray-600 text-sm">
        <p>Диалект ID: {media.dialectId}</p>
        {slug && (
          <p>
            🌍 Диалект: <strong>{slug}</strong>
          </p>
        )}
        {media.licenseType === "cc-by" && (
          <p>
            🔗 Видео предоставлено по лицензии CC-BY, автор:{" "}
            <strong>{media.licenseAuthor}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default DialectExercisePage;
