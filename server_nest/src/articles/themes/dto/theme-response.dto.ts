import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ThemeResponseDto {
  @ApiProperty({ example: 1, description: 'ID темы' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Литература', description: 'Название на русском' })
  @Expose()
  name_ru!: string;

  @ApiProperty({ example: 'أدب', description: 'Название на арабском' })
  @Expose()
  name_ar!: string;

  @ApiProperty({ example: 'literature', description: 'Slug темы' })
  @Expose()
  slug!: string;
}
