import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DialogueGroup } from './dialogue_group.entity';
import { DialogueScript } from './dialogue_script.entity';

@Injectable()
export class DialogueService {
  constructor(
    @InjectRepository(DialogueGroup)
    private readonly groupRepo: Repository<DialogueGroup>,

    @InjectRepository(DialogueScript)
    private readonly scriptRepo: Repository<DialogueScript>,
  ) {}

  async findAllGroups(): Promise<DialogueGroup[]> {
    return this.groupRepo.find({
      relations: ['medias', 'medias.dialect', 'medias.scripts'],
      order: { createdAt: 'DESC' },
    });
  }

  async findGroupById(id: number): Promise<DialogueGroup> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['medias', 'medias.dialect', 'medias.scripts'],
    });

    if (!group) throw new NotFoundException('Диалог-группа не найдена');
    return group;
  }

  async createScript(
    mediaId: number,
    textOriginal: string,
    textTranslated?: string,
  ) {
    const script = this.scriptRepo.create({
      media: { id: mediaId } as any,
      textOriginal,
      textTranslated,
    });
    return this.scriptRepo.save(script);
  }
}
