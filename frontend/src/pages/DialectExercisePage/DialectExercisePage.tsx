import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import axios from "axios";
import { getMediaUrl } from "../../utils/media";

interface Media {
  id: number;
  title: string;
  mediaUrl: string;
  subtitlesLink?: string | null;
  dialectId: number;
  licenseType?: string;
  licenseAuthor?: string;
  exercises?: any[];
}

const DialectExercisePage = () => {
  const { id } = useParams();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axios.get(`/api-nest/media/${id}`);
        setMedia(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке медиа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (!media) return <p>Видео не найдено</p>;

  const videoUrl = getMediaUrl(media.mediaUrl);
  const subtitlesUrl = getMediaUrl(media.subtitlesLink);

  return (
    <div
      className="exercise-page"
      style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}
    >
      <h2 className="text-xl font-semibold mb-4">{media.title}</h2>

      <div
        className="video-container"
        style={{ position: "relative", paddingTop: "56.25%" }}
      >
        <ReactPlayer
          url={videoUrl}
          controls
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
          config={
            {
              file: {
                attributes: { crossOrigin: "anonymous" },
                tracks: media.subtitlesLink
                  ? [
                      {
                        kind: "subtitles",
                        src: subtitlesUrl,
                        srcLang: "ar",
                        label: "Арабский (египетский)",
                        default: true,
                      },
                    ]
                  : [],
              },
            } as any
          }
        />
      </div>

      <div className="mt-4 text-gray-600 text-sm">
        <p>Диалект ID: {media.dialectId}</p>
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
