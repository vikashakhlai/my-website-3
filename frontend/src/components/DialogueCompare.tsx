import React from "react";
import "./DialogueCompare.css";
import useScrollToTop from "../hooks/useScrollToTop";

import type { Media } from "../types/media"; // ✅ используем общий тип

interface Script {
  id: number;
  textOriginal: string;
  speakerName: string;
  orderIndex: number;
}

interface Dialogue {
  id: number;
  title: string;
  description?: string;
  medias: Array<Media & {
    scripts?: Script[]; // ✅ scripts из API
    dialect?: { id: number; name: string } | null; // ✅ dialect из API
  }>;
}

const DialogueCompare: React.FC<{
  dialogue: Dialogue;
  selectedMediaId: number;
}> = ({ dialogue, selectedMediaId }) => {
  useScrollToTop();

  if (!dialogue.medias || dialogue.medias.length < 2) return null;

  // ✅ API возвращает dialect: { id, name } | null, а не dialectId
  const fusha = dialogue.medias.find((m) => m.dialect === null || m.dialect === undefined);

  // ✅ выбираем ТОЛЬКО тот диалект, который соответствует открытой карточке
  const dialect = dialogue.medias.find((m) => m.id === selectedMediaId);

  if (!fusha || !dialect) return null;

  // ✅ Проверяем наличие scripts перед использованием
  if (!fusha.scripts || !dialect.scripts) return null;

  const fushaLines = [...fusha.scripts].sort(
    (a: Script, b: Script) => a.orderIndex - b.orderIndex
  );
  const dialectLines = [...dialect.scripts].sort(
    (a: Script, b: Script) => a.orderIndex - b.orderIndex
  );

  const cleanText = (line: Script) => {
    if (line.textOriginal.startsWith(line.speakerName + ":")) {
      return line.textOriginal.replace(line.speakerName + ":", "").trim();
    }
    return line.textOriginal;
  };

  const isContextLine = (line: Script) => line.speakerName.trim() === "سياق";

  return (
    <div className="dialogue-compare">
      <h3 className="dialogue-title">
        <span className="ru">{dialogue.title.split("/")[1]?.trim()}</span>
        <span className="ar">{dialogue.title.split("/")[0]?.trim()}</span>
      </h3>

      <div className="dialogue-grid">
        {/* Фусха */}
        <div className="dialogue-box" dir="rtl">
          <div className="dialogue-header">
            <h4>فصحى / Фусха</h4>
          </div>
          <div className="dialogue-content">
            {fushaLines.map((line) => (
              <div
                key={line.id}
                className={`dialogue-row ${
                  isContextLine(line) ? "context" : ""
                }`}
              >
                {!isContextLine(line) && (
                  <span className="speaker">{line.speakerName}</span>
                )}
                <span className="text">{cleanText(line)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Диалект */}
        <div className="dialogue-box" dir="rtl">
          <div className="dialogue-header">
            <h4>{dialect.dialect?.name || "Диалект"}</h4>
          </div>
          <div className="dialogue-content">
            {dialectLines.map((line) => (
              <div
                key={line.id}
                className={`dialogue-row ${
                  isContextLine(line) ? "context" : ""
                }`}
              >
                {!isContextLine(line) && (
                  <span className="speaker">{line.speakerName}</span>
                )}
                <span className="text">{cleanText(line)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueCompare;
