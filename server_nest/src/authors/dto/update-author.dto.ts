import { PartialType } from '@nestjs/swagger';
import { CreateAuthorDto } from './create-author.dto';

/**
 * DTO для обновления автора
 * Все поля опциональны
 */
export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}
