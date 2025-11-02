export type MediaType = "video" | "audio" | "text";

export interface Media {
  id: number;
  title: string;
  name?: string;
  previewUrl?: string;
  mediaUrl: string;
  subtitlesLink?: string | null;
  dialectId: number | null;
  licenseType?: string;
  licenseAuthor?: string;
  type: MediaType;
  tags?: string[];
  dialogueGroupId?: number | null;
  dialect?: { name: string };
  duration?: string;
  level?: "beginner" | "intermediate" | "advanced" | null;
  speaker?: string;
  isFavorite?: boolean;
  averageRating?: number | null;
  userRating?: number | null;
  ratingCount?: number;
}
