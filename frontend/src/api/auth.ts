import axios from "axios";

// 📦 Используем /api-nest для прокси (Vite proxy переписывает на /api/v1)
// В production можно использовать прямой URL через VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || "/api-nest";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 🔐 Добавляем токен в каждый запрос автоматически
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Обрабатываем 401 (если токен протух — разлогиниваем)
// Редирект будет обработан через AuthContext
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Вызываем обработчик из AuthContext для редиректа
      if (onUnauthorized) {
        onUnauthorized();
      } else if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// 🔸 Регистрация
export const registerUser = async (email: string, password: string) => {
  const { data } = await api.post("/auth/register", { email, password });

  // Сохраняем токен сразу, если вернулся
  if (data?.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  return data;
};

// 🔸 Вход
export const loginUser = async (email: string, password: string) => {
  const { data } = await api.post("/auth/login", { email, password });

  if (data?.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  return data;
};

// 🔸 Выход (удаляем токен)
export const logoutUser = () => {
  localStorage.removeItem("token");
};
