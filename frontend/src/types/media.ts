// src/types/media.ts

export type MediaType = 'video' | 'audio' | 'text';
export type MediaLevel = 'beginner' | 'intermediate' | 'advanced';

export interface MediaTopic {
	id: number;
	name: string;
}

export interface MediaDialect {
	id: number;
	name: string;
	region: string;
	slug?: string; // если используешь на фронте
}

export interface Media {
	id: number;
	title: string;
	type: MediaType;

	mediaUrl: string | null;
	previewUrl: string | null;
	subtitlesLink: string | null;
	grammarLink: string | null;

	level: MediaLevel;
	resources: Record<string, any> | null;

	duration: string | null;
	speaker: string | null;
	sourceRole: string | null;

	licenseType: string;
	licenseAuthor: string | null;

	createdAt: string;
	updatedAt: string;

	topics: MediaTopic[];
	dialect: MediaDialect | null;
	dialogueGroupId: number | null;
}

/**
 * Полный объект для страницы медиа `/media/:id`
 * (поля рейтинга + оценка пользователя)
 */
export interface MediaWithRating extends Media {
	averageRating: number;
	votes: number;
	userRating: number | null;
}
