import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaTelegram } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
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

        {/* Колонка 2: Контакты */}
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

        {/* Колонка 3: Навигация */}
        <div className="footer-col">
          <h3 className="footer-title">Навигация</h3>
          <nav>
            <ul className="footer-links">
              <li>
                <Link to="/about">О нас</Link>
              </li>
              <li>
                <Link to="/books">Книги</Link>
              </li>
              <li>
                <Link to="/dialects">Диалекты</Link>
              </li>
              <li>
                <Link to="/personalities">Личности</Link>
              </li>
              <li>
                <Link to="/contact">Контакты</Link>
              </li>
            </ul>
          </nav>
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
