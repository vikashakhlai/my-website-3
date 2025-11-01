import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  text_ar!: string;

  @IsString()
  @IsNotEmpty()
  text_ru!: string;

  @IsOptional()
  @IsInt()
  personalityId?: number | null;
}
