import { AxiosError } from "axios";

/**
 * Универсальная обработка ошибок API без any
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { message?: string })?.message ||
      "Ошибка при обращении к серверу"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Неизвестная ошибка";
};
