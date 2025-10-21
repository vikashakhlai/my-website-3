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
            Востока. Откройте для себя мир изящных букв, мелодичных звуков и
            глубоких смыслов. Путешествуйте по страницам истории, изучайте
            искусство письма и погружайтесь в магию одного из древнейших языков
            мира.
          </p>
        </div>

        {/* Колонка 2: Контакты */}
        <div className="footer-col">
          <h3 className="footer-title">Контакты</h3>
          <address className="footer-text">
            Адрес: Улица, Город, Страна
            <br />
            Телефон: +1 (123) 456-7890
            <br />
            Email: <a href="mailto:info@example.com">info@example.com</a>
          </address>
        </div>

        {/* Колонка 3: Навигация */}
        <div className="footer-col">
          <h3 className="footer-title">Навигация</h3>
          <nav>
            <ul className="footer-links">
              <li>
                <a href="/about">О нас</a>
              </li>
              <li>
                <a href="/services">Услуги</a>
              </li>
              <li>
                <a href="/contact">Контакты</a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Колонка 4: Соцсети */}
        <div className="footer-col">
          <h3 className="footer-title">Социальные сети</h3>
          <div className="social-icons">
            <a href="#" aria-label="Telegram">
              <FaTelegram size={24} />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter size={24} />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Оазис. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
