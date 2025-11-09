import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      return await this.groupRepo.find({
        relations: ['medias', 'medias.dialect', 'medias.scripts'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении списка диалог-групп',
      );
    }
  }

  async findGroupById(id: number): Promise<DialogueGroup> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID диалог-группы должен быть положительным числом',
      );
    }

    try {
      const group = await this.groupRepo.findOne({
        where: { id },
        relations: ['medias', 'medias.dialect', 'medias.scripts'],
      });

      if (!group) {
        throw new NotFoundException('Диалог-группа не найдена');
      }
      return group;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при поиске диалог-группы');
    }
  }

  async createGroup(data: Partial<DialogueGroup>): Promise<DialogueGroup> {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Данные диалог-группы обязательны');
    }

    if (data.description && typeof data.description !== 'string') {
      throw new BadRequestException('Описание должно быть строкой');
    }

    try {
      const group = this.groupRepo.create(data);
      return await this.groupRepo.save(group);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при создании диалог-группы',
      );
    }
  }

  async updateGroup(
    id: number,
    data: Partial<DialogueGroup>,
  ): Promise<DialogueGroup> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID диалог-группы должен быть положительным числом',
      );
    }

    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    try {
      const group = await this.findGroupById(id);

      if (data.description && typeof data.description !== 'string') {
        throw new BadRequestException('Описание должно быть строкой');
      }

      Object.assign(group, data);
      return await this.groupRepo.save(group);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при обновлении диалог-группы',
      );
    }
  }

  async removeGroup(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID диалог-группы должен быть положительным числом',
      );
    }

    try {
      const result = await this.groupRepo.delete(id);
      if (!result.affected) {
        throw new NotFoundException('Диалог-группа не найдена');
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при удалении диалог-группы',
      );
    }
  }

  async createScript(
    mediaId: number,
    textOriginal: string,
    speakerName?: string,
    orderIndex?: number,
  ) {
    if (!mediaId || mediaId <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    if (
      !textOriginal ||
      typeof textOriginal !== 'string' ||
      textOriginal.trim() === ''
    ) {
      throw new BadRequestException('Оригинальный текст обязателен');
    }

    try {
      const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
      if (!media) throw new NotFoundException('Media не найдено');

      const script = this.scriptRepo.create({
        media,
        textOriginal,
        speakerName: speakerName || null,
        orderIndex: orderIndex ?? null,
      });

      return await this.scriptRepo.save(script);
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при создании реплики');
    }
  }

  async updateScript(id: number, data: Partial<DialogueScript>) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID реплики должен быть положительным числом',
      );
    }

    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    try {
      const script = await this.scriptRepo.findOne({ where: { id } });
      if (!script) throw new NotFoundException('Реплика не найдена');

      Object.assign(script, data);
      return await this.scriptRepo.save(script);
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при обновлении реплики');
    }
  }

  async deleteScript(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID реплики должен быть положительным числом',
      );
    }

    try {
      const result = await this.scriptRepo.delete(id);
      if (!result.affected) throw new NotFoundException('Реплика не найдена');
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при удалении реплики');
    }
  }

  async clearScriptsByMedia(mediaId: number): Promise<void> {
    if (!mediaId || mediaId <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    try {
      await this.scriptRepo.delete({ media: { id: mediaId } as any });
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при очистке реплик медиа');
    }
  }
}
