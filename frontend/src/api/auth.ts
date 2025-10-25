import axios from "axios";

// 📦 Определяем базовый URL в зависимости от среды
const isDev = import.meta.env.DEV;
// 🚀 теперь API_BASE будет идти напрямую на бэкенд
const API_BASE = isDev
  ? "http://localhost:3001/api/v1" // ✅ напрямую в Nest
  : import.meta.env.VITE_API_URL || "https://localhost:3001/api/v1";
  
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Можно сделать редирект, если нужно:
      if (window.location.pathname !== "/login") {
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
