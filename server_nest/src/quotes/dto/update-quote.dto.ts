import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  text_ar?: string;

  @IsOptional()
  @IsString()
  text_ru?: string;

  @IsOptional()
  @IsInt()
  personalityId?: number | null;
}
