import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";
import { Outlet, useLocation } from "react-router-dom";
import DictionaryWidget from "../pages/DictionaryPage/DictionaryWidget";
import { useState } from "react";

const Layout = () => {
  const [isDictOpen, setIsDictOpen] = useState(false);
  const location = useLocation();

  // пути, где словарь должен быть скрыт
  const hiddenDictionaryRoutes = ["/DictionaryPage", "/login", "/register"];

  const isDictionaryHidden = hiddenDictionaryRoutes.includes(location.pathname);

  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>

      {/* показываем словарь только если маршрут разрешён */}
      {!isDictionaryHidden && (
        <>
          <button
            className="dictionary-trigger"
            onClick={() => setIsDictOpen(true)}
            aria-label="Открыть словарь"
          >
            📖
          </button>

          <DictionaryWidget
            isOpen={isDictOpen}
            onClose={() => setIsDictOpen(false)}
          />
        </>
      )}

      <Footer />
    </>
  );
};

export default Layout;
