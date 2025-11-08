import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { DialogueService } from './dialogue.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/roles.enum';
import { DialogueGroupResponseDto } from './dto/dialogue-group-response.dto';
import { CreateDialogueGroupDto, UpdateDialogueGroupDto } from './dto/create-dialogue-group.dto';
import { DialogueGroup } from './dialogue_group.entity';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';

@ApiTags('Dialogues')
@Controller('dialogues')
export class DialogueController {
  constructor(private readonly dialogueService: DialogueService) {}

  /** 📜 Получить список всех диалогов (только авторизованные) */
  @ApiOperation({
    summary: 'Получить список всех групп диалогов',
    description:
      'Возвращает список всех групп диалогов с связанными медиа-файлами и репликами. ' +
      'Требуется авторизация.',
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiOkResponse({
    description: 'Список групп диалогов успешно получен',
    type: [DialogueGroupResponseDto],
    example: [
      {
        id: 1,
        title: 'Диалог в ресторане',
        description: 'Разговор о заказе еды в ресторане',
        baseLanguage: 'fusha',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        medias: [
          {
            id: 5,
            title: 'Диалог в ресторане (фусха)',
            dialect: null,
            scripts: [
              {
                id: 1,
                textOriginal: 'مرحبا، كيف حالك؟',
                speakerName: 'Официант',
                orderIndex: 1,
                createdAt: '2024-01-15T10:30:00.000Z',
                updatedAt: '2024-01-15T10:30:00.000Z',
              },
            ],
          },
        ],
      },
    ],
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация для доступа к списку диалогов',
  })
  @Get()
  async findAll() {
    const groups = await this.dialogueService.findAllGroups();
    return groups.map((g) => mapToDto(DialogueGroupResponseDto, g));
  }

  /** 🔍 Получить один диалог (только авторизованные) */
  @ApiOperation({
    summary: 'Получить группу диалогов по ID',
    description:
      'Возвращает полную информацию о группе диалогов, включая все связанные медиа-файлы ' +
      'и реплики (скрипты). Требуется авторизация.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор группы диалогов',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Группа диалогов успешно получена',
    type: DialogueGroupResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Группа диалогов с указанным ID не найдена',
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
  })
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const group = await this.dialogueService.findGroupById(id);
    return mapToDto(DialogueGroupResponseDto, group);
  }

  /** ➕ Создать диалог (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Создать новую группу диалогов (ADMIN, SUPER_ADMIN)',
    description:
      'Создаёт новую группу диалогов. Требуются права ADMIN или SUPER_ADMIN. ' +
      'После создания можно добавить медиа-файлы и реплики.',
  })
  @ApiCreatedResponse({
    description: 'Группа диалогов успешно создана',
    type: DialogueGroupResponseDto,
  })
  @ApiErrorResponses({ include404: false })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  async create(@Body() dto: CreateDialogueGroupDto) {
    // Преобразуем null в undefined для совместимости с Partial<DialogueGroup>
    const data = {
      ...dto,
      description: dto.description ?? undefined,
    };
    const group = await this.dialogueService.createGroup(data);
    return mapToDto(DialogueGroupResponseDto, group);
  }

  /** ♻️ Обновить диалог (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Обновить группу диалогов (ADMIN, SUPER_ADMIN)',
    description: 'Обновляет информацию о группе диалогов. Требуются права ADMIN или SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор группы диалогов',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Группа диалогов успешно обновлена',
    type: DialogueGroupResponseDto,
  })
  @ApiErrorResponses()
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDialogueGroupDto,
  ) {
    // Преобразуем null в undefined для совместимости с Partial<DialogueGroup>
    const data: Partial<DialogueGroup> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) {
      data.description = (dto.description === null ? undefined : dto.description) as string | undefined;
    }
    if (dto.baseLanguage !== undefined) data.baseLanguage = dto.baseLanguage;
    const group = await this.dialogueService.updateGroup(id, data);
    return mapToDto(DialogueGroupResponseDto, group);
  }

  /** 🗑 Удалить диалог (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Удалить группу диалогов (ADMIN, SUPER_ADMIN)',
    description: 'Удаляет группу диалогов из системы. Требуются права ADMIN или SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор группы диалогов',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Группа диалогов успешно удалена',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Группа диалогов успешно удалена' },
      },
    },
  })
  @ApiErrorResponses({ include400: false })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.dialogueService.removeGroup(id);
    return { message: 'Группа диалогов успешно удалена' };
  }
}
