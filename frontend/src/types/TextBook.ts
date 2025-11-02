export interface TextBookProps {
  id: number;
  title: string;
  authors: string | null;
  cover_image_url: string;
  publication_year: number | null;
  level: string | null;
  description: string | null;
  pdf_url: string | null;
  averageRating: number | null;
  userRating: number | null;
  canDownload: boolean;
}
