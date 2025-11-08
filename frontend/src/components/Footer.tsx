import { Link, useLocation } from "react-router-dom";
import { FaTwitter, FaInstagram, FaTelegram } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Navigation items matching the Navigation component
  const navItems = [
    { to: "/DictionaryPage", label: "Словарь" },
    { to: "/CoursesPage", label: "Курсы" },
    { to: "/BooksPage", label: "Книги" },
    { to: "/ArticlesPage", label: "Статьи" },
    { to: "/dialects", label: "Диалект" },
    { to: "/StudentBooksPage", label: "Учебники" },
    { to: "/personalities", label: "Личности" },
    { to: "/about", label: "О нас" },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Колонка 1: О компании */}
        <div className="footer-col">
          <h3 className="footer-title">Оазис</h3>
          <p className="footer-text">
            Арабский язык — ключ к пониманию богатого культурного наследия
            Востока. Погружайтесь в диалекты, литературу, историю и живую
            культуру.
          </p>
        </div>

        {/* Колонка 2: Навигация (matching Navigation component) */}
        <div className="footer-col">
          <h3 className="footer-title">Навигация</h3>
          <nav className="footer-nav">
            <ul className="footer-links">
              {navItems.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={isActive(to) ? "footer-link active" : "footer-link"}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Колонка 3: Контакты */}
        <div className="footer-col">
          <h3 className="footer-title">Контакты</h3>
          <address className="footer-text">
            Email: <a href="mailto:info@oasis.arabic">info@oasis.arabic</a>
            <br />
            Telegram:{" "}
            <a href="https://t.me/oasis_ar" target="_blank" rel="noreferrer">
              @oasis_ar
            </a>
          </address>
        </div>

        {/* Колонка 4: Соцсети */}
        <div className="footer-col">
          <h3 className="footer-title">Соцсети</h3>
          <div className="social-icons">
            <a
              href="https://t.me/oasis_ar"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
            >
              <FaTelegram size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Оазис. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
