import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const buildReturnTo = (location: ReturnType<typeof useLocation>) => {
  const path = location.pathname || "/";
  const search = location.search || "";
  const hash = location.hash || "";
  return `${path}${search}${hash}` || "/";
};

/**
 * Hook that ensures a user is authenticated before executing an action.
 * If the user is not authenticated, they will be redirected to the login page
 * with a pre-filled returnTo query parameter.
 */
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (onAuthorized?: () => void) => {
      if (!isAuthenticated) {
        const returnTo = encodeURIComponent(buildReturnTo(location));
        navigate(`/login?returnTo=${returnTo}`);
        return false;
      }

      onAuthorized?.();
      return true;
    },
    [isAuthenticated, location, navigate]
  );
};

