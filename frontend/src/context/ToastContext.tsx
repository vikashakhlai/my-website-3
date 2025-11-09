// src/context/ToastContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../components/Toast/ToastContainer.module.css";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeouts = useRef<Map<number, number>>(new Map());
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeoutId = timeouts.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeouts.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);

      const timeoutId = window.setTimeout(() => {
        removeToast(id);
      }, 4000);
      timeouts.current.set(id, timeoutId);
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastContainer} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

