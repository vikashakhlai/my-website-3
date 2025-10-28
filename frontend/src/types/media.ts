import { Dialect } from "./dialect";

export interface Media {
  id: number;
  title: string;
  mediaUrl: string;
  previewUrl?: string;
  type: "audio" | "video";
  licenseType?: string;
  licenseAuthor?: string;
  subtitlesLink?: string;
  dialect?: Dialect;
  level?: "beginner" | "intermediate" | "advanced";
  topics?: { id: number; name: string }[];
  duration?: string;
  speaker?: string;
  sourceRole?: string;
}