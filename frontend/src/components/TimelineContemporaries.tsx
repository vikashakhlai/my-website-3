import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/auth";
import { PersonalityPreview } from "../pages/types/Personality";
import styles from "./TimelineContemporaries.module.css";

interface TimelineContemporariesProps {
  personalityId: number;
  currentYears: string;
}

const TimelineContemporaries = ({
  personalityId,
  currentYears,
}: TimelineContemporariesProps) => {
  const [contemporaries, setContemporaries] = useState<PersonalityPreview[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContemporaries = async () => {
      try {
        const response = await api.get(
          `/personalities/${personalityId}/contemporaries`
        );
        setContemporaries(response.data);
      } catch (err) {
        console.error("Ошибка загрузки современников:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContemporaries();
  }, [personalityId]);

  if (loading || contemporaries.length === 0) return null;

  // Парсим текущие годы (может быть "1984–" или "1984–наст.время")
  const yearsParts = currentYears.split(/–|—/).map((part) => part.trim());
  const currentStart = Number(yearsParts[0]);
  const endPart = yearsParts[1]?.toLowerCase();

  // Определяем, жив ли человек
  const isAlive =
    !endPart ||
    endPart === "" ||
    endPart.includes("наст") ||
    endPart.includes("present") ||
    isNaN(Number(endPart)) ||
    Number(endPart) >= new Date().getFullYear() - 2;

  // Если жив — текущий конец = текущий год, иначе парсим как число
  const currentEnd = isAlive
    ? new Date().getFullYear()
    : Number(endPart) || currentStart + 1;

  // Формируем массив всех лет
  const allYears = [
    ...contemporaries.map((p) => p.years.split(/–|—/).map(Number)),
    [currentStart, currentEnd],
  ];

  // Настройка диапазона
  let globalMin: number;
  let globalMax: number;

  if (isAlive) {
    const now = new Date().getFullYear();
    globalMax = now + 10;
    // отступ не более чем на 200 лет, но не меньше чем 80
    const offset = Math.min(Math.max(now - currentStart + 20, 80), 200);
    globalMin = now - offset;
  } else {
    const all = allYears.flat().filter((n) => !isNaN(n));
    const minYear = Math.min(...all);
    const maxYear = Math.max(...all);
    const padding = Math.max((maxYear - minYear) * 0.2, 30); // отступ пропорционально эпохе
    globalMin = minYear - padding;
    globalMax = maxYear + padding;
  }

  const range = globalMax - globalMin;

  // Автоматический шаг шкалы
  const step =
    range > 800
      ? 200
      : range > 400
      ? 100
      : range > 200
      ? 50
      : range > 100
      ? 20
      : 10;

  const scaleMarks: number[] = [];
  for (
    let year = Math.floor(globalMin / step) * step;
    year <= globalMax;
    year += step
  ) {
    scaleMarks.push(year);
  }

  return (
    <div className={styles.timelineSection}>
      <h3 className={styles.title}>Современники</h3>

      <div className={styles.timelineContainer}>
        {/* Линия таймлайна */}
        <div
          className={styles.timelineLine}
          style={{
            left: `${((scaleMarks[0] - globalMin) / range) * 100}%`,
            right: `${
              100 -
              ((scaleMarks[scaleMarks.length - 1] - globalMin) / range) * 100
            }%`,
          }}
        ></div>

        {/* Метки лет */}
        <div className={styles.scale}>
          {scaleMarks.map((year) => (
            <div
              key={year}
              className={styles.scaleMark}
              style={{ left: `${((year - globalMin) / range) * 100}%` }}
            >
              <span className={styles.scaleLabel}>{year}</span>
            </div>
          ))}
        </div>

        {/* Личности */}
        <div className={styles.persons}>
          {contemporaries.map((person) => {
            const [start] = person.years.split("–").map(Number);
            const left = ((start - globalMin) / range) * 100;

            return (
              <Link
                to={`/personalities/${person.id}`}
                key={person.id}
                className={styles.personMarker}
                style={{ left: `${left}%` }}
              >
                <div className={styles.avatarWrapper}>
                  <img
                    src={person.imageUrl}
                    alt={person.name}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.tooltip}>
                  <strong>{person.name}</strong>
                  <br />
                  {person.years}
                </div>
              </Link>
            );
          })}

          {/* Текущая личность */}
          <div
            className={styles.currentMarker}
            style={{ left: `${((currentStart - globalMin) / range) * 100}%` }}
          >
            <span className={styles.currentDot}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineContemporaries;
