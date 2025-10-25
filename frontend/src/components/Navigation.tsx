import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <nav className="navigation">
      <Link
        to="/DictionaryPage"
        className={isActive("/DictionaryPage") ? "nav-link active" : "nav-link"}
      >
        Словарь
      </Link>
      <Link
        to="/CoursesPage"
        className={isActive("/CoursesPage") ? "nav-link active" : "nav-link"}
      >
        Курсы
      </Link>
      <Link
        to="/BooksPage"
        className={isActive("/BooksPage") ? "nav-link active" : "nav-link"}
      >
        Книги
      </Link>
      <Link
        to="/ArticlesPage"
        className={isActive("/ArticlesPage") ? "nav-link active" : "nav-link"}
      >
        Статьи
      </Link>
      <Link
        to="/dialects"
        className={isActive("/dialects") ? "nav-link active" : "nav-link"}
      >
        Диалект
      </Link>
      <Link
        to="/StudentBooksPage"
        className={
          isActive("/StudentBooksPage") ? "nav-link active" : "nav-link"
        }
      >
        Учебники
      </Link>
      <Link
        to="/personalities"
        className={
          isActive("/AllPersonalitiesPage") ? "nav-link active" : "nav-link"
        }
      >
        Личности
      </Link>
    </nav>
  );
};

export default Navigation;
