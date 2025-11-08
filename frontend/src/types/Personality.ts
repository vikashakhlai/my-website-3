import { Era } from './era';

export interface PersonalityPreview {
	id: number;
	name: string;
	years: string;
	position: string;
	facts?: string[];
	imageUrl: string;

	// ⭐ Рейтинг (для краткого отображения)
	averageRating?: number | null;
	ratingCount?: number;
}

export interface Personality extends PersonalityPreview {
	biography: string;

	books: string[];
	book_ids: number[];
	book_covers: string[];

	articles: string[];
	article_ids: number[];

	era?: Era;

	// ⭐ Для страницы личности — показываем рейтинг пользователя
	userRating?: number | null;

	// 💬 Количество комментариев
	commentsCount?: number;
}
