import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import styles from "./AccountPage.module.css";
import { useAuth } from "../../context/AuthContext";

const AccountPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isSettingsRoute = location.pathname.startsWith("/account/settings");
  const oasisButtonClass = [
    "btn",
    isSettingsRoute ? "btn-outline" : "btn-primary",
    styles.oasisButton,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Личный кабинет</h1>
            <p className={styles.subtitle}>
              Ваш персональный центр на платформе Oasis
            </p>
          </div>
          <div className={styles.tabs} aria-label="Навигация по личному кабинету">
            {isAuthenticated && (
              <Link to="/account" className={oasisButtonClass}>
                Мой Оазис
              </Link>
            )}
            <NavLink
              to="/account/settings"
              className={({ isActive }) =>
                [
                  "btn btn-outline",
                  styles.settingsLink,
                  isActive || location.pathname.startsWith("/account/settings")
                    ? styles.settingsActive
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              Настройки
            </NavLink>
          </div>
        </header>

        <section className={styles.card}>
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AccountPage;

