import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api-nest";

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshPromise: Promise<AxiosResponse<any>> | null = null;

const shouldSkipRefresh = (config: InternalAxiosRequestConfig) => {
  if (!config.url) return false;
  return ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((path) =>
    config.url!.includes(path)
  );
};

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SAFE_METHODS = new Set(["get", "head", "options"]);
const isBrowser = typeof document !== "undefined";

const getCookie = (name: string): string | null => {
  if (!isBrowser) return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
};

let csrfPromise: Promise<string | null> | null = null;

const fetchCsrfToken = (): Promise<string | null> => {
  if (!isBrowser) return Promise.resolve(null);

  if (!csrfPromise) {
    csrfPromise = api
      .get("/auth/csrf", { withCredentials: true })
      .then(() => getCookie(CSRF_COOKIE_NAME))
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

const ensureCsrfToken = async (): Promise<string | null> => {
  if (!isBrowser) return null;

  let token = getCookie(CSRF_COOKIE_NAME);
  if (token) return token;

  token = await fetchCsrfToken();
  return token;
};

const attachCsrfHeader = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  const method = config.method?.toLowerCase();
  if (!method || SAFE_METHODS.has(method)) {
    return config;
  }

  const token = await ensureCsrfToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers[CSRF_HEADER_NAME] = token;
  }

  return config;
};

const refreshCsrfAndRetry = async (
  err: AxiosError
): Promise<AxiosResponse<any>> => {
  const { config } = err;
  if (!config) {
    return Promise.reject(err);
  }

  if (!isBrowser) {
    return Promise.reject(err);
  }

  const originalMethod = config.method?.toLowerCase();
  if (originalMethod && SAFE_METHODS.has(originalMethod)) {
    return Promise.reject(err);
  }

  if ((config as any)._csrfRetried) {
    return Promise.reject(err);
  }

  (config as any)._csrfRetried = true;

  await fetchCsrfToken();
  const token = getCookie(CSRF_COOKIE_NAME);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers[CSRF_HEADER_NAME] = token;
  }

  return api(config);
};

const applyCsrfInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => attachCsrfHeader(config),
    (error) => Promise.reject(error)
  );
};

applyCsrfInterceptors(api);
applyCsrfInterceptors(refreshClient);

const triggerRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient.post("/auth/refresh").finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise.catch((error) => {
    onUnauthorized?.();
    throw error;
  });
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;

    if (!response || !config) {
      return Promise.reject(error);
    }

    if (
      response.status === 403 &&
      (response.data as any)?.message === "CSRF token mismatch"
    ) {
      try {
        return await refreshCsrfAndRetry(error);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    if (response.status !== 401 || (config as any)._retry || shouldSkipRefresh(config)) {
      return Promise.reject(error);
    }

    (config as any)._retry = true;

    try {
      await triggerRefresh();
      return api(config);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export { api };
