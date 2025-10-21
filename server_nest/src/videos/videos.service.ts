import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { Dialect } from './dialect.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    @InjectRepository(Dialect)
    private readonly dialectRepo: Repository<Dialect>,
  ) {}

  async getVideos(dialectSlug?: string) {
    const qb = this.videoRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.dialect', 'd')
      .orderBy('v.createdAt', 'DESC');

    if (dialectSlug) {
      qb.where('d.slug = :slug', { slug: dialectSlug });
    }

    return qb.getMany();
  }

  async getById(id: number) {
    const video = await this.videoRepo.findOne({
      where: { id },
      relations: ['dialect'],
    });
    if (!video) throw new NotFoundException('Видео не найдено');
    return video;
  }
}
