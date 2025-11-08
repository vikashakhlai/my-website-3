import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для валидации UUID идентификатора
 * 
 * Используется для параметров пути, содержащих UUID сущности.
 * Гарантирует, что ID является валидным UUID версии 4.
 * 
 * @example
 * {
 *   "id": "f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3"
 * }
 */
export class UuidDto {
  @ApiProperty({
    description: 'Уникальный идентификатор сущности в формате UUID v4',
    example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3',
    type: String,
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID должен быть валидным UUID версии 4' })
  id!: string;
}
