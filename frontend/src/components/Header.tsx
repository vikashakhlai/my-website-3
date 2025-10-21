import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/Picsart_25-10-09_01-04-21-668.png";
import Navigation from "./Navigation";
import { useAuth } from "../context/AuthContext";
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
        <Link to="/" className="logo-link">
          <img src={Logo} alt="Оазис" className="logo" />
          <span className="logo-text">Оазис</span>
        </Link>

        <Navigation />

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <span className="user-name">
                👋 {user?.email || "Пользователь"}
              </span>
              <button onClick={handleLogout} className="btn btn-logout">
                Выйти
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
