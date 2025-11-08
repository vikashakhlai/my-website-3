import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { TargetType } from 'src/common/enums/target-type.enum';

export class CreateFavoriteDto {
  @ApiProperty({
    enum: TargetType,
    description: 'Тип цели (BOOK, TEXTBOOK, ARTICLE, MEDIA, PERSONALITY)',
    example: TargetType.BOOK,
  })
  @IsEnum(TargetType, {
    message: 'targetType должен быть допустимым значением',
  })
  targetType!: TargetType;

  @ApiProperty({
    example: 1,
    description: 'ID цели (например, ID книги)',
  })
  @IsInt({ message: 'targetId должен быть целым числом' })
  targetId!: number;
}
