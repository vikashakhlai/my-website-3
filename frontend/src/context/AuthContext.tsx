// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setUnauthorizedHandler } from "../api/auth";

interface User {
  id: string;
  email: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN" | "TUTOR";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Проверяем токен при перезагрузке страницы
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await api.get<User>("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔐 Настраиваем обработчик 401 ошибок
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      setUser(null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    setUnauthorizedHandler(handleUnauthorized);

    return () => {
      setUnauthorizedHandler(() => {});
    };
  }, []);

  // 🔐 Логин (сюда приходит token, как и раньше)
  const login = async (token: string) => {
    try {
      localStorage.setItem("token", token);

      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch (err) {
      console.error("Ошибка входа:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  // 🚪 Выход - перенаправляем на страницу входа
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // Используем window.location для надежного редиректа
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>Загрузка...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
