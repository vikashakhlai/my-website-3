import { ApiProperty } from '@nestjs/swagger';

export class QuoteDto {
  @ApiProperty({ example: 1, description: 'ID цитаты' })
  id!: number;

  @ApiProperty({ example: 'العلم نور', description: 'Цитата на арабском' })
  text_ar!: string;

  @ApiProperty({
    example: 'Наука — это свет',
    description: 'Цитата на русском',
  })
  text_ru!: string;
}
