import { PartialType } from '@nestjs/swagger';
import { CreateTextbookDto } from './create-textbook.dto';

/**
 * DTO для обновления учебника
 * Все поля опциональны
 */
export class UpdateTextbookDto extends PartialType(CreateTextbookDto) {}
