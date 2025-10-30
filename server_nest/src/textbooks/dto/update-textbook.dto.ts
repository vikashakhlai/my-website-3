import { PartialType } from '@nestjs/mapped-types';
import { CreateTextbookDto } from './create-textbook.dto';

// Позволяет обновлять только часть полей
export class UpdateTextbookDto extends PartialType(CreateTextbookDto) {}
