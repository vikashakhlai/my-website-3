import { ApiProperty } from '@nestjs/swagger';

export class NormalizedAuthor {
  @ApiProperty({ example: 1, description: 'ID автора' })
  id!: number;

  @ApiProperty({ example: 'Ибн Сина', description: 'Полное имя' })
  full_name!: string;
}

export class NormalizedTag {
  @ApiProperty({ example: 1, description: 'ID тега' })
  id!: number;

  @ApiProperty({ example: 'история', description: 'Название' })
  name!: string;
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
