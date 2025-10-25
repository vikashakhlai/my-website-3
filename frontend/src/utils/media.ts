// src/utils/media.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function getMediaUrl(path?: string | null): string {
  if (!path) return "/default-book-cover.jpg";

  // если уже полный URL — возвращаем как есть
  if (path.startsWith("http")) return path;

  // сейчас все пути в БД начинаются с '/', так что просто добавляем домен
  return `${API_BASE}${path}`;
}
