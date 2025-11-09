// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { api, setUnauthorizedHandler } from "../api/auth";
import Loader from "../components/Loader";

interface User {
  id: string;
  email: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN" | "TUTOR";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialLoadRef = useRef(true);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  };

  useEffect(() => {
    fetchCurrentUser().catch(() => {
      // handled in fetchCurrentUser
    });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      const isInitial = initialLoadRef.current;
      initialLoadRef.current = false;
      setUser(null);
      setLoading(false);

      if (isInitial) {
        return;
      }

      const path = window.location.pathname;
      if (path.startsWith("/login") || path.startsWith("/register")) {
        return;
      }

      const returnTo = encodeURIComponent(
        `${path}${window.location.search}${window.location.hash}` || "/"
      );
      window.location.href = `/login?returnTo=${returnTo}`;
    };

    setUnauthorizedHandler(handleUnauthorized);

    return () => {
      setUnauthorizedHandler(() => {});
    };
  }, []);

  const login = async () => {
    setLoading(true);
    await fetchCurrentUser().catch(() => {
      // errors handled inside fetchCurrentUser
    });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Ошибка выхода:", err);
    } finally {
      setUser(null);
      setLoading(false);
      initialLoadRef.current = false;
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
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
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
