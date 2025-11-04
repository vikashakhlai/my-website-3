import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SearchDto } from 'src/common/dto/search.dto';

export class FindMediaQueryDto extends IntersectionType(
  PaginationDto,
  SearchDto,
) {}
