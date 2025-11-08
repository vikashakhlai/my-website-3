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

    // 🎬 Ensure play/pause button state is properly managed
    let updatePlayButtonFn: (() => void) | null = null;
    
    player.ready(() => {
      // 🎨 для аудио убираем фон
      if (isAudio && player.el()) {
        player.el()!.style.background = "transparent";
      }
      
      // Ensure the control bar is properly initialized
      const controlBar = player.getChild("controlBar");
      const playControl = controlBar?.getChild("playToggle");
      
      if (playControl) {
        // Force update the button state on ready
        playControl.update();
        
        // Ensure button state updates when player state changes
        updatePlayButtonFn = () => {
          // Update the button state
          playControl.update();
        };
        
        // Listen to all relevant events to update button state
        player.on("play", updatePlayButtonFn);
        player.on("playing", updatePlayButtonFn);
        player.on("pause", updatePlayButtonFn);
        player.on("paused", updatePlayButtonFn);
      }
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
        if (onPlay) playerRef.current.off("play", onPlay);
        if (onPause) playerRef.current.off("pause", onPause);
        playerRef.current.off("timeupdate", saveProgress);
        playerRef.current.off("ended");
        
        // Remove play button update handlers
        if (updatePlayButtonFn) {
          playerRef.current.off("play", updatePlayButtonFn);
          playerRef.current.off("playing", updatePlayButtonFn);
          playerRef.current.off("pause", updatePlayButtonFn);
          playerRef.current.off("paused", updatePlayButtonFn);
        }
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
