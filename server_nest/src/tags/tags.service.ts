import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tags.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll() {
    return this.tagRepo.find({
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateTagDto) {
    const existing = await this.tagRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException('Tag with this name already exists');
    }

    const tag = this.tagRepo.create(dto);
    return this.tagRepo.save(tag);
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    const duplicate = await this.tagRepo.findOne({
      where: { name: dto.name },
    });

    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException(
        'Another tag with this name already exists',
      );
    }

    Object.assign(tag, dto);
    return this.tagRepo.save(tag);
  }

  async remove(id: number) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    await this.tagRepo.remove(tag);
    return { message: 'Tag deleted' };
  }
}
