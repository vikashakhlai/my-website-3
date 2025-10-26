import { Era } from "./era";

export interface PersonalityPreview {
  id: number;
  name: string;
  years: string;
  position: string;
  facts?: string[];
  imageUrl: string;
}

export interface Personality extends PersonalityPreview {
  biography: string;
  books: string[];
  book_ids: number[];
  book_covers: string[];
  articles: string[];
  article_ids: number[];
  era?: Era;
}


