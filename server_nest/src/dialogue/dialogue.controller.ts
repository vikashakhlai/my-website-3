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
import { Role } from 'src/auth/roles.enum';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { DialogueService } from './dialogue.service';
import { CreateDialogueGroupDto } from './dto/create-dialogue-group.dto';
import { DialogueGroupResponseDto } from './dto/dialogue-group-response.dto';
import { UpdateDialogueGroupDto } from './dto/update-dialogue-group.dto';

@ApiTags('Dialogues')
@Controller('dialogues')
export class DialogueController {
  constructor(private readonly dialogueService: DialogueService) {}

  @ApiOperation({
    summary: 'Получить список диалогов (авторизованные пользователи)',
  })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Список диалогов',
    type: [DialogueGroupResponseDto],
  })
  @Get()
  async findAll(): Promise<DialogueGroupResponseDto[]> {
    const groups = await this.dialogueService.findAllGroups();
    return groups.map((g) => mapToDto(DialogueGroupResponseDto, g));
  }

  @ApiOperation({
    summary: 'Получить один диалог (авторизованные пользователи)',
  })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiParam({ name: 'id', example: 1, description: 'ID группы диалога' })
  @ApiResponse({
    status: 200,
    description: 'Информация о диалоге',
    type: DialogueGroupResponseDto,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DialogueGroupResponseDto> {
    const group = await this.dialogueService.findGroupById(id);
    return mapToDto(DialogueGroupResponseDto, group);
  }

  @ApiOperation({ summary: 'Создать диалог (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Диалог создан',
    type: DialogueGroupResponseDto,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() dto: CreateDialogueGroupDto,
  ): Promise<DialogueGroupResponseDto> {
    const group = await this.dialogueService.createGroup(dto);
    return mapToDto(DialogueGroupResponseDto, group);
  }

  @ApiOperation({ summary: 'Обновить диалог (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID группы диалога' })
  @ApiResponse({
    status: 200,
    description: 'Диалог обновлен',
    type: DialogueGroupResponseDto,
  })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDialogueGroupDto,
  ): Promise<DialogueGroupResponseDto> {
    const group = await this.dialogueService.updateGroup(id, dto);
    return mapToDto(DialogueGroupResponseDto, group);
  }

  @ApiOperation({ summary: 'Удалить диалог (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID группы диалога' })
  @ApiResponse({ status: 200, description: 'Диалог удален', type: Object })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.dialogueService.removeGroup(id);
    return { success: true };
  }
}
