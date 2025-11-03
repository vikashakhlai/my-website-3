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
  medias: Media[]; // ✅ теперь совместимо
}

const DialogueCompare: React.FC<{
  dialogue: Dialogue;
  selectedMediaId: number;
}> = ({ dialogue, selectedMediaId }) => {
  useScrollToTop();

  if (!dialogue.medias || dialogue.medias.length < 2) return null;

  const fusha = dialogue.medias.find((m) => m.dialectId === null);

  // ✅ выбираем ТОЛЬКО тот диалект, который соответствует открытой карточке
  const dialect = dialogue.medias.find((m) => m.id === selectedMediaId);

  if (!fusha || !dialect) return null;

  const fushaLines = [...(fusha as any).scripts].sort(
    (a: Script, b: Script) => a.orderIndex - b.orderIndex
  );
  const dialectLines = [...(dialect as any).scripts].sort(
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
