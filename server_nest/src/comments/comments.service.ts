import {
  ForbiddenException,
  Injectable,
  MessageEvent,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';
import { User } from 'src/user/user.entity';
import { CommentReaction } from './comment-reaction.entity';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

import { Observable, Subject, map } from 'rxjs';

export type StreamEvent =
  | { type: 'created'; comment: Comment }
  | { type: 'react'; comment: Comment }
  | { type: 'deleted'; id: number };

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(CommentReaction)
    private readonly reactionRepo: Repository<CommentReaction>,
  ) {}

  private streams = new Map<string, Subject<StreamEvent>>();

  private getStream(target_type: TargetType, target_id: number) {
    const key = `${target_type}:${target_id}`;
    if (!this.streams.has(key)) {
      this.streams.set(key, new Subject<StreamEvent>());
    }
    return this.streams.get(key)!;
  }

  subscribe(
    target_type: TargetType,
    target_id: number,
  ): Observable<MessageEvent> {
    return this.getStream(target_type, target_id).pipe(
      map((event) => ({
        data: event,
      })),
    );
  }

  async create(dto: CreateCommentDto, user: User): Promise<Comment> {
    const entity = this.commentRepository.create({
      ...dto,
      user,
      user_id: user.id,
      parent: dto.parent_id ? ({ id: dto.parent_id } as any) : null,
    });

    const saved = await this.commentRepository.save(entity);

    this.getStream(dto.target_type, dto.target_id).next({
      type: 'created',
      comment: saved,
    });

    return saved;
  }

  async findByTarget(
    target_type: TargetType,
    target_id: number,
    viewerUserId?: string,
  ) {
    const list = await this.commentRepository.find({
      where: { target_type, target_id },
      relations: ['user', 'replies', 'replies.user'],
      order: { created_at: 'ASC' },
    });

    if (!viewerUserId || list.length === 0) return list;

    const ids = list.flatMap((c) => [
      c.id,
      ...(c.replies?.map((r) => r.id) ?? []),
    ]);

    const reactions = await this.reactionRepo.find({
      where: { user_id: viewerUserId, comment_id: In(ids) },
    });

    const map = new Map<number, 1 | -1>();
    reactions.forEach((r) => map.set(r.comment_id, r.value));

    const attach = (c: Comment) => ({
      ...c,
      my_reaction: (map.get(c.id) ?? 0) as 1 | -1 | 0,
      replies: c.replies?.map((r) => attach(r)) as any,
    });

    return list.map((c) => attach(c));
  }

  async react(commentId: number, user: User, value: 1 | -1 | 0) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    let existing = await this.reactionRepo.findOne({
      where: { comment_id: commentId, user_id: user.id },
    });

    let deltaLike = 0;
    let deltaDislike = 0;

    if (!existing) {
      if (value === 0) return comment;
      existing = this.reactionRepo.create({
        comment_id: commentId,
        user_id: user.id,
        value,
      });
      await this.reactionRepo.save(existing);
      if (value === 1) deltaLike = +1;
      else deltaDislike = +1;
    } else {
      if (value === 0) {
        if (existing.value === 1) deltaLike = -1;
        if (existing.value === -1) deltaDislike = -1;
        await this.reactionRepo.remove(existing);
      } else if (existing.value === value) {
        if (value === 1) deltaLike = -1;
        else deltaDislike = -1;
        await this.reactionRepo.remove(existing);
      } else {
        if (value === 1) {
          deltaLike = +1;
          deltaDislike = -1;
        } else {
          deltaLike = -1;
          deltaDislike = +1;
        }
        existing.value = value;
        await this.reactionRepo.save(existing);
      }
    }

    if (deltaLike !== 0 || deltaDislike !== 0) {
      await this.commentRepository
        .createQueryBuilder()
        .update(Comment)
        .set({
          likes_count: () => `likes_count + (${deltaLike})`,
          dislikes_count: () => `dislikes_count + (${deltaDislike})`,
        })
        .where('id = :id', { id: commentId })
        .execute();
    }

    const updated = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'replies', 'replies.user'],
    });

    this.getStream(comment.target_type, comment.target_id).next({
      type: 'react',
      comment: updated!,
    });

    return updated;
  }

  async delete(id: number, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(user.role);

    if (comment.user.id !== user.id && !isAdmin) {
      throw new ForbiddenException('Вы не можете удалить этот комментарий');
    }

    await this.commentRepository.remove(comment);

    this.getStream(comment.target_type, comment.target_id).next({
      type: 'deleted',
      id,
    });
  }
}
