import { useRef, useLayoutEffect } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "./MediaPlayer.css";
import "@videojs/themes/dist/fantasy/index.css";

interface Media {
  id: number;
  title: string;
  mediaUrl: string;
  previewUrl?: string | null;
  subtitlesLink?: string | null;
  type: "video" | "audio" | "text";
}

interface Props {
  media: Media;
}

const MediaPlayer: React.FC<Props> = ({ media }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useLayoutEffect(() => {
    if (!media) return;
    const el = videoRef.current;
    if (!el) return;

    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const isAudio = media.type === "audio";

    const timer = setTimeout(() => {
      const player = videojs(el, {
        controls: true,
        preload: "auto",
        fluid: false,
        responsive: false,
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

      player.ready(() => {
        const playerEl = player.el();
        if (isAudio && playerEl) {
          playerEl.style.background = "transparent";
        }

        if (!isAudio && media.subtitlesLink) {
          player.addRemoteTextTrack(
            {
              kind: "subtitles",
              src: media.subtitlesLink!,
              srclang: "ar",
              label: "Арабский",
              default: false,
            },
            false
          );
        }
      });

      playerRef.current = player;
    }, 200);

    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [media]);

  return (
    <div
      className={`media-wrapper ${media.type === "audio" ? "audio" : "video"}`}
      data-vjs-player
    >
      {media.type === "audio" ? (
        <audio
          ref={videoRef}
          className={`video-js vjs-no-big-play-button`}
          controls
        />
      ) : (
        <video
          ref={videoRef}
          className={`video-js vjs-big-play-centered vjs-theme-city`}
          controls
        />
      )}
    </div>
  );
};

export default MediaPlayer;
