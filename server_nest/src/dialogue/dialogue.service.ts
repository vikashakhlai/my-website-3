import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DialogueGroup } from './dialogue_group.entity';
import { DialogueScript } from './dialogue_script.entity';
import { Media } from 'src/media/media.entity';

@Injectable()
export class DialogueService {
  constructor(
    @InjectRepository(DialogueGroup)
    private readonly groupRepo: Repository<DialogueGroup>,

    @InjectRepository(DialogueScript)
    private readonly scriptRepo: Repository<DialogueScript>,

    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
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

  /** ✍️ Создать новую реплику */
  async createScript(
    mediaId: number,
    textOriginal: string,
    speakerName?: string,
    orderIndex?: number,
  ) {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media не найдено');

    // ✅ создаём вручную объект, а не через create()
    const script = new DialogueScript();
    script.media = media;
    script.textOriginal = textOriginal;
    script.speakerName = speakerName || null;
    script.orderIndex = orderIndex ?? null;

    return await this.scriptRepo.save(script);
  }

  async clearScriptsByMedia(mediaId: number): Promise<void> {
    await this.scriptRepo.delete({ media: { id: mediaId } as any });
  }
}
