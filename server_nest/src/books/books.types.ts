// src/books/books.types.ts

export interface NormalizedAuthor {
  id: number;
  full_name: string;
}

export interface NormalizedTag {
  id: number;
  name: string;
}

export interface NormalizedBook {
  id: number;
  title: string;
  description: string;
  publication_year: number;
  cover_url: string;
  pages: number;
  publisher_id: number;
  created_at: Date;

  authors: NormalizedAuthor[];
  tags: NormalizedTag[];
}
