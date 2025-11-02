import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { DialogueService } from './dialogue.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dialogues')
@Controller('dialogues')
export class DialogueController {
  constructor(private readonly dialogueService: DialogueService) {}

  /** 📜 Получить список всех диалогов (требуется авторизация) */
  @ApiOperation({
    summary: 'Получить список диалогов (авторизованные пользователи)',
  })
  @Get()
  findAll() {
    return this.dialogueService.findAllGroups();
  }

  /** 🔍 Получить один диалог (требуется авторизация) */
  @ApiOperation({
    summary: 'Получить один диалог (авторизованные пользователи)',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dialogueService.findGroupById(id);
  }

  /** ➕ Создать диалог (ADMIN, SUPER_ADMIN) */
  @ApiOperation({ summary: 'Создать диалог (ADMIN, SUPER_ADMIN)' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() data: any) {
    return this.dialogueService.createGroup(data);
  }

  /** ♻️ Обновить диалог (ADMIN, SUPER_ADMIN) */
  @ApiOperation({ summary: 'Обновить диалог (ADMIN, SUPER_ADMIN)' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.dialogueService.updateGroup(id, data);
  }

  /** 🗑 Удалить диалог (ADMIN, SUPER_ADMIN) */
  @ApiOperation({ summary: 'Удалить диалог (ADMIN, SUPER_ADMIN)' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dialogueService.removeGroup(id);
  }
}
