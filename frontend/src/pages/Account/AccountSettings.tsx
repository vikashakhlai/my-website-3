import { FormEvent, useMemo, useState } from "react";
import { api } from "../../api/auth";
import styles from "./AccountSettings.module.css";
import { useToast } from "../../context/ToastContext";

interface FormState {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialState: FormState = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const AccountSettings = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (state: FormState) => {
    const nextErrors: Partial<FormState> = {};

    if (!state.oldPassword.trim()) {
      nextErrors.oldPassword = "Укажите текущий пароль";
    }

    if (!state.newPassword.trim()) {
      nextErrors.newPassword = "Укажите новый пароль";
    } else if (state.newPassword.length < 8) {
      nextErrors.newPassword = "Пароль должен содержать минимум 8 символов";
    }

    if (!state.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Подтвердите новый пароль";
    } else if (state.newPassword !== state.confirmPassword) {
      nextErrors.confirmPassword = "Пароли должны совпадать";
    }

    return nextErrors;
  };

  const isValid = useMemo(() => {
    const nextErrors = validate(form);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const handleChange =
    (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch("/users/change-password", form);
      showToast("Пароль успешно обновлён", "success");
      setForm(initialState);
      setErrors({});
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        showToast("Неверный текущий пароль", "error");
        setErrors((prev) => ({
          ...prev,
          oldPassword: "Проверьте текущий пароль",
        }));
      } else {
        showToast("Не удалось обновить пароль", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.intro}>
        <h2>Настройки безопасности</h2>
        <p>Обновите пароль для защиты вашего аккаунта Oasis.</p>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="oldPassword">
            Текущий пароль
          </label>
          <input
            id="oldPassword"
            type="password"
            autoComplete="current-password"
            className={styles.input}
            value={form.oldPassword}
            onChange={handleChange("oldPassword")}
            aria-invalid={!!errors.oldPassword}
            aria-describedby="oldPassword-error"
          />
          {errors.oldPassword && (
            <span id="oldPassword-error" className={styles.errorText}>
              {errors.oldPassword}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="newPassword">
            Новый пароль
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className={styles.input}
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            aria-invalid={!!errors.newPassword}
            aria-describedby="newPassword-error"
          />
          {errors.newPassword && (
            <span id="newPassword-error" className={styles.errorText}>
              {errors.newPassword}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="confirmPassword">
            Подтверждение пароля
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={styles.input}
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby="confirmPassword-error"
          />
          {errors.confirmPassword && (
            <span id="confirmPassword-error" className={styles.errorText}>
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;

