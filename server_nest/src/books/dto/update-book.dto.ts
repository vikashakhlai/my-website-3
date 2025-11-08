import { PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';

/**
 * DTO для обновления книги
 * Все поля опциональны
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}
