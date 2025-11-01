import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MinLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Куделин А.А.' })
  @IsString()
  @MinLength(3)
  fullName!: string;

  @ApiProperty({
    example: 'Лучший писатель русского происхождения...',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'https://example.com/azimov.jpg', required: false })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
