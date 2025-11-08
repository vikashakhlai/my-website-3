import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from 'src/media/media.entity';
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

    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  async findAllGroups(): Promise<DialogueGroup[]> {
    return await this.groupRepo.find({
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

  async createGroup(data: Partial<DialogueGroup>): Promise<DialogueGroup> {
    const group = this.groupRepo.create(data);
    return await this.groupRepo.save(group);
  }

  async updateGroup(
    id: number,
    data: Partial<DialogueGroup>,
  ): Promise<DialogueGroup> {
    const group = await this.findGroupById(id);
    Object.assign(group, data);
    return await this.groupRepo.save(group);
  }

  async removeGroup(id: number): Promise<void> {
    const result = await this.groupRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Группа не найдена');
  }

  async createScript(
    mediaId: number,
    textOriginal: string,
    speakerName?: string,
    orderIndex?: number,
  ) {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media не найдено');

    const script = this.scriptRepo.create({
      media,
      textOriginal,
      speakerName: speakerName || null,
      orderIndex: orderIndex ?? null,
    });

    return await this.scriptRepo.save(script);
  }

  async updateScript(id: number, data: Partial<DialogueScript>) {
    const script = await this.scriptRepo.findOne({ where: { id } });
    if (!script) throw new NotFoundException('Реплика не найдена');

    Object.assign(script, data);
    return await this.scriptRepo.save(script);
  }

  async deleteScript(id: number): Promise<void> {
    const result = await this.scriptRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Реплика не найдена');
  }

  async clearScriptsByMedia(mediaId: number): Promise<void> {
    await this.scriptRepo.delete({ media: { id: mediaId } as any });
  }
}
