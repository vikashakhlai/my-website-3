import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO для создания издательства
 */
export class CreatePublisherDto {
  @ApiProperty({
    description: 'Название издательства',
    example: 'دار الشروق',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name!: string;
}

/**
 * DTO для обновления издательства
 */
export class UpdatePublisherDto {
  @ApiPropertyOptional({
    description: 'Название издательства',
    example: 'دار الشروق',
    type: String,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;
}

