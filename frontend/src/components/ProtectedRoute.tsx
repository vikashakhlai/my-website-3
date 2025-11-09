import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Загрузка...</p>;
  if (!user) {
    const returnTo = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}` || "/"
    );
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }
  return children;
};
