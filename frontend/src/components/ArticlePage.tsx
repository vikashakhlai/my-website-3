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

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);

  useScrollToTop();

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

    fetch(`/api-nest/articles/${articleId}`)
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
      });
  }, [id, navigate]);

  if (!article) {
    return <div className="article-page">Загрузка...</div>;
  }

  return (
    <div className="article-page">
      {/* Картинка */}
      <img
        src={article.imageUrl}
        alt={article.titleRu}
        className="article-image"
      />

      {/* Тема статьи — как бейдж */}
      <div className="article-theme">
        Тема: <span className="article-theme-label">{article.themeRu}</span>
      </div>

      {/* Заголовки */}
      <h1 className="article-title">{article.titleRu}</h1>
      <h2 className="article-title-arabic">{article.titleAr}</h2>

      {/* Описание */}
      {article.description && (
        <p className="article-description">{article.description}</p>
      )}

      {/* Текст статьи */}
      <div
        className="article-content rtl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Упражнения */}
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
    </div>
  );
};

export default ArticlePage;
