import React, { useState } from "react";
import MediaPlayer from "./MediaPlayer";

// 🖼️ Импорт фонов
import bgCity from "../assets/bg_city_work.png";
import bgFamily from "../assets/bg_family_and_house.png";
import bgFood from "../assets/bg_food_market.png";
import bgNature from "../assets/bg_nature.png";
import bgStudy from "../assets/bg_study_culture.png";
import bgTravel from "../assets/bg_travel.png";

import "./AudioWithBackground.css";

interface Topic {
  id: number;
  name: string;
}

interface Media {
  id: number;
  title: string;
  mediaUrl: string;
  type: "video" | "audio" | "text";
  topics?: Topic[];
}

/**
 * 🎧 Компонент, который подставляет фоновое изображение
 * в зависимости от темы (topics), если тип media = "audio".
 */
const AudioWithBackground: React.FC<{ media: Media }> = ({ media }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (media.type !== "audio") return <MediaPlayer media={media} />;

  const topics = (media.topics || []).map((t) => t.name.toLowerCase());

  const getBackground = (): string | null => {
    if (topics.some((t) => ["еда", "покупки еды", "в магазине"].includes(t)))
      return bgFood;
    if (topics.some((t) => ["путешествия", "транспорт"].includes(t)))
      return bgTravel;
    if (topics.some((t) => ["в городе", "работа", "профессии"].includes(t)))
      return bgCity;
    if (topics.some((t) => ["природа", "экология", "животные"].includes(t)))
      return bgNature;
    if (topics.some((t) => ["учёба", "культура", "традиции"].includes(t)))
      return bgStudy;
    if (topics.some((t) => ["семья", "дом", "дети"].includes(t)))
      return bgFamily;
    return null;
  };

  const background = getBackground();
  if (!background) return <MediaPlayer media={media} />;

  return (
    <div className={`audio-scene ${isPlaying ? "playing" : ""}`}>
      <div
        className="scene-background"
        style={{ backgroundImage: `url(${background})` }}
      />

      <div className="scene-player">
        <MediaPlayer
          media={{
            ...media,
            // прокидываем "фейковый" коллбек для отслеживания проигрывания
          }}
        />
        <audio
          src={media.mediaUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default AudioWithBackground;
