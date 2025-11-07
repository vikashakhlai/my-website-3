// src/utils/media.ts
import { api } from "../api/auth";

export function getMediaUrl(path?: string | null): string {
  if (!path) return "/default-book-cover.jpg";

  // Внешний URL (http/https) — возвращаем как есть
  if (/^https?:\/\//.test(path)) return path;

  // Добавляем ведущий слэш, если его нет
  const normalized = path.startsWith("/") ? path : `/${path}`;

  // Если это статический upload — пусть идет как /uploads/...
  if (normalized.startsWith("/uploads/")) {
    return normalized; // Vite/NGINX проксирует на backend
  }

  // ✅ Абсолютный путь от API — без дублирования .env
  const base = api.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${base}${normalized}`;
}
