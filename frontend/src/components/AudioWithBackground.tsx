import React, { useState, useRef, useEffect } from "react";
import MediaPlayer from "./MediaPlayer";

import bgCity from "../assets/bg_city_work.png";
import bgFamily from "../assets/bg_family_and_house.png";
import bgFood from "../assets/bg_food_market.png";
import bgNature from "../assets/bg_nature.png";
import bgStudy from "../assets/bg_study_culture.png";
import bgTravel from "../assets/bg_travel.png";

import "./AudioWithBackground.css";

import type { Media } from "../types/media"; // ✅ правильный импорт

interface Topic {
  id: number;
  name: string;
}

const AudioWithBackground: React.FC<{ media: Media }> = ({ media }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const prevId = useRef<number | null>(null);

  // Сбрасываем состояние при смене трека
  useEffect(() => {
    if (prevId.current !== media.id) {
      setIsPlaying(false);
      prevId.current = media.id;
    }
  }, [media.id]);

  const topics = (media.topics || []).map((t) => t.name.toLowerCase());

  const getBackground = (): string => {
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
    return bgNature;
  };

  const background = getBackground();

  return (
    <div className={`audio-scene ${isPlaying ? "playing" : ""}`}>
      <div
        className="scene-background fade-in"
        style={{ backgroundImage: `url(${background})` }}
      />

      <div className="scene-player">
        <MediaPlayer
          media={media}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default AudioWithBackground;
