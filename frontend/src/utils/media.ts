// src/utils/media.ts

export function getMediaUrl(path?: string | null): string {
  if (!path) return "/default-book-cover.jpg";

  // Если это внешний URL — оставляем как есть
  if (path.startsWith("http")) return path;

  // Нормализуем путь: убедимся, что он начинается с '/'
  const normalizedPath = path.startsWith("/") ? path : "/" + path;

  // Для путей в uploads — используем относительный путь, чтобы работал прокси Vite
  if (normalizedPath.startsWith("/uploads/")) {
    return normalizedPath; // → /uploads/... → проксируется на бэкенд
  }

  // Для всего остального (например, API-генерируемых изображений) — используем API_BASE
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return `${API_BASE}${normalizedPath}`;
}
