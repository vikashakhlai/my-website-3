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

import FillInTheBlanksExerciseComponent from "../components/Exercises/FillInTheBlanksExercise";
import MultipleChoiceExercise from "../components/Exercises/MultipleChoiceExercise";
import OpenQuestionExercise from "./Exercises/OpenQuestionExercise";
import FlashcardsExercise from "./Exercises/FlashcardsExercise";
import MatchingPairsExercise from "./Exercises/MatchingPairsExercise";

import useScrollToTop from "../hooks/useScrollToTop";
import FavoriteButton from "../components/FavoriteButton";
import { StarRating } from "../components/StarRating";
import { CommentsSection } from "../components/CommentsSection";
import { api } from "../api/auth";

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useScrollToTop();

  // ✅ Загружаем статью
  useEffect(() => {
    if (!id) return navigate("/");

    const articleId = Number(id);
    if (!articleId) return navigate("/");

    api
      .get(`/articles/${articleId}`)
      .then((res) => setArticle(res.data))
      .catch((err) => {
        console.error("Ошибка загрузки статьи:", err);
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // ✅ Проверяем избранное
  useEffect(() => {
    if (!id) return;
    api
      .get("/favorites/article")
      .then((res) => {
        setIsFavorite(res.data.some((f: any) => f.id === Number(id)));
      })
      .catch(() => {});
  }, [id]);

  // ✅ Тоггл избранного
  const toggleFavorite = async () => {
    try {
      const method = isFavorite ? "delete" : "post";
      await api[method](`/favorites/article/${id}`);
      setIsFavorite((prev) => !prev);
    } catch (err) {
      console.error("Ошибка избранного:", err);
      alert("Ошибка! Нужно войти.");
    }
  };

  if (loading) return <div className="article-page">Загрузка...</div>;
  if (!article) return <div className="article-page">Статья не найдена</div>;

  return (
    <div className="article-page">
      <img
        src={article.imageUrl}
        alt={article.titleRu}
        className="article-image"
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h1 className="article-title">{article.titleRu}</h1>
        <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
      </div>

      <h2 className="article-title-arabic">{article.titleAr}</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          margin: "10px 0",
        }}
      >
        <div className="article-theme">
          Тема: <span className="article-theme-label">{article.themeRu}</span>
        </div>

        <StarRating
          targetType="article"
          targetId={article.id}
          average={article.averageRating ?? null}
          userRating={article.userRating ?? null}
        />
      </div>

      {article.description && (
        <p className="article-description">{article.description}</p>
      )}

      <div
        className="article-content rtl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.exercises?.length > 0 && (
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

      <div style={{ marginTop: 50 }}>
        <CommentsSection targetType="article" targetId={article.id} />
      </div>
    </div>
  );
};

export default ArticlePage;
