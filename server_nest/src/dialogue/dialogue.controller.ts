import { Controller, Get, Param } from '@nestjs/common';
import { DialogueService } from './dialogue.service';

@Controller('dialogues')
export class DialogueController {
  constructor(private readonly dialogueService: DialogueService) {}

  @Get()
  findAll() {
    return this.dialogueService.findAllGroups();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.dialogueService.findGroupById(id);
  }
}
