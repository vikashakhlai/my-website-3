// routes.js
import ArticlesPage from "../pages/ArticlesPage";
import BooksPage from "../pages/BooksPage";
import CoursesPage from "../pages/CoursesPage";
import DialectPage from "../pages/DialectPage";
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

const routes = [
  {
    element: <Layout />,
    children: [
      // 🔐 Защищённые маршруты
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/DictionaryPage",
        element: (
          <ProtectedRoute>
            <DictionaryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/ArticlesPage",
        element: (
          <ProtectedRoute>
            <ArticlesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/BooksPage",
        element: (
          <ProtectedRoute>
            <BooksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/DialectPage",
        element: (
          <ProtectedRoute>
            <DialectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/CoursesPage",
        element: (
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/StudentBooksPage",
        element: (
          <ProtectedRoute>
            <StudentBooksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/articles/:id",
        element: (
          <ProtectedRoute>
            <ArticlePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/books/:id",
        element: (
          <ProtectedRoute>
            <BookPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/textbooks/:id",
        element: (
          <ProtectedRoute>
            <TextbookPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/authors/:id",
        element: (
          <ProtectedRoute>
            <AuthorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/personalities/:id",
        element: (
          <ProtectedRoute>
            <PersonalityPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/personalities",
        element: (
          <ProtectedRoute>
            <AllPersonalitiesPage />
          </ProtectedRoute>
        ),
      },

      // 🔓 Незащищённые маршруты (доступны всем)
      { path: "/login", element: <AuthPage /> },
      { path: "/register", element: <AuthPage /> },
    ],
  },
];

export default routes;
