import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';

/**
 * DTO для создания автора
 */
export class CreateAuthorDto {
  @ApiProperty({
    description: 'Полное имя автора',
    example: 'Ахмед Шауки',
    type: String,
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fullName!: string;

  @ApiPropertyOptional({
    description: 'Биография автора',
    example: 'Выдающийся арабский поэт и драматург, один из величайших поэтов арабского языка',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL фотографии автора',
    example: '/uploads/authors/ahmed-shawki.jpg',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
