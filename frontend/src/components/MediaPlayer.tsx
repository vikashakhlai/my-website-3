import { useRef, useEffect } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "./MediaPlayer.css";
import "@videojs/themes/dist/fantasy/index.css";

import type { Media } from "../types/media"; // ✅ правильный импорт

interface Props {
  media: Media;
  onPlay?: () => void;
  onPause?: () => void;
}

const MediaPlayer: React.FC<Props> = ({ media, onPlay, onPause }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const lastMediaId = useRef<number | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const isAudio = media.type === "audio";

    // 🔁 Если плеер уже создан для этого же видео — не пересоздаём
    if (playerRef.current && lastMediaId.current === media.id) return;

    // Уничтожаем старый плеер, если новый ID
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const player = videojs(el, {
      controls: true,
      preload: "auto",
      width: isAudio ? 480 : 885,
      height: isAudio ? 60 : 510,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [
        {
          src: media.mediaUrl,
          type: isAudio ? "audio/mpeg" : "video/mp4",
        },
      ],
      poster: !isAudio ? media.previewUrl || "" : undefined,
    });

    // 🎬 callbacks
    if (onPlay) player.on("play", onPlay);
    if (onPause) player.on("pause", onPause);

    // 📝 Subtitles
    if (!isAudio && media.subtitlesLink) {
      player.addRemoteTextTrack(
        {
          kind: "subtitles",
          src: media.subtitlesLink,
          srclang: "ar",
          label: "Арабский",
        },
        false
      );
    }

    // 🎨 для аудио убираем фон
    player.ready(() => {
      if (isAudio && player.el()) {
        player.el()!.style.background = "transparent";
      }
    });

    playerRef.current = player;
    lastMediaId.current = media.id;

    // 💾 Восстановление позиции
    const savedTime = localStorage.getItem(`mediaTime_${media.id}`);
    if (savedTime) {
      const seconds = parseFloat(savedTime);
      if (!isNaN(seconds)) player.currentTime(seconds);
    }

    const saveProgress = () => {
      const current = player.currentTime();
      if (!isNaN(current)) {
        localStorage.setItem(`mediaTime_${media.id}`, current.toString());
      }
    };

    player.on("timeupdate", saveProgress);

    player.on("ended", () => {
      localStorage.removeItem(`mediaTime_${media.id}`);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.off("play", onPlay);
        playerRef.current.off("pause", onPause);
        playerRef.current.off("timeupdate", saveProgress);
        playerRef.current.off("ended");
      }
    };
  }, [
    media.id,
    media.mediaUrl,
    media.type,
    media.previewUrl,
    media.subtitlesLink,
    onPlay,
    onPause,
  ]);

  return (
    <div
      className={`media-wrapper ${media.type === "audio" ? "audio" : "video"}`}
      data-vjs-player
    >
      {media.type === "audio" ? (
        <audio
          ref={videoRef}
          className="video-js vjs-no-big-play-button"
          controls
        />
      ) : (
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-fantasy"
          controls
        />
      )}
    </div>
  );
};

export default MediaPlayer;
