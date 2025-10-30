import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleToggle = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navigation">
      <div className="nav-container">
        <button
          className={`burger ${menuOpen ? "open" : ""}`}
          onClick={handleToggle}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${menuOpen ? "show" : ""}`}>
          {[
            { to: "/DictionaryPage", label: "Словарь" },
            { to: "/CoursesPage", label: "Курсы" },
            { to: "/BooksPage", label: "Книги" },
            { to: "/ArticlesPage", label: "Статьи" },
            { to: "/dialects", label: "Диалект" },
            { to: "/StudentBooksPage", label: "Учебники" },
            { to: "/personalities", label: "Личности" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={isActive(to) ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
