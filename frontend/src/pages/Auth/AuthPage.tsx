import { useLocation, useNavigate } from "react-router-dom";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData,
} from "./validation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/auth";
import "./auth.css";
import { useState } from "react";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isRegister = location.pathname === "/register";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = { ...data } as any;
      if (isRegister) delete payload.confirmPassword;

      const res = await api.post(endpoint, payload);

      const token = res.data?.access_token;
      if (!token) throw new Error("Токен не получен от сервера");

      // ✅ login() только обновляет контекст
      await login(token);

      showToast(
        isRegister ? "Регистрация прошла успешно!" : "Вы успешно вошли!",
        "success"
      );

      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при запросе авторизации";
      showToast(msg, "error");
    }
  };

  return (
    <div className="auth-container fade-in">
      <h2>{isRegister ? "Регистрация" : "Вход"}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <div className="form-group">
          <label>Email</label>
          <input type="email" {...register("email")} />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Пароль</label>
          <input type="password" {...register("password")} />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        {isRegister && (
          <div className="form-group">
            <label>Подтвердите пароль</label>
            <input type="password" {...register("confirmPassword")} />
            {(errors as FieldErrors<RegisterFormData>).confirmPassword && (
              <p className="error-message">
                {
                  (errors as FieldErrors<RegisterFormData>).confirmPassword
                    ?.message
                }
              </p>
            )}
          </div>
        )}

        <button type="submit" className="btn">
          {isRegister ? "Зарегистрироваться" : "Войти"}
        </button>
      </form>

      <p className="switch-text">
        {isRegister ? (
          <>
            Уже есть аккаунт?{" "}
            <button className="link-btn" onClick={() => navigate("/login")}>
              Войти
            </button>
          </>
        ) : (
          <>
            Нет аккаунта?{" "}
            <button className="link-btn" onClick={() => navigate("/register")}>
              Зарегистрируйтесь
            </button>
          </>
        )}
      </p>

      {toastMessage && (
        <div className={`toast ${toastType}`}>{toastMessage}</div>
      )}
    </div>
  );
}
