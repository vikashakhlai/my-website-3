import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN"; // ✅ добавили поле роли
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

  const API_URL = "http://localhost:3001/api/v1/auth";

  // 🔁 Проверяем токен при старте
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn("Ошибка проверки токена:", res.status);
          setUser(null);
          return;
        }

        const data = await res.json();

        // ✅ убедимся, что роль приходит (на бэкенде нужно добавить её в /auth/me)
        setUser({
          id: data.id,
          email: data.email,
          role: data.role || "USER", // fallback
        });
      } catch (err) {
        console.error("Ошибка авторизации:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔐 Вход по токену
  const login = async (token: string) => {
    try {
      localStorage.setItem("token", token);

      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Ошибка при получении данных пользователя");

      const userData = await res.json();
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role || "USER",
      });
    } catch (err) {
      console.error("Ошибка входа:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  // 🚪 Выход
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Загрузка...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
