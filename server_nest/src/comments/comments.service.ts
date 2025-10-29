import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/user/user.entity';
import { CommentReaction } from './comment-reaction.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentReaction)
    private readonly reactionRepo: Repository<CommentReaction>,
  ) {}

  // --- Создание комментария ---
  async create(dto: CreateCommentDto, user: User): Promise<Comment> {
    const entity = this.commentRepository.create({
      ...dto,
      user,
      user_id: user.id,
      parent: dto.parent_id ? ({ id: dto.parent_id } as any) : null,
    });
    return this.commentRepository.save(entity);
  }

  // --- Получить комментарии по сущности (+ my_reaction, если передан userId) ---
  async findByTarget(
    target_type: 'book' | 'article' | 'media' | 'personality' | 'textbook',
    target_id: number,
    viewerUserId?: string,
  ): Promise<Array<Comment & { my_reaction?: 1 | -1 | 0 }>> {
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

    const attach = (c: Comment): Comment & { my_reaction?: 1 | -1 | 0 } => ({
      ...c,
      my_reaction: (map.get(c.id) ?? 0) as 1 | -1 | 0,
      replies: c.replies?.map((r) => attach(r)) as any,
    });

    return list.map((c) => attach(c));
  }

  // --- Реакция (лайк/дизлайк/снятие) ---
  // value: 1 = like, -1 = dislike, 0 = снять реакцию
  async react(commentId: number, user: User, value: 1 | -1 | 0) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    let existing = await this.reactionRepo.findOne({
      where: { comment_id: commentId, user_id: user.id },
    });

    // вычисляем дельты для счетчиков
    let deltaLike = 0;
    let deltaDislike = 0;

    if (!existing) {
      if (value === 0) return comment; // нечего снимать
      // вставка новой реакции
      existing = this.reactionRepo.create({
        comment_id: commentId,
        user_id: user.id,
        value: value as 1 | -1,
      });
      await this.reactionRepo.save(existing);
      if (value === 1) deltaLike = +1;
      else if (value === -1) deltaDislike = +1;
    } else {
      if (value === 0) {
        // снять реакцию
        if (existing.value === 1) deltaLike = -1;
        if (existing.value === -1) deltaDislike = -1;
        await this.reactionRepo.remove(existing);
      } else if (existing.value === value) {
        // повторный клик по той же — снять
        if (value === 1) deltaLike = -1;
        else deltaDislike = -1;
        await this.reactionRepo.remove(existing);
      } else {
        // переключение like <-> dislike
        if (value === 1) {
          deltaLike = +1;
          deltaDislike = -1;
        } else {
          deltaLike = -1;
          deltaDislike = +1;
        }
        existing.value = value as 1 | -1;
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

    // вернуть актуальный комментарий
    return this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'replies', 'replies.user'],
    });
  }

  // --- Удалить комментарий (только автор или админ/суперадмин) ---
  async delete(id: number, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (comment.user.id !== user.id && !isAdmin) {
      throw new ForbiddenException('Вы не можете удалить этот комментарий');
    }
    await this.commentRepository.remove(comment);
  }
}
