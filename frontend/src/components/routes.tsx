// routes.js
import ArticlesPage from "../pages/ArticlesPage";
import BooksPage from "../pages/BooksPage";
import CoursesPage from "../pages/CoursesPage";
import DialectPage from "../pages/DialectPage.js";
import DictionaryPage from "../pages/DictionaryPage/DictionaryPage";
import HomePage from "../pages/HomePage";
import StudentBooksPage from "../pages/StudentBookPage/StudentBooksPage";
import ArticlePage from "../components/ArticlePage";
import BookPage from "./BookPage/BookPage";
import Layout from "./Layout";
import TextbookPage from "./TextbookPage";
import AuthorPage from "./AuthorPage";
import PersonalityPage from "./PersonalityPage";
import AuthPage from "../pages/Auth/AuthPage";
import { ProtectedRoute } from "./ProtectedRoute";
import AllPersonalitiesPage from "../pages/AllPersonalitiesPage";
import DialectExercisePage from "../pages/DialectExercisePage/DialectExercisePage.js";
import AboutPage from "./AboutPage.js";
import AccountPage from "../pages/Account/AccountPage";
import AccountHome from "../pages/Account/AccountHome";
import AccountSettings from "../pages/Account/AccountSettings";

const routes = [
  {
    element: <Layout />,
    children: [
      // ✅ Публичные маршруты
      { path: "/", element: <HomePage /> },
      { path: "/DictionaryPage", element: <DictionaryPage /> },
      { path: "/ArticlesPage", element: <ArticlesPage /> },
      { path: "/articles", element: <ArticlesPage /> },
      { path: "/BooksPage", element: <BooksPage /> },
      { path: "/books", element: <BooksPage /> },
      { path: "/StudentBooksPage", element: <StudentBooksPage /> },
      { path: "/textbooks", element: <StudentBooksPage /> },

      { path: "/articles/:id", element: <ArticlePage /> },
      { path: "/books/:id", element: <BookPage /> },
      { path: "/textbooks/:id", element: <TextbookPage /> },

      { path: "/authors/:id", element: <AuthorPage /> },
      { path: "/personalities/:id", element: <PersonalityPage /> },
      { path: "/personalities", element: <AllPersonalitiesPage /> },
      {path: "/about", element: <AboutPage/>},

      // 🔒 Защищённые маршруты (только авторизованные)
      {
        path: "/CoursesPage",
        element: (
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dialects",
        element: (
          <ProtectedRoute>
            <DialectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dialects/:slug/media/:id",
        element: (
          <ProtectedRoute>
            <DialectExercisePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/account",
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AccountHome /> },
          {
            path: "settings",
            element: <AccountSettings />,
          },
        ],
      },

      // 🔐 Auth
      { path: "/login", element: <AuthPage /> },
      { path: "/register", element: <AuthPage /> },

      // ❗ Личный кабинет если будет
      // {
      //   path: "/profile",
      //   element: (
      //     <ProtectedRoute>
      //       <ProfilePage />
      //     </ProtectedRoute>
      //   ),
      // },
    ],
  },
];

export default routes;
