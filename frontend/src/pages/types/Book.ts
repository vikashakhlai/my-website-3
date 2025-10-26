export interface Book {
  id: number;
  title: string;
  publisher: string | null;
  description: string | null;
  authors: { id: number; full_name: string }[];
  publication_year: number | null;
  cover_url: string | null;
  tags: { id: number; name: string }[];
}
