// src/components/ArticlePage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Article } from "../types/article";

import {
  isFillInTheBlanksExercise,
  isFlashcardsExercise,
  isMatchingPairsExercise,
  isMultipleChoiceExercise,
  isOpenQuestionExercise,
} from "../utils/exerciseUtils";

// Компоненты упражнений
import FillInTheBlanksExerciseComponent from "../components/Exercises/FillInTheBlanksExercise";
import MultipleChoiceExercise from "../components/Exercises/MultipleChoiceExercise";
import OpenQuestionExercise from "./Exercises/OpenQuestionExercise";
import FlashcardsExercise from "./Exercises/FlashcardsExercise";
import MatchingPairsExercise from "./Exercises/MatchingPairsExercise";

import useScrollToTop from "../hooks/useScrollToTop";
import FavoriteButton from "../components/FavoriteButton";
import { StarRating } from "../components/StarRating";
import { CommentsSection } from "../components/CommentsSection";

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useScrollToTop();

  // 🔹 Загружаем статью
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const articleId = parseInt(id, 10);
    if (isNaN(articleId) || articleId <= 0) {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`/api-nest/articles/${articleId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) navigate("/");
          else throw new Error("Ошибка загрузки статьи");
        }
        return res.json();
      })
      .then((data) => {
        setArticle(data);
      })
      .catch((err) => {
        console.error("Ошибка загрузки статьи:", err);
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // 🔹 Проверяем избранное
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !id) return;

        const res = await fetch("/api-nest/favorites/article", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const favorites = await res.json();
        setIsFavorite(favorites.some((f: any) => f.id === Number(id)));
      } catch (err) {
        console.error("Ошибка при загрузке избранного:", err);
      }
    };

    fetchFavoriteStatus();
  }, [id]);

  // 🔹 Добавление / удаление из избранного
  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Для добавления в избранное нужно войти в аккаунт.");
      return;
    }

    try {
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch(`/api-nest/favorites/article/${id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Ошибка при изменении избранного");
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Ошибка избранного:", err);
    }
  };

  if (loading) return <div className="article-page">Загрузка...</div>;
  if (!article) return <div className="article-page">Статья не найдена</div>;

  return (
    <div className="article-page">
      {/* 🖼️ Картинка */}
      <img
        src={article.imageUrl}
        alt={article.titleRu}
        className="article-image"
      />

      {/* 🏷️ Заголовок и избранное */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "space-between",
        }}
      >
        <h1 className="article-title">{article.titleRu}</h1>
        <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
      </div>

      <h2 className="article-title-arabic">{article.titleAr}</h2>

      {/* 📚 Тема и ⭐ рейтинг */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          margin: "10px 0",
        }}
      >
        <div className="article-theme">
          Тема: <span className="article-theme-label">{article.themeRu}</span>
        </div>

        {/* ⭐ Универсальный рейтинг */}
        <StarRating
          targetType="article"
          targetId={article.id}
          average={article.averageRating ?? null}
          userRating={article.userRating ?? null}
        />
      </div>

      {/* 📝 Описание */}
      {article.description && (
        <p className="article-description">{article.description}</p>
      )}

      {/* 📖 Основной текст */}
      <div
        className="article-content rtl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* 🧩 Упражнения */}
      {article.exercises && article.exercises.length > 0 && (
        <div className="article-exercises">
          <h3 className="article-exercises-title">Упражнения</h3>
          {article.exercises.map((exercise) => {
            if (isFillInTheBlanksExercise(exercise)) {
              return (
                <FillInTheBlanksExerciseComponent
                  key={exercise.id}
                  exercise={exercise}
                />
              );
            }

            if (isMultipleChoiceExercise(exercise)) {
              return (
                <MultipleChoiceExercise key={exercise.id} exercise={exercise} />
              );
            }

            if (isOpenQuestionExercise(exercise)) {
              return (
                <OpenQuestionExercise key={exercise.id} exercise={exercise} />
              );
            }

            if (isFlashcardsExercise(exercise)) {
              return (
                <FlashcardsExercise key={exercise.id} exercise={exercise} />
              );
            }

            if (isMatchingPairsExercise(exercise)) {
              return (
                <MatchingPairsExercise key={exercise.id} exercise={exercise} />
              );
            }

            return null;
          })}
        </div>
      )}

      {/* 💬 Комментарии */}
      <div style={{ marginTop: "50px" }}>
        <CommentsSection
          targetType="article"
          targetId={article.id}
          apiBase="/api-nest"
        />
      </div>
    </div>
  );
};

export default ArticlePage;
