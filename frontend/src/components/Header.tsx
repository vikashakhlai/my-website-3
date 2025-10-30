import { Link, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { useAuth } from "../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* 🔹 ЛОГО */}
        <Link to="/" className="brand">
          <span className="brand-text">Оазис</span>
        </Link>

        {/* 🔹 НАВИГАЦИЯ */}
        <Navigation />

        {/* 🔹 АВТОРИЗАЦИЯ */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="user-email">
                {user?.email || "Личный кабинет"}
              </Link>
              <button
                onClick={handleLogout}
                className="logout-icon"
                title="Выйти"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Войти
              </Link>
              <Link to="/register" className="btn btn-primary">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
