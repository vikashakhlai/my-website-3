import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/roles.enum';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { AuthorsService } from './authors.service';
import { AuthorListResponseDto } from './dto/author-list-response.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Public()
  @ApiOperation({ summary: 'Получить автора с его книгами (публично)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID автора' })
  @ApiResponse({
    status: 200,
    description: 'Информация об авторе',
    type: AuthorResponseDto,
  })
  @Get(':id')
  async getAuthor(@Param('id', ParseIntPipe) id: number) {
    const result = await this.authorsService.getAuthorById(id);

    return {
      id: result.id,
      full_name: result.full_name,
      bio: result.bio,
      photo_url: result.photo_url,
      books: result.books,
    };
  }

  @Public()
  @ApiOperation({ summary: 'Получить список всех авторов (публично)' })
  @ApiResponse({
    status: 200,
    description: 'Список авторов',
    type: [AuthorListResponseDto],
  })
  @Get()
  async getAllAuthors() {
    const authors = await this.authorsService.getAllAuthors();
    return authors.map((a) => mapToDto(AuthorListResponseDto, a));
  }

  @ApiOperation({ summary: 'Создать автора (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiResponse({ status: 201, description: 'Автор создан', type: Object })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateAuthorDto) {
    return await this.authorsService.createAuthor(dto);
  }

  @ApiOperation({ summary: 'Обновить данные автора (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID автора' })
  @ApiResponse({ status: 200, description: 'Автор обновлён', type: Object })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return await this.authorsService.updateAuthor(id, dto);
  }

  @ApiOperation({ summary: 'Удалить автора (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID автора' })
  @ApiResponse({ status: 200, description: 'Автор удалён', type: Object })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.authorsService.deleteAuthor(id);
  }
}
