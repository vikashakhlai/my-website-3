import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDialectTopicDto {
  @ApiProperty({
    example: 'Отношения',
    description: 'Название темы диалекта',
  })
  @IsString({ message: 'name должно быть строкой' })
  @MinLength(2, { message: 'name должно быть не короче 2 символов' })
  @MaxLength(100, { message: 'name не может быть длиннее 100 символов' })
  name!: string;
}
