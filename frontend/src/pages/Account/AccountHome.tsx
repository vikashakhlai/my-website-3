import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SkeletonCard from "../../components/SkeletonCard";
import {
  AccountFavoriteItem,
  AccountFavoritesResponse,
  RecommendationItem,
  accountApi,
} from "../../api/account";
import { AccountContentCard } from "./AccountContentCard";
import styles from "./AccountHome.module.css";
import { useToast } from "../../context/ToastContext";

type FavoritesKey = keyof AccountFavoritesResponse;

type ContentItem =
  | AccountFavoritesResponse[FavoritesKey][number]
  | RecommendationItem;

const AccountHome = () => {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<AccountFavoritesResponse | null>(
    null
  );
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [trending, setTrending] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [normalizedDialects, setNormalizedDialects] = useState<
    AccountFavoriteItem[]
  >([]);

  const uniqueByKey = useCallback((items: ContentItem[]) => {
    const seen = new Map<string, ContentItem>();
    items.forEach((item) => {
      const key = `${item.type}-${item.id}`;
      if (!seen.has(key)) {
        seen.set(key, item);
      }
    });
    return Array.from(seen.values());
  }, []);

  const normalizeDialects = useCallback(
    (dialects?: AccountFavoriteItem[] | null) => {
      if (!dialects || !Array.isArray(dialects)) {
        setNormalizedDialects([]);
        return;
      }

      const mapped = dialects.map((item) => {
        const rawData: any = item.data ?? {};
        const mediaData = rawData.media ?? rawData;
        const ensuredDialect = mediaData.dialect
          ? mediaData.dialect
          : mediaData.dialectId
          ? {
              id: mediaData.dialectId,
              region: mediaData.region ?? "unknown",
            }
          : undefined;

        return {
          ...item,
          data: {
            ...mediaData,
            dialect: ensuredDialect,
          },
        };
      });

      setNormalizedDialects(mapped);
    },
    []
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [favoritesData, recommendationsData, trendingData] =
        await Promise.all([
          accountApi.getFavorites(),
          accountApi.getRecommendations(),
          accountApi.getTrending(8),
        ]);
      console.log("FAVORITES RAW:", favoritesData);
      console.log(
        "FAVORITES DIALECTS (detailed):",
        JSON.stringify(favoritesData?.dialects, null, 2)
      );

      setFavorites(favoritesData);
      normalizeDialects(favoritesData?.dialects);
      setRecommendations(recommendationsData);
      setTrending(trendingData);
    } catch (err) {
      console.error("Не удалось загрузить данные аккаунта:", err);
      setError(
        "Не удалось загрузить данные. Попробуйте обновить страницу позже."
      );
    } finally {
      setLoading(false);
    }
  }, [normalizeDialects]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    normalizeDialects(favorites?.dialects ?? null);
  }, [favorites?.dialects, normalizeDialects]);

  const handleRefreshRecommendations = async () => {
    try {
      setRefreshing(true);
      const data = await accountApi.getRecommendations();
      setRecommendations(data);
      showToast("Рекомендации обновлены", "success");
    } catch (err) {
      console.error("Ошибка обновления рекомендаций:", err);
      showToast("Не удалось обновить рекомендации", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const { sections, favoriteSets } = useMemo(() => {
    const favoriteBooks = favorites?.books ?? [];
    const favoriteTextbooks = favorites?.textbooks ?? [];
    const favoriteDialectsRaw = favorites?.dialects ?? [];
    const favoriteDialects = normalizedDialects;
    const favoriteArticles = favorites?.articles ?? [];
    const favoritePersonalities = favorites?.personalities ?? [];

    const trendingBooks = trending.filter((item) => item.type === "book");
    const trendingTextbooks = trending.filter(
      (item) => item.type === "textbook"
    );
    const trendingDialects = trending.filter((item) => item.type === "media");
    const trendingArticles = trending.filter((item) => item.type === "article");
    const trendingPersonalities = trending.filter(
      (item) => item.type === "personality"
    );

    const recommendedBooks = recommendations.filter(
      (item) => item.type === "book"
    );
    const recommendedTextbooks = recommendations.filter(
      (item) => item.type === "textbook"
    );
    const recommendedDialects = recommendations.filter(
      (item) => item.type === "media"
    );
    const recommendedArticles = recommendations.filter(
      (item) => item.type === "article"
    );
    const recommendedPersonalities = recommendations.filter(
      (item) => item.type === "personality"
    );

    const bookTagSets = favoriteBooks.map(
      (fav) =>
        new Set(
          (fav.data?.tags ?? [])
            .map((tag: any) =>
              (tag?.id ?? tag?.name ?? "").toString().toLowerCase()
            )
            .filter(Boolean)
        )
    );
    const bookAuthorSets = favoriteBooks.map(
      (fav) =>
        new Set(
          (fav.data?.authors ?? [])
            .map((author: any) =>
              (
                author?.id ??
                author?.full_name ??
                author?.fullName ??
                author?.name ??
                ""
              )
                .toString()
                .toLowerCase()
            )
            .filter(Boolean)
        )
    );

    const matchBook = (candidate: ContentItem) => {
      const data: any = candidate.data ?? {};
      const candidateTags = new Set(
        (data.tags ?? [])
          .map((tag: any) =>
            (tag?.id ?? tag?.name ?? "").toString().toLowerCase()
          )
          .filter(Boolean)
      );
      const candidateAuthors = new Set(
        (data.authors ?? [])
          .map((author: any) =>
            (
              author?.id ??
              author?.full_name ??
              author?.fullName ??
              author?.name ??
              ""
            )
              .toString()
              .toLowerCase()
          )
          .filter(Boolean)
      );

      return (
        bookTagSets.some((set) =>
          [...set].some((tag) => candidateTags.has(tag))
        ) ||
        bookAuthorSets.some((set) =>
          [...set].some((author) => candidateAuthors.has(author))
        )
      );
    };

    const favoriteLevels = new Set(
      favoriteTextbooks
        .map((item) => (item.data?.level ?? "").toString().toLowerCase())
        .filter(Boolean)
    );

    const matchTextbook = (candidate: ContentItem) => {
      const level = (candidate.data?.level ?? "").toString().toLowerCase();
      return favoriteLevels.size > 0 ? favoriteLevels.has(level) : false;
    };

    const favoriteRegions = new Set(
      favoriteDialects
        .map((item) =>
          (item.data?.dialect?.region ?? item.data?.region ?? "")
            .toString()
            .toLowerCase()
        )
        .filter(Boolean)
    );

    const matchDialect = (candidate: ContentItem) => {
      const region = (candidate.data?.dialect?.region ?? candidate.data?.region ?? "")
        .toString()
        .toLowerCase();
      return favoriteRegions.size > 0 ? favoriteRegions.has(region) : false;
    };

    const favoriteThemes = new Set(
      favoriteArticles
        .map((item) => {
          const data: any = item.data ?? {};
          return (data.themeSlug ?? data.theme?.slug ?? data.themeRu ?? "")
            .toString()
            .toLowerCase();
        })
        .filter(Boolean)
    );

    const matchArticle = (candidate: ContentItem) => {
      const data: any = candidate.data ?? {};
      const themeKey = (
        data.themeSlug ??
        data.theme?.slug ??
        data.themeRu ??
        ""
      )
        .toString()
        .toLowerCase();
      if (favoriteThemes.size > 0 && themeKey && favoriteThemes.has(themeKey)) {
        return true;
      }
      if (favoriteThemes.size === 0) return false;
      const candidateTags = new Set(
        (data.tags ?? [])
          .map((tag: any) =>
            (tag?.id ?? tag?.name ?? "").toString().toLowerCase()
          )
          .filter(Boolean)
      );
      return favoriteArticles.some((fav) => {
        const favTags = new Set(
          ((fav.data as any)?.tags ?? [])
            .map((tag: any) =>
              (tag?.id ?? tag?.name ?? "").toString().toLowerCase()
            )
            .filter(Boolean)
        );
        return [...favTags].some((tag) => candidateTags.has(tag));
      });
    };

    const favoriteEras = new Set(
      favoritePersonalities
        .map((item) => (item.data?.era ?? "").toString().toLowerCase())
        .filter(Boolean)
    );

    const matchPersonality = (candidate: ContentItem) => {
      const era = (candidate.data?.era ?? "").toString().toLowerCase();
      return favoriteEras.size > 0 ? favoriteEras.has(era) : false;
    };

    const buildSectionItems = (
      favoritesList: ContentItem[],
      similarCandidates: ContentItem[],
      fallback: ContentItem[],
      matcher: (candidate: ContentItem) => boolean,
      take: number
    ) => {
      const matched = matcher
        ? similarCandidates.filter((item) => matcher(item))
        : similarCandidates;

      const combined = uniqueByKey([
        ...favoritesList,
        ...(matched.length > 0 ? matched : []),
        ...similarCandidates,
        ...fallback,
      ]);

      return combined.slice(0, take);
    };

    const booksSectionItems = buildSectionItems(
      favoriteBooks,
      [...recommendedBooks, ...trendingBooks],
      trendingBooks,
      favoriteBooks.length ? matchBook : () => false,
      8
    );

    const textbooksSectionItems = buildSectionItems(
      favoriteTextbooks,
      [...recommendedTextbooks, ...trendingTextbooks],
      trendingTextbooks,
      favoriteTextbooks.length ? matchTextbook : () => false,
      8
    );

    const dialSectionItems = buildSectionItems(
      favoriteDialects,
      [...recommendedDialects, ...trendingDialects],
      trendingDialects,
      favoriteDialects.length ? matchDialect : () => false,
      8
    );

    console.log("✅ DIAL SECTIONS:", {
      favoritesCount: favoriteDialectsRaw.length,
      normalizedCount: favoriteDialects.length,
      renderedCount: dialSectionItems.length,
    });

    const articleSectionItems = buildSectionItems(
      favoriteArticles,
      [...recommendedArticles, ...trendingArticles],
      trendingArticles,
      favoriteArticles.length ? matchArticle : () => false,
      6
    );

    const personalitySectionItems = buildSectionItems(
      favoritePersonalities,
      [...recommendedPersonalities, ...trendingPersonalities],
      trendingPersonalities,
      favoritePersonalities.length ? matchPersonality : () => false,
      8
    );

    const sectionsList = [
      {
        id: "books-favorites",
        title: "Ваши книги и похожие произведения",
        description: "Любимые книги и подборки с похожими темами и авторами.",
        layout: "grid" as const,
        items: booksSectionItems,
        emptyLink: "/books",
        skeleton: "book" as const,
        tagLabels: {
          favorite: "Из избранного",
          recommended: "Рекомендация",
        },
      },
      {
        id: "study",
        title: "Учебные материалы по вашему уровню",
        description:
          "Учебники и курсы, подходящие под ваш текущий уровень владения языком.",
        layout: "grid" as const,
        items: textbooksSectionItems,
        emptyLink: "/textbooks",
        skeleton: "textbook" as const,
        tagLabels: {
          favorite: "Из избранного",
          recommended: "Рекомендация",
        },
      },
      {
        id: "dialects",
        title: "Диалекты региона, который вы изучаете",
        description:
          "Медиа и упражнения по выбранным диалектам и соседним регионам.",
        layout: "grid" as const,
        items: dialSectionItems,
        emptyLink: "/dialects",
        skeleton: "dialect" as const,
        tagLabels: {
          favorite: "Из избранного",
          recommended: "Рекомендация",
        },
      },
      {
        id: "articles",
        title: "Похожие статьи",
        description: "Материалы на близкие вам темы и теги.",
        layout: "list" as const,
        items: articleSectionItems,
        emptyLink: "/articles",
        skeleton: "article" as const,
        tagLabels: {
          favorite: "Из избранного",
          recommended: "Рекомендация",
        },
      },
      {
        id: "personalities",
        title: "Личности той же эпохи",
        description: "Истории и биографии людей из той же исторической эпохи.",
        layout: "grid" as const,
        items: personalitySectionItems,
        emptyLink: "/personalities",
        skeleton: "personality" as const,
        tagLabels: {
          favorite: "Из избранного",
          recommended: "Рекомендация",
        },
      },
    ];

    const favoriteSetMap: Record<string, Set<string>> = {
      "books-favorites": new Set(
        favoriteBooks.map((item) => `${item.type}-${item.id}`)
      ),
      study: new Set(
        favoriteTextbooks.map((item) => `${item.type}-${item.id}`)
      ),
      dialects: new Set(
        favoriteDialectsRaw.map((item) => `${item.type}-${item.id}`)
      ),
      articles: new Set(
        favoriteArticles.map((item) => `${item.type}-${item.id}`)
      ),
      personalities: new Set(
        favoritePersonalities.map((item) => `${item.type}-${item.id}`)
      ),
    };

    return { sections: sectionsList, favoriteSets: favoriteSetMap };
  }, [favorites, normalizedDialects, recommendations, trending, uniqueByKey]);

  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}

      {sections.map((section, index) => {
        const isList = section.layout === "list";
        const containerClass = isList ? styles.articleList : styles.grid;
        const itemClass = isList ? styles.listItem : styles.gridItem;
        const hasItems = section.items.length > 0;

        return (
          <Fragment key={section.id}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <p className={styles.sectionDescription}>
                    {section.description}
                  </p>
                </div>
                {section.id === "books-favorites" && (
                  <button
                    type="button"
                    className={styles.refreshButton}
                    onClick={handleRefreshRecommendations}
                    disabled={refreshing}
                  >
                    {refreshing ? "Обновляем..." : "Обновить рекомендации"}
                  </button>
                )}
              </div>

              {loading ? (
                <SkeletonCard
                  variant={section.skeleton}
                  count={section.layout === "list" ? 3 : 4}
                  layout={section.layout === "list" ? "list" : "grid"}
                />
              ) : hasItems ? (
                <div
                  className={[
                    containerClass,
                    section.id === "books-favorites" ? styles.booksGrid : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {section.items.map((item) => {
                    const contentKey = `${item.type}-${item.id}`;
                    const isFavorite =
                      favoriteSets[section.id]?.has(contentKey) ?? false;
                    const badgeClass = isFavorite
                      ? styles.tagFavorite
                      : styles.tagRecommendation;
                    const badgeLabel = isFavorite
                      ? section.tagLabels.favorite
                      : section.tagLabels.recommended;

                    return (
                      <div
                        className={`${itemClass} ${styles.fadeItem}`}
                        key={contentKey}
                      >
                        <AccountContentCard item={item} />
                        <span className={badgeClass}>{badgeLabel}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>
                    Пока ничего не добавлено. Посмотрите наши подборки или
                    начните с диалектов.
                  </p>
                  <Link to={section.emptyLink} className={styles.emptyButton}>
                    Открыть подборку
                  </Link>
                </div>
              )}
            </section>
            {index < sections.length - 1 && (
              <div className={styles.sectionDivider} aria-hidden="true" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default AccountHome;
